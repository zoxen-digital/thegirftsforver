'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { IconArrowRight, IconBag, IconMinus, IconPlus, IconTrash } from '@/components/Icons';
import { pkr } from '@/lib/utils';

export default function CartPage() {
  const { items, ready, setQty, remove, subtotal } = useCart();

  return (
    <div className="container-x pt-10">
      <h1 className="font-display text-4xl font-semibold">Your cart</h1>
      {!ready ? null : items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl bg-white p-16 text-center">
          <IconBag width={40} height={40} className="text-wine" />
          <p className="text-muted">Your cart is empty — let’s find something lovely.</p>
          <Link href="/categories" className="btn-wine">Start shopping</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <ul className="divide-y divide-ink/5 rounded-3xl bg-white px-5">
            {items.map((it) => (
              <li key={it.key} className="flex gap-4 py-5">
                <Link href={`/product/${it.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-blush sm:h-28 sm:w-28">
                  <Image src={it.image || '/placeholder.svg'} alt="" fill sizes="112px" className="object-cover" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link href={`/product/${it.slug}`} className="line-clamp-2 font-medium hover:text-wine">{it.name}</Link>
                  <div className="mt-1 space-y-0.5 text-xs text-muted">
                    {Object.entries(it.options || {}).map(([k, v]) => (
                      <div key={k}>{k}: {String(v).startsWith('/api/uploads/') ? 'photo uploaded' : String(v)}</div>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center rounded-full border border-ink/10">
                      <button onClick={() => setQty(it.key, it.qty - 1)} className="p-2" aria-label="Decrease"><IconMinus width={14} height={14} /></button>
                      <span className="w-7 text-center text-sm">{it.qty}</span>
                      <button onClick={() => setQty(it.key, it.qty + 1)} className="p-2" aria-label="Increase"><IconPlus width={14} height={14} /></button>
                    </div>
                    <span className="font-semibold text-wine">{pkr(it.price * it.qty)}</span>
                  </div>
                </div>
                <button onClick={() => remove(it.key)} className="self-start p-1 text-muted hover:text-red-600" aria-label="Remove"><IconTrash width={18} height={18} /></button>
              </li>
            ))}
          </ul>
          <aside className="h-fit rounded-3xl bg-white p-6 lg:sticky lg:top-28">
            <h2 className="font-display text-2xl font-semibold">Summary</h2>
            <div className="mt-5 flex justify-between text-sm"><span>Subtotal</span><span>{pkr(subtotal)}</span></div>
            <div className="mt-2 flex justify-between text-sm text-muted"><span>Delivery</span><span>Calculated at checkout</span></div>
            <div className="mt-5 flex justify-between border-t border-ink/5 pt-5 text-lg font-semibold"><span>Total</span><span className="text-wine">{pkr(subtotal)}</span></div>
            <Link href="/checkout" className="btn-wine mt-6 w-full py-4 text-base">Checkout <IconArrowRight width={18} height={18} /></Link>
            <Link href="/categories" className="mt-3 block text-center text-sm text-muted underline">Continue shopping</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
