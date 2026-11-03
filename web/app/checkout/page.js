'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/components/CartProvider';
import { IconShield } from '@/components/Icons';
import { CITIES, FREE_DELIVERY_OVER, deliveryFee, pkr } from '@/lib/utils';

const TIMES = ['Any time (10 AM – 9 PM)', 'Morning (10 AM – 1 PM)', 'Afternoon (1 PM – 5 PM)', 'Evening (5 PM – 9 PM)', 'Midnight surprise (11:30 PM – 12:30 AM)'];

export default function Checkout() {
  const { items, ready, subtotal, clear } = useCart();
  const router = useRouter();
  const [f, setF] = useState({
    customer: { name: '', phone: '', email: '', country: 'Pakistan' },
    receiver: { name: '', phone: '', address: '', city: 'Karachi' },
    deliveryDate: '',
    deliveryTime: TIMES[0],
    message: '',
    paymentMethod: 'cod',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const g = (group, k) => ({
    value: f[group][k],
    onChange: (e) => setF((x) => ({ ...x, [group]: { ...x[group], [k]: e.target.value } })),
  });
  const t = (k) => ({ value: f[k], onChange: (e) => setF((x) => ({ ...x, [k]: e.target.value })) });

  const fee = deliveryFee(f.receiver.city, subtotal);
  const today = new Date().toLocaleDateString('en-CA');

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...f, items: items.map(({ productId, qty, variations, options }) => ({ productId, qty, variations, options })) }),
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

  return (
    <form onSubmit={submit} className="container-x grid gap-8 pt-10 lg:grid-cols-[1fr_400px]">
      <div className="space-y-6">
        <h1 className="font-display text-4xl font-semibold">Checkout</h1>

        <fieldset className="rounded-3xl bg-white p-6">
          <legend className="sr-only">Your details</legend>
          <h2 className="mb-4 font-display text-xl font-semibold">1. Your details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="field" placeholder="Your name *" required {...g('customer', 'name')} />
            <input className="field" placeholder="Your phone / WhatsApp *" required {...g('customer', 'phone')} />
            <input className="field" type="email" placeholder="Email (for order updates)" {...g('customer', 'email')} />
            <input className="field" placeholder="Your country" {...g('customer', 'country')} />
          </div>
        </fieldset>

        <fieldset className="rounded-3xl bg-white p-6">
          <h2 className="mb-4 font-display text-xl font-semibold">2. Who is it for?</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="field" placeholder="Receiver name *" required {...g('receiver', 'name')} />
            <input className="field" placeholder="Receiver phone *" required {...g('receiver', 'phone')} />
            <select className="field" {...g('receiver', 'city')}>
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input className="field" type="date" min={today} required {...t('deliveryDate')} />
            <textarea className="field sm:col-span-2" rows={3} placeholder="Full delivery address *" required {...g('receiver', 'address')} />
            <select className="field sm:col-span-2" {...t('deliveryTime')}>
              {TIMES.map((x) => <option key={x}>{x}</option>)}
            </select>
            <textarea className="field sm:col-span-2" rows={3} maxLength={600} placeholder="Message for the gift card (optional)" {...t('message')} />
          </div>
        </fieldset>

        <fieldset className="rounded-3xl bg-white p-6">
          <h2 className="mb-4 font-display text-xl font-semibold">3. Payment</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['cod', 'Cash on delivery', 'Pay when the gift arrives'],
              ['bank', 'Bank transfer / JazzCash', 'Details shared on WhatsApp'],
            ].map(([v, l, d]) => (
              <label key={v} className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition ${f.paymentMethod === v ? 'border-wine bg-blush/60' : 'border-ink/10'}`}>
                <input type="radio" name="pay" value={v} checked={f.paymentMethod === v} onChange={t('paymentMethod').onChange} className="mt-1 accent-[#7a1f3d]" />
                <span><span className="block font-semibold">{l}</span><span className="text-sm text-muted">{d}</span></span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <aside className="h-fit rounded-3xl bg-white p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-2xl font-semibold">Order summary</h2>
        <ul className="mt-5 space-y-4">
          {items.map((it) => (
            <li key={it.key} className="flex gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-blush">
                <Image src={it.image || '/placeholder.svg'} alt="" fill sizes="64px" className="object-cover" />
                <span className="absolute -right-0 -top-0 rounded-bl-lg bg-ink px-1.5 text-[11px] text-white">{it.qty}</span>
              </div>
              <span className="line-clamp-2 flex-1 text-sm">{it.name}</span>
              <span className="text-sm font-semibold">{pkr(it.price * it.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 space-y-2 border-t border-ink/5 pt-5 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{pkr(subtotal)}</span></div>
          <div className="flex justify-between"><span>Delivery ({f.receiver.city})</span><span>{fee ? pkr(fee) : 'Free'}</span></div>
          {fee > 0 && <p className="text-xs text-muted">Free delivery on orders over {pkr(FREE_DELIVERY_OVER)}</p>}
          <div className="flex justify-between pt-3 text-lg font-semibold"><span>Total</span><span className="text-wine">{pkr(subtotal + fee)}</span></div>
        </div>
        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button className="btn-wine mt-6 w-full py-4 text-base" disabled={busy || !ready}>{busy ? 'Placing order…' : 'Place order'}</button>
        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted"><IconShield width={14} height={14} /> Your details are only used to deliver this gift.</p>
      </aside>
    </form>
  );
}
