'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from './CartProvider';
import { Price } from './Currency';
import { IconBag, IconMinus, IconPlus, IconShare, IconUpload, IconWhatsApp, IconX } from './Icons';
import { img, salePrice } from '@/lib/utils';

export const VAR_LABELS = { size: 'Size', color: 'Color', quantity: 'Quantity', suitColor: 'Suit Color' };

/** Shrinks photos in the browser: Vercel rejects request bodies over 4.5MB. */
async function compress(file) {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/webp', 0.85));
    return blob ? new File([blob], 'photo.webp', { type: 'image/webp' }) : file;
  } catch {
    return file;
  }
}

export async function uploadCustomerPhoto(file) {
  const fd = new FormData();
  fd.append('file', await compress(file));
  const res = await fetch('/api/customer-upload', { method: 'POST', body: fd });
  const d = await res.json().catch(() => ({}));
  if (!res.ok || !d.success) throw new Error(d.error || 'Upload failed');
  return d.url;
}

/** Price for a product with the chosen variation values and modifiers (both are add-ons). */
export function unitPrice(product, chosen, modifiers = []) {
  let price = salePrice(product.price, product.discount);
  for (const [group, val] of Object.entries(chosen || {})) {
    const opt = product.variations?.[group]?.find((o) => o.value === val);
    if (opt?.price) price += Number(opt.price);
  }
  for (const m of product.modifiers || []) if (modifiers.includes(m.value)) price += Number(m.price || 0);
  return price;
}

export function PhotoInput({ value, onChange, label }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-wine/30 bg-white p-3 text-sm">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-12 w-12 rounded-lg object-cover" />
      ) : (
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-blush text-wine"><IconUpload width={18} height={18} /></span>
      )}
      <span className="flex-1">
        <span className="block font-medium">{label}</span>
        <span className={`text-xs ${err ? 'text-red-600' : 'text-muted'}`}>{busy ? 'Uploading…' : err || (value ? 'Tap to replace' : 'JPG, PNG or WEBP')}</span>
      </span>
      <input
        type="file"
        hidden
        accept="image/png,image/jpeg,image/webp"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setBusy(true);
          setErr('');
          try {
            onChange(await uploadCustomerPhoto(f));
          } catch (x) {
            setErr(x.message);
          }
          setBusy(false);
        }}
      />
    </label>
  );
}

