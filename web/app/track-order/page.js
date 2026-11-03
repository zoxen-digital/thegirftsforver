'use client';

import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { pkr } from '@/lib/utils';

const STEPS = ['new', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
const label = (s) => s.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

export default function TrackOrder() {
  const [oid, setOid] = useState('');
  const [phone, setPhone] = useState('');
  const [res, setRes] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    setRes(null);
    const r = await fetch(`/api/track?${new URLSearchParams({ oid: oid.replace(/\D/g, ''), phone })}`);
    const d = await r.json();
    setBusy(false);
    if (!r.ok) setErr(d.error);
    else setRes(d);
  }

  const step = res ? STEPS.indexOf(res.status) : -1;
  const stopped = res && step === -1;

  return (
    <>
      <PageHeader title="Track your order" eyebrow="Order status" crumbs={[['Track order']]} />
      <div className="container-x mt-10 grid gap-8 lg:grid-cols-[420px_1fr]">
        <form onSubmit={submit} className="h-fit space-y-4 rounded-3xl bg-white p-6">
          <input className="field" placeholder="Order number e.g. 1024" value={oid} onChange={(e) => setOid(e.target.value)} required />
          <input className="field" placeholder="Sender or receiver phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <button className="btn-wine w-full" disabled={busy}>{busy ? 'Checking…' : 'Track order'}</button>
          {err && <p className="text-sm text-red-600">{err}</p>}
        </form>
        {res && (
          <div className="rounded-3xl bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-2xl font-semibold">Order #{res.oid}</h2>
              <span className="text-sm text-muted">{new Date(res.createdAt).toLocaleDateString('en-GB')} · {pkr(res.total)}</span>
            </div>
            {stopped ? (
              <p className="mt-6 rounded-2xl bg-blush p-4 font-semibold text-wine">Status: {label(res.status)}</p>
            ) : (
              <ol className="mt-8 grid gap-4 sm:grid-cols-6">
                {STEPS.map((s, i) => (
                  <li key={s} className="flex items-center gap-3 sm:flex-col sm:text-center">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${i <= step ? 'bg-wine text-white' : 'bg-blush text-muted'}`}>{i + 1}</span>
                    <span className={`text-xs ${i <= step ? 'font-semibold text-ink' : 'text-muted'}`}>{label(s)}</span>
                  </li>
                ))}
              </ol>
            )}
            <ul className="mt-8 space-y-1 text-sm text-muted">
              {res.items.map((i, k) => <li key={k}>{i.qty} × {i.name}</li>)}
              {res.deliveryDate && <li className="pt-2">Delivery date: <b className="text-ink">{res.deliveryDate}</b> {res.city && `· ${res.city}`}</li>}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
