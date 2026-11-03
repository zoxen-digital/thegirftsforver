import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Order } from '@/lib/models';

export const runtime = 'nodejs';

const digits = (s) => String(s || '').replace(/\D/g, '').slice(-10);

/** Order lookup needs the order number AND the sender's or receiver's phone. */
export async function GET(req) {
  const sp = req.nextUrl.searchParams;
  const oid = Number(sp.get('oid'));
  const phone = digits(sp.get('phone'));
  if (!oid || phone.length < 7) return NextResponse.json({ error: 'Enter your order number and phone' }, { status: 400 });
  await dbConnect();
  const o = await Order.findOne({ oid }, 'oid status createdAt deliveryDate total items.name items.qty customer.phone receiver.phone receiver.city').lean();
  if (!o || ![o.customer?.phone, o.receiver?.phone].some((p) => digits(p) === phone)) {
    return NextResponse.json({ error: 'No order found with those details' }, { status: 404 });
  }
  return NextResponse.json({
    oid: o.oid,
    status: o.status,
    createdAt: o.createdAt,
    deliveryDate: o.deliveryDate,
    city: o.receiver?.city,
    total: o.total,
    items: o.items.map((i) => ({ name: i.name, qty: i.qty })),
  });
}