function AddedPopup({ cartKey, suggestions, onClose }) {
  const { items, add, setQty } = useCart();
  const it = items.find((x) => x.key === cartKey);
  if (!it) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg animate-rise overflow-y-auto rounded-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Added to cart</h2>
          <button onClick={onClose} aria-label="Close"><IconX /></button>
        </div>
        <div className="mt-4 flex gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-blush">
            <Image src={it.image || '/placeholder.svg'} alt="" fill sizes="80px" className="object-cover" unoptimized={it.image?.startsWith('/api/uploads/')} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-medium">{it.name}</p>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center rounded-full border border-ink/10">
                <button onClick={() => setQty(it.key, it.qty - 1)} className="p-2" aria-label="Decrease"><IconMinus width={14} height={14} /></button>
                <span className="w-7 text-center text-sm">{it.qty}</span>
                <button onClick={() => setQty(it.key, it.qty + 1)} className="p-2" aria-label="Increase"><IconPlus width={14} height={14} /></button>
              </div>
              <span className="font-semibold text-wine"><Price value={it.price * it.qty} /></span>
            </div>
          </div>
        </div>
        {suggestions.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold">Add something extra</h3>
            <ul className="space-y-2">
              {suggestions.slice(0, 4).map((s) => (
                <li key={s._id} className="flex items-center gap-3 rounded-xl border border-ink/5 p-2">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-blush">
                    <Image src={img(s.coverImage)} alt="" fill sizes="48px" className="object-cover" unoptimized={s.coverImage?.startsWith('/api/uploads/')} />
                  </div>
                  <span className="line-clamp-1 flex-1 text-sm">{s.name}</span>
                  <span className="text-sm font-semibold text-wine"><Price value={salePrice(s.price, s.discount)} /></span>
                  <button
                    onClick={() => add({ productId: s._id, slug: s.slug, name: s.name, image: img(s.coverImage), price: salePrice(s.price, s.discount), qty: 1, variations: {}, freeDelivery: !!s.freeDelivery, options: {} }, { silent: true })}
                    className="rounded-full bg-wine p-1.5 text-white"
                    aria-label={`Add ${s.name}`}
                  >
                    <IconPlus width={14} height={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href="/cart" className="btn-ghost">View cart</Link>
          <Link href="/checkout" className="btn-wine">Checkout</Link>
        </div>
      </div>
    </div>
  );
}

export default function BuyBox({ product, whatsapp, suggestions = [] }) {
  const { add } = useCart();
  const groups = Object.entries(product.variations || {}).filter(([, opts]) => opts?.length);
  const [chosen, setChosen] = useState(() => Object.fromEntries(groups.map(([g, opts]) => [g, opts[0].value])));
  const [mods, setMods] = useState([]);
  const [fields, setFields] = useState({});
  const [photos, setPhotos] = useState(() => Array(product.imagesNeed || 0).fill(''));
  const [error, setError] = useState('');
  const [added, setAdded] = useState(null);
  const [copied, setCopied] = useState(false);

  const price = unitPrice(product, chosen, mods);

  function buildItem() {
    const formFields = product.form?.fields || [];
    for (const f of formFields) {
      if (f.required && !fields[f.name]) return setError(`Please fill “${f.label}”`);
    }
    if (photos.some((p) => !p)) return setError(`Please upload ${photos.length} photo${photos.length > 1 ? 's' : ''} for this gift`);
    setError('');
    const options = {};
    for (const [g, v] of Object.entries(chosen)) {
      const opt = product.variations[g].find((o) => o.value === v);
      options[VAR_LABELS[g] || g] = opt?.label || v;
    }
    if (mods.length) options['Add-ons'] = mods.join(', ');
    for (const f of formFields) if (fields[f.name]) options[f.label] = fields[f.name];
    photos.forEach((p, i) => (options[`Photo ${i + 1}`] = p));
    return {
      productId: product._id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      price,
      qty: 1,
      variations: chosen,
      modifiers: mods,
      freeDelivery: !!product.freeDelivery,
      options,
    };
  }

  function addToCart() {
    const item = buildItem();
    if (!item) return;
    add(item, { silent: true });
    setAdded(item.productId + JSON.stringify(item.options));
  }

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) return await navigator.share({ title: product.name, url });
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="mt-6">
      <div className="flex items-baseline gap-2">
        <span className="font-display text-4xl font-semibold text-wine"><Price value={price} /></span>
        {product.discount > 0 && <span className="text-lg font-semibold text-muted">{product.discount}% off</span>}
      </div>

      {groups.map(([g, opts]) => (
        <div key={g} className="mt-6">
          <div className="mb-2 text-sm font-semibold">{VAR_LABELS[g] || g}: <span className="font-normal text-muted">{opts.find((o) => o.value === chosen[g])?.label || chosen[g]}</span></div>
          <div className="flex flex-wrap gap-2">
            {opts.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setChosen((c) => ({ ...c, [g]: o.value }))}
                className={`rounded-full border px-4 py-2 text-sm transition ${chosen[g] === o.value ? 'border-wine bg-wine text-white' : 'border-ink/15 bg-white hover:border-wine'}`}
              >
                {o.label || o.value}
                {o.price ? <span className="ml-1 opacity-70">+<Price value={o.price} /></span> : null}
              </button>
            ))}
          </div>
        </div>
      ))}

      {product.modifiers?.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 text-sm font-semibold">Add-ons</div>
          <div className="space-y-2">
            {product.modifiers.map((m) => (
              <label key={m.value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink/10 bg-white p-3 text-sm">
                <input
                  type="checkbox"
                  className="accent-[#740000]"
                  checked={mods.includes(m.value)}
                  onChange={(e) => setMods((l) => (e.target.checked ? [...l, m.value] : l.filter((x) => x !== m.value)))}
                />
                <span className="flex-1">{m.value}</span>
                {m.price ? <span className="font-semibold text-wine">+<Price value={m.price} /></span> : null}
              </label>
            ))}
          </div>
        </div>
      )}

      {product.form?.fields?.length > 0 && (
        <div className="mt-6 space-y-3 rounded-2xl bg-blush/60 p-4">
          <div className="text-sm font-semibold text-wine">{product.form.name}</div>
          {product.form.fields.map((f) => {
            const set = (v) => setFields((x) => ({ ...x, [f.name]: v }));
            const ph = f.label + (f.required ? ' *' : '');
            if (f.type === 'textarea') return <textarea key={f._id} className="field" rows={3} placeholder={ph} value={fields[f.name] || ''} onChange={(e) => set(e.target.value)} />;
            if (f.type === 'select')
              return (
                <select key={f._id} className="field" value={fields[f.name] || ''} onChange={(e) => set(e.target.value)}>
                  <option value="">{ph}</option>
                  {(f.options || '').split(',').map((o) => o.trim()).filter(Boolean).map((o) => <option key={o}>{o}</option>)}
                </select>
              );
            if (f.type === 'file') return <PhotoInput key={f._id} label={ph} value={fields[f.name]} onChange={set} />;
            return <input key={f._id} className="field" type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'} placeholder={ph} value={fields[f.name] || ''} onChange={(e) => set(e.target.value)} />;
          })}
        </div>
      )}

      {photos.length > 0 && (
        <div className="mt-6 space-y-2">
          <div className="text-sm font-semibold">Upload your photos ({photos.length} needed)</div>
          {photos.map((p, i) => (
            <PhotoInput key={i} label={`Photo ${i + 1}`} value={p} onChange={(u) => setPhotos((list) => list.map((x, j) => (j === i ? u : x)))} />
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <button onClick={addToCart} className="btn-wine py-3.5">
          <IconBag width={18} height={18} /> Add to cart
        </button>
        <a
          href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hi, I want to order: ${product.name}`)}`}
          target="_blank"
          rel="noreferrer"
          className="btn-wine bg-[#25D366]! py-3.5 shadow-none hover:bg-[#1ea952]!"
        >
          <IconWhatsApp width={18} height={18} /> WhatsApp
        </a>
        <button onClick={share} className="btn-ghost py-3.5">
          <IconShare width={18} height={18} /> {copied ? 'Link copied' : 'Share'}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <p className="mt-5 rounded-xl bg-blush/60 p-3 text-sm">💝 Please Note: If an item is not available, we will replace it with a similar item of the same value.</p>
      {added && <AddedPopup cartKey={added} suggestions={suggestions} onClose={() => setAdded(null)} />}
    </div>
  );
}
