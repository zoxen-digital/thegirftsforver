'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Pager } from '@/components/ResourceTable';
import { previewSrc } from '@/components/ImageField';
import { useToast } from '@/components/Toast';
import { IconPlus, IconX } from '@/components/Icons';
import { money } from '@/lib/utils';

const STATUSES = ['new', 'processing', 'confirmed', 'pending', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'failed', 'returned', 'refunded'];
const STATUS_COLOR = {
  new: 'bg-violet-600', processing: 'bg-amber-500', confirmed: 'bg-blue-600', pending: 'bg-slate-500', shipped: 'bg-cyan-600',
  out_for_delivery: 'bg-indigo-600', delivered: 'bg-emerald-700', cancelled: 'bg-red-600', failed: 'bg-red-800', returned: 'bg-orange-600', refunded: 'bg-pink-600',
};
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const fmt = (d) =>
  new Date(d).toLocaleString('en-GB', { timeZone: 'Asia/Karachi', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).replace(/\//g, '-').replace(',', '').toUpperCase() + ' (PKT)';

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-4">
      <div className={`w-full ${wide ? 'max-w-3xl' : 'max-w-md'} rounded-lg bg-white shadow-xl`}>
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose}><IconX /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function OrderView({ o }) {
  const Row = ({ k, v }) => (v ? <div className="flex gap-2 py-0.5"><span className="w-36 shrink-0 text-slate-500">{k}</span><span className="font-medium">{v}</span></div> : null);
  return (
    <div className="text-sm">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-2 font-bold text-brand">Sender</h4>
          <Row k="Name" v={o.customer?.name} /><Row k="Phone" v={o.customer?.phone} /><Row k="Email" v={o.customer?.email} /><Row k="Country" v={o.customer?.country} />
        </div>
        <div>
          <h4 className="mb-2 font-bold text-brand">Receiver</h4>
          <Row k="Name" v={o.receiver?.name} /><Row k="Phone" v={o.receiver?.phone} /><Row k="Province" v={o.receiver?.province} /><Row k="City" v={o.receiver?.city} /><Row k="Address" v={o.receiver?.address} />
          <Row k="Delivery date" v={o.deliveryDate} /><Row k="Delivery time" v={o.deliveryTime} /><Row k="Delivery option" v={o.deliveryOption} />
        </div>
      </div>
      {o.message && <div className="mt-4 rounded bg-rose-50 p-3"><b>Card message:</b> {o.message}</div>}
      {o.instructions && <div className="mt-2 rounded bg-amber-50 p-3"><b>Instructions:</b> {o.instructions}</div>}
      <table className="mt-4 w-full text-left">
        <thead><tr className="border-b"><th className="py-2">Item</th><th>Qty</th><th className="text-right">Price</th></tr></thead>
        <tbody>
          {o.items?.map((it, i) => (
            <tr key={i} className="border-b align-top">
              <td className="py-2">
                <div className="flex gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {it.image && <img src={previewSrc(it.image)} alt="" className="h-12 w-12 rounded object-cover" />}
                  <div>
                    <div className="font-medium">{it.name}</div>
                    {Object.entries(it.options || {}).map(([k, v]) =>
                      typeof v === 'string' && v.startsWith('/api/uploads/') ? (
                        <a key={k} href={v} target="_blank" className="block text-xs text-blue-600 underline">{k}: view photo</a>
                      ) : (
                        <div key={k} className="text-xs text-slate-500">{k}: {String(v)}</div>
                      )
                    )}
                  </div>
                </div>
              </td>
              <td>{it.qty}</td>
              <td className="text-right">{money(it.price * it.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 ml-auto w-64 space-y-1">
        <div className="flex justify-between"><span>Subtotal</span><span>{money(o.subtotal)}</span></div>
        <div className="flex justify-between"><span>Delivery</span><span>{money(o.deliveryFee)}</span></div>
        <div className="flex justify-between text-base font-bold"><span>Total</span><span>{money(o.total)}</span></div>
        <div className="flex justify-between text-slate-500"><span>Payment</span><span className="uppercase">{o.paymentMethod}</span></div>
      </div>
      {o.image && (
        <div className="mt-4">
          <div className="mb-1 font-semibold">Customer photo</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewSrc(o.image)} alt="" className="h-40 rounded object-cover" />
        </div>
      )}
      {o.paymentProof && (
        <div className="mt-4">
          <div className="mb-1 font-semibold">Payment screenshot</div>
          <a href={previewSrc(o.paymentProof)} target="_blank">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewSrc(o.paymentProof)} alt="" className="h-40 rounded object-cover" />
          </a>
        </div>
      )}
      {o.notes && <p className="mt-3 text-slate-600"><b>Notes:</b> {o.notes}</p>}
    </div>
  );
}

export default function OrdersPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [data, setData] = useState({ items: [], total: 0 });
  const [view, setView] = useState(null);
  const [edit, setEdit] = useState(null);

  const load = useCallback(async () => {
    const qs = new URLSearchParams({ page, limit });
    if (q) qs.set('q', q);
    if (status) qs.set('status', status);
    setData(await fetch(`/api/admin/orders?${qs}`).then((r) => r.json()));
  }, [page, limit, q, status]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function saveStatus() {
    const res = await fetch(`/api/admin/orders/${edit._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: edit.status }),
    });
    if (res.ok) { toast('Order status updated'); setEdit(null); load(); } else toast('Update failed', 'error');
  }

  async function remove(o) {
    if (!confirm(`Delete order #${o.oid}?`)) return;
    const res = await fetch(`/api/admin/orders/${o._id}`, { method: 'DELETE' });
    if (res.ok) { toast('Order deleted'); load(); }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px] font-bold">Orders</h1>
        <div className="flex items-center gap-4">
          <Link href="/orders/new" className="btn-outline px-6 py-3 text-base"><IconPlus /> Add Order</Link>
          <div className="text-sm text-slate-600"><Link href="/">Dashboard</Link> › Orders</div>
        </div>
      </div>
      <div className="card p-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 text-[15px] text-slate-600">
          <div>
            Show{' '}
            <select className="mx-1 rounded border border-slate-200 px-2 py-1" value={limit} onChange={(e) => { setLimit(+e.target.value); setPage(1); }}>
              {[10, 25, 50, 100].map((n) => <option key={n}>{n}</option>)}
            </select>{' '}
            entries
          </div>
          <div className="flex flex-wrap gap-3">
            <select className="rounded border border-slate-200 px-2 py-1.5" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              {STATUSES.map((s) => <option key={s} value={s}>{cap(s.replace(/_/g, ' '))}</option>)}
            </select>
            <label>Search: <input className="ml-1 rounded border border-slate-200 px-2 py-1" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Name or number" /></label>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data w-full min-w-[1100px]">
            <thead>
              <tr>{['ID', 'D/T', 'Status', 'Image', 'Name', 'Number', 'Receiver Name', 'Receiver Number', 'Action'].map((h) => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {data.items?.map((o) => (
                <tr key={o._id}>
                  <td>{o.oid}</td>
                  <td className="whitespace-nowrap">{fmt(o.createdAt)}</td>
                  <td><span className={`pill ${STATUS_COLOR[o.status]}`}>{o.status}</span></td>
                  <td>
                    {o.image || o.items?.[0]?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewSrc(o.image || o.items[0].image)} alt="" className="h-12 w-12 rounded border object-cover" />
                    ) : 'No Image'}
                  </td>
                  <td>{o.customer?.name}</td>
                  <td>{o.customer?.phone}</td>
                  <td>{o.receiver?.name}</td>
                  <td>{o.receiver?.phone}</td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => setView(o)} className="rounded bg-sky-500 px-2 py-1 text-xs text-white">View</button>
                      <button onClick={() => setEdit({ _id: o._id, oid: o.oid, status: o.status })} className="rounded bg-blue-600 px-2 py-1 text-xs text-white">Edit</button>
                      <Link href={`/orders/${o._id}`} className="rounded bg-slate-600 px-2 py-1 text-xs text-white">Full</Link>
                      <button onClick={() => remove(o)} className="rounded bg-red-600 px-2 py-1 text-xs text-white">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!data.items?.length && <tr><td colSpan={9}>No orders found</td></tr>}
            </tbody>
          </table>
        </div>
        <Pager page={page} pages={Math.max(1, Math.ceil(data.total / limit))} total={data.total} limit={limit} setPage={setPage} />
      </div>

      {view && <Modal wide title={`Order #${view.oid}`} onClose={() => setView(null)}><OrderView o={view} /></Modal>}
      {edit && (
        <Modal title="Update Order Status" onClose={() => setEdit(null)}>
          <label className="mb-1 block text-sm text-slate-600">Status</label>
          <select className="input py-2" value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>
            {STATUSES.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
          </select>
          <div className="mt-4 flex justify-end gap-2">
            <button className="btn bg-slate-200" onClick={() => setEdit(null)}>Close</button>
            <button className="btn-primary" onClick={saveStatus}>Update</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
