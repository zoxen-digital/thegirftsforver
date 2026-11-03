'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ImageField from './ImageField';
import { useOptions } from './useOptions';
import { useToast } from './Toast';
import { money, salePrice } from '@/lib/utils';

const STATUSES = ['new', 'processing', 'confirmed', 'pending', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'failed', 'returned', 'refunded'];

const empty = {
  items: [],
  customer: { name: '', phone: '', email: '', country: 'Pakistan' },
  receiver: { name: '', phone: '', address: '', city: 'Karachi' },
  deliveryDate: '',
  deliveryTime: '',
  message: '',
  image: '',
  deliveryFee: 0,
  paymentMethod: 'cod',
  status: 'new',
  notes: '',
};

export default function OrderForm({ id }) {
  const router = useRouter();
  const toast = useToast();
  const products = useOptions('products');
  const [o, setO] = useState(empty);
  const [pick, setPick] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) fetch(`/api/admin/orders/${id}`).then((r) => r.json()).then((d) => setO({ ...empty, ...d.item }));
  }, [id]);

  const setIn = (group, k) => (e) => setO((x) => ({ ...x, [group]: { ...x[group], [k]: e.target.value } }));
  const setTop = (k) => (e) => setO((x) => ({ ...x, [k]: e?.target ? e.target.value : e }));

  const subtotal = o.items.reduce((s, it) => s + Number(it.price || 0) * Number(it.qty || 1), 0);
  const cost = o.items.reduce((s, it) => s + Number(it.cost || 0) * Number(it.qty || 1), 0);
  const total = subtotal + Number(o.deliveryFee || 0);

  function addItem() {
    const p = products.find((x) => x._id === pick);
    if (!p) return;
    setO((x) => ({
      ...x,
      items: [...x.items, { product: p._id, name: p.name, image: p.coverImage, price: salePrice(p.price, p.discount), cost: p.costPrice || 0, qty: 1, options: {} }],
    }));
    setPick('');
  }

  async function submit(e) {
    e.preventDefault();
    if (!o.items.length) return toast('Add at least one product', 'error');
    setSaving(true);
    const body = { ...o, subtotal, total, cost, deliveryFee: Number(o.deliveryFee || 0) };
    const res = await fetch(id ? `/api/admin/orders/${id}` : '/api/admin/orders', {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!res.ok) return toast('Save failed', 'error');
    toast(id ? 'Order updated' : 'Order created');
    router.push('/orders');
  }

  const inp = (value, onChange, ph, type = 'text') => <input className="input" type={type} placeholder={ph} value={value || ''} onChange={onChange} />;

  return (
    <form onSubmit={submit}>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px] font-bold">{id ? `Order #${o.oid || ''}` : 'Add Order'}</h1>
        <div className="text-sm text-slate-600"><Link href="/">Dashboard</Link> › <Link href="/orders">Orders</Link> › {id ? 'Edit' : 'New'}</div>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card flex flex-col gap-4 p-6">
          <h2 className="text-lg font-bold">Sender</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {inp(o.customer.name, setIn('customer', 'name'), 'Name')}
            {inp(o.customer.phone, setIn('customer', 'phone'), 'Phone')}
            {inp(o.customer.email, setIn('customer', 'email'), 'Email')}
            {inp(o.customer.country, setIn('customer', 'country'), 'Country')}
          </div>
          <h2 className="mt-2 text-lg font-bold">Receiver</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {inp(o.receiver.name, setIn('receiver', 'name'), 'Receiver name')}
            {inp(o.receiver.phone, setIn('receiver', 'phone'), 'Receiver phone')}
            {inp(o.receiver.city, setIn('receiver', 'city'), 'City')}
            {inp(o.deliveryDate, setTop('deliveryDate'), 'Delivery date', 'date')}
          </div>
          <textarea className="input" placeholder="Address" value={o.receiver.address} onChange={setIn('receiver', 'address')} />
          <textarea className="input" placeholder="Card message" value={o.message} onChange={setTop('message')} />
          <label className="label">Customer photo</label>
          <ImageField value={o.image} onChange={setTop('image')} folder="misc" allowUrl={false} height="h-36" />
        </div>
        <div className="card flex flex-col gap-4 p-6">
          <h2 className="text-lg font-bold">Items</h2>
          <div className="flex gap-2">
            <select className="input" value={pick} onChange={(e) => setPick(e.target.value)}>
              <option value="">-- Select product --</option>
              {products.map((p) => <option key={p._id} value={p._id}>{p.name} — {money(salePrice(p.price, p.discount))}</option>)}
            </select>
            <button type="button" className="btn-primary" onClick={addItem}>Add</button>
          </div>
          {o.items.map((it, i) => (
            <div key={i} className="grid grid-cols-[1fr_90px_120px_32px] items-center gap-2 rounded-lg border border-slate-100 p-2">
              <span className="text-sm font-medium">{it.name}</span>
              <input className="input py-2" type="number" min={1} value={it.qty} onChange={(e) => setO((x) => ({ ...x, items: x.items.map((y, j) => (j === i ? { ...y, qty: Number(e.target.value) } : y)) }))} />
              <input className="input py-2" type="number" value={it.price} onChange={(e) => setO((x) => ({ ...x, items: x.items.map((y, j) => (j === i ? { ...y, price: Number(e.target.value) } : y)) }))} />
              <button type="button" className="h-7 w-7 rounded bg-red-600 text-white" onClick={() => setO((x) => ({ ...x, items: x.items.filter((_, j) => j !== i) }))}>×</button>
            </div>
          ))}
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Delivery Fee</label>{inp(o.deliveryFee, setTop('deliveryFee'), '0', 'number')}</div>
            <div>
              <label className="label">Payment</label>
              <select className="input" value={o.paymentMethod} onChange={setTop('paymentMethod')}>
                <option value="cod">Cash on delivery</option><option value="bank">Bank transfer</option><option value="card">Card</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={o.status} onChange={setTop('status')}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <textarea className="input" placeholder="Internal notes" value={o.notes} onChange={setTop('notes')} />
          <div className="ml-auto w-64 space-y-1 text-[15px]">
            <div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div>
            <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{money(total)}</span></div>
          </div>
          <button className="btn-primary py-3.5 text-base" disabled={saving}>{saving ? 'Saving…' : id ? 'Update Order' : 'Create Order'}</button>
        </div>
      </div>
    </form>
  );
}
