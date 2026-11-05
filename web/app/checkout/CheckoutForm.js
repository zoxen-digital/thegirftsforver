'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PhotoInput } from '@/components/BuyBox';
import { useCart } from '@/components/CartProvider';
import { Price } from '@/components/Currency';
import Steps from '@/components/Steps';
import { IconCopy, IconGift } from '@/components/Icons';
import { PROVINCES } from '@/lib/utils';

function DetailLine({ line }) {
  const [copied, setCopied] = useState(false);
  const i = line.indexOf(':');
  const label = i > 0 ? line.slice(0, i) : '';
  const value = (i > 0 ? line.slice(i + 1) : line).trim();
  if (!value) return <p className="font-semibold">{label || line}</p>;
  return (
    <div>
      {label && <p className="mb-1 text-sm font-semibold">{label}</p>}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 bg-cream px-3 py-2">
        <span className="break-all font-mono text-sm font-semibold">{value}</span>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {}
          }}
          className="flex shrink-0 items-center gap-1 text-sm font-semibold text-wine"
        >
          <IconCopy width={15} height={15} /> {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

const Label = ({ children, optional }) => (
  <span className="mb-1.5 block text-sm font-medium">
    {children} {optional ? <span className="font-semibold text-wine">(Optional)</span> : <span className="text-red-600">*</span>}
  </span>
);

export default function CheckoutForm({ delivery, payments, freeOver }) {
  const { items, ready, subtotal, clear } = useCart();
  const router = useRouter();
  const [gift, setGift] = useState(true);
  const [f, setF] = useState({
    customer: { name: '', phone: '', email: '', country: 'Pakistan' },
    receiver: { name: '', phone: '', address: '', province: '', city: '' },
    deliveryDate: '',
    deliveryTime: '',
    instructions: '',
    message: '',
    deliveryOption: delivery[0]?.name || '',
    paymentMethod: payments[0]?.name || '',
    paymentProof: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const g = (group, k) => ({
    value: f[group][k],
    onChange: (e) => setF((x) => ({ ...x, [group]: { ...x[group], [k]: e.target.value } })),
  });
  const t = (k) => ({ value: f[k], onChange: (e) => setF((x) => ({ ...x, [k]: e.target.value })) });

  const option = delivery.find((d) => d.name === f.deliveryOption);
  const free = items.length > 0 && (items.every((i) => i.freeDelivery) || (freeOver > 0 && subtotal >= freeOver));
  const fee = free ? 0 : Number(option?.price || 0);
  const today = new Date().toLocaleDateString('en-CA');

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const receiver = gift ? f.receiver : { ...f.receiver, name: f.customer.name, phone: f.customer.phone };
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...f, receiver, items: items.map(({ productId, qty, variations, modifiers, options }) => ({ productId, qty, variations, modifiers, options })) }),
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(d.error || 'Something went wrong, please try again.');
    clear();
    router.push(`/order-success/${d.oid}`);
  }

  if (ready && !items.length) {
    return (
      <div className="container-x pt-16 text-center">
        <h1 className="font-display text-3xl">Your cart is empty</h1>
        <Link href="/categories" className="btn-wine mt-6">Shop gifts</Link>
      </div>
    );
  }

  const radio = (active) => `flex cursor-pointer gap-3 rounded-2xl border p-4 transition ${active ? 'border-wine bg-blush/60' : 'border-ink/10 bg-white'}`;

  return (
    <div className="container-x pt-10">
      <Steps current={2} />
      <form onSubmit={submit} className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_420px]">
        <div className="space-y-8 rounded-3xl bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-display text-2xl font-semibold">Recipient Information</h1>
            <div className="flex rounded-full bg-ink/5 p-1 text-sm font-semibold">
              {[[true, 'Send as a Gift'], [false, 'Deliver to Me']].map(([v, l]) => (
                <button key={l} type="button" onClick={() => setGift(v)} className={`rounded-full px-4 py-2 transition ${gift === v ? 'bg-wine text-white' : 'text-muted'}`}>{l}</button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label><Label>Your Full Name</Label><input className="field" placeholder="Enter your full name" required {...g('customer', 'name')} /></label>
            <label><Label>Your Email</Label><input className="field" type="email" placeholder="Enter your email" required {...g('customer', 'email')} /></label>
            <label><Label>Your Phone Number</Label><input className="field" type="tel" placeholder="+92" required {...g('customer', 'phone')} /></label>
            {gift && <label><Label>Receiver Full Name</Label><input className="field" placeholder="Enter receiver full name" required {...g('receiver', 'name')} /></label>}
            {gift && <label><Label>Receiver Phone Number</Label><input className="field" type="tel" placeholder="+92" required {...g('receiver', 'phone')} /></label>}
            <label>
              <Label>Receiver State / Province</Label>
              <select
                className="field"
                required
                value={f.receiver.province}
                onChange={(e) => setF((x) => ({ ...x, receiver: { ...x.receiver, province: e.target.value, city: '' } }))}
              >
                <option value="">Select a state</option>
                {Object.keys(PROVINCES).map((p) => <option key={p}>{p}</option>)}
              </select>
            </label>
            <label>
              <Label>Receiver City</Label>
              <select className="field disabled:opacity-60" required disabled={!f.receiver.province} {...g('receiver', 'city')}>
                <option value="">Select a city</option>
                {(PROVINCES[f.receiver.province] || []).map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="sm:col-span-2"><Label>Receiver Address</Label><textarea className="field" rows={3} placeholder="Enter receiver address" required {...g('receiver', 'address')} /></label>
          </div>

          <div>
            <Label optional>Delivery Date &amp; Time</Label>
            <div className="grid max-w-md grid-cols-2 gap-3">
              <input className="field" type="date" min={today} aria-label="Delivery date" {...t('deliveryDate')} />
              <input className="field" type="time" aria-label="Delivery time" {...t('deliveryTime')} />
            </div>
          </div>

          <label className="block"><Label optional>Gift Card Message</Label><textarea className="field" rows={2} maxLength={600} placeholder="Message for the gift card" {...t('message')} /></label>
          <label className="block"><Label optional>Customize Details or Special Instructions</Label><textarea className="field" rows={3} maxLength={600} placeholder="Special instructions about your order, e.g. notes for delivery" {...t('instructions')} /></label>

          <div>
            <h2 className="mb-4 font-display text-2xl font-semibold">Shipping</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {delivery.map((d) => (
                <label key={d.name} className={radio(f.deliveryOption === d.name)}>
                  <input type="radio" name="delivery" value={d.name} checked={f.deliveryOption === d.name} onChange={t('deliveryOption').onChange} className="mt-1 accent-[#740000]" />
                  <span><span className="block font-semibold">{d.name}</span><span className="text-sm text-muted"><Price value={d.price} /></span></span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6 rounded-3xl bg-white p-6 lg:sticky lg:top-40">
          <h2 className="flex items-center gap-2 font-display text-2xl font-semibold"><IconGift /> Order Summary</h2>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-ink/10 text-left"><th className="py-2 font-semibold">Product</th><th className="py-2 font-semibold">Qty</th><th className="py-2 text-right font-semibold">Price</th></tr></thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.key} className="border-b border-ink/5">
                  <td className="max-w-[180px] truncate py-2 pr-2">{it.name}</td>
                  <td className="py-2">x {it.qty}</td>
                  <td className="whitespace-nowrap py-2 text-right"><Price value={it.price * it.qty} /></td>
                </tr>
              ))}
              <tr className="font-semibold"><td className="py-2" colSpan={2}>Subtotal</td><td className="whitespace-nowrap py-2 text-right"><Price value={subtotal} /></td></tr>
            </tbody>
          </table>

          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm">
            <p className="text-emerald-800">Selected: {f.deliveryOption}</p>
            <p className="mt-1">{fee ? <Price value={fee} /> : 'Free delivery'}</p>
          </div>
          {fee > 0 && freeOver > 0 && <p className="text-xs text-muted">Free delivery on orders over <Price value={freeOver} /></p>}

          <div className="flex justify-between border-y border-ink/10 py-4 text-lg font-semibold"><span>Total</span><span className="text-wine"><Price value={subtotal + fee} /></span></div>

          <div>
            <h2 className="mb-3 font-display text-xl font-semibold">Select Payment Method</h2>
            <div className="space-y-3">
              {payments.map((p) => {
                const active = f.paymentMethod === p.name;
                return (
                  <div key={p.name} className={`rounded-2xl border p-4 ${active ? 'border-wine bg-blush/40' : 'border-ink/10'}`}>
                    <label className="flex cursor-pointer items-center gap-3 font-semibold">
                      <input type="radio" name="pay" value={p.name} checked={active} onChange={t('paymentMethod').onChange} className="accent-[#740000]" />
                      {p.name}
                    </label>
                    {active && p.details && (
                      <div className="mt-4 space-y-3 rounded-xl bg-white p-3">
                        {p.details.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => <DetailLine key={l} line={l} />)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4">
              <PhotoInput label="Payment screenshot" value={f.paymentProof} onChange={(u) => setF((x) => ({ ...x, paymentProof: u }))} />
            </div>
          </div>

          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button className="btn-wine w-full py-4 text-base" disabled={busy || !ready}>{busy ? 'Placing order…' : 'Complete Order'}</button>
        </aside>
      </form>
    </div>
  );
}
