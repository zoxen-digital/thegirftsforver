import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Order, Product, nextSeq } from '@/lib/models';
import { deliveryFee, salePrice } from '@/lib/utils';

export const runtime = 'nodejs';

const str = (v, max = 300) => String(v ?? '').trim().slice(0, max);

/** Creates an order. Prices are recomputed from the database — client prices are never trusted. */
export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body?.items?.length) return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 });

  const customer = { name: str(body.customer?.name, 80), phone: str(body.customer?.phone, 30), email: str(body.customer?.email, 120), country: str(body.customer?.country, 60) };
  const receiver = { name: str(body.receiver?.name, 80), phone: str(body.receiver?.phone, 30), address: str(body.receiver?.address, 500), city: str(body.receiver?.city, 60) };
  if (!customer.name || !customer.phone || !receiver.name || !receiver.phone || !receiver.address || !receiver.city) {
    return NextResponse.json({ error: 'Please fill all required fields' }, { status: 400 });
  }

  const paymentProof = str(body.paymentProof, 200);
  if (!paymentProof.startsWith('/api/uploads/misc/')) return NextResponse.json({ error: 'Please upload your payment screenshot' }, { status: 400 });

  await dbConnect();
  const ids = body.items.slice(0, 50).map((i) => i.productId);
  const products = await Product.find({ _id: { $in: ids }, active: true }).lean();
  const byId = Object.fromEntries(products.map((p) => [String(p._id), p]));

  const items = [];
  for (const it of body.items.slice(0, 50)) {
    const p = byId[it.productId];
    if (!p) continue;
    let price = salePrice(p.price);
    for (const [group, val] of Object.entries(it.variations || {})) {
      const opt = p.variations?.[group]?.find((o) => o.value === val);
      if (opt?.price) price += Number(opt.price);
    }
    for (const m of p.modifiers || []) if (it.modifiers?.includes?.(m.value)) price += Number(m.price || 0);
    const options = {};
    for (const [k, v] of Object.entries(it.options || {}).slice(0, 20)) options[str(k, 60)] = str(v, 500);
    items.push({ product: p._id, name: p.name, image: p.coverImage, price, cost: p.costPrice || 0, qty: Math.min(99, Math.max(1, Number(it.qty) || 1)), options });
  }
  if (!items.length) return NextResponse.json({ error: 'These products are no longer available' }, { status: 400 });

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const allFree = items.every((i) => byId[String(i.product)]?.freeDelivery);
  const fee = deliveryFee(receiver.city, subtotal, allFree);
  const order = await Order.create({
    oid: await nextSeq('order'),
    items,
    customer,
    receiver,
    deliveryDate: str(body.deliveryDate, 20),
    deliveryTime: str(body.deliveryTime, 40),
    message: str(body.message, 600),
    subtotal,
    deliveryFee: fee,
    total: subtotal + fee,
    cost: items.reduce((s, i) => s + i.cost * i.qty, 0),
    paymentMethod: 'bank',
    paymentProof,
    status: 'new',
    website: req.headers.get('host') || '',
  });

  return NextResponse.json({ success: true, oid: order.oid, total: order.total });
}
