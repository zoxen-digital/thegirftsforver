'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCart } from './CartProvider';
import { IconBag, IconMinus, IconPlus, IconUpload, IconWhatsApp } from './Icons';
import { pkr, salePrice } from '@/lib/utils';

export const VAR_LABELS = { size: 'Size', color: 'Color', quantity: 'Quantity', suitColor: 'Suit Color' };

export async function uploadCustomerPhoto(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/customer-upload', { method: 'POST', body: fd });
  const d = await res.json().catch(() => ({}));
  if (!res.ok || !d.success) throw new Error(d.error || 'Upload failed');
  return d.url;
}

/** Price for a product with the chosen variation values (variation prices are add-ons). */
export function unitPrice(product, chosen) {
  let price = salePrice(product.price, product.discount);
  for (const [group, val] of Object.entries(chosen || {})) {
    const opt = product.variations?.[group]?.find((o) => o.value === val);
    if (opt?.price) price += Number(opt.price);
  }
  return price;
}

function PhotoInput({ value, onChange, label }) {
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
        <span className={`text-xs ${err ? 'text-red-600' : 'text-muted'}`}>{busy ? 'Uploading…' : err || (value ? 'Tap to replace' : 'JPG, PNG or WEBP · max 5MB')}</span>
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

export default function BuyBox({ product }) {
  const { add } = useCart();
  const router = useRouter();
  const groups = Object.entries(product.variations || {}).filter(([, opts]) => opts?.length);
  const [chosen, setChosen] = useState(() => Object.fromEntries(groups.map(([g, opts]) => [g, opts[0].value])));
  const [fields, setFields] = useState({});
  const [photos, setPhotos] = useState(() => Array(product.imagesNeed || 0).fill(''));
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');

  const price = unitPrice(product, chosen);

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
    for (const f of formFields) if (fields[f.name]) options[f.label] = fields[f.name];
    photos.forEach((p, i) => (options[`Photo ${i + 1}`] = p));
    return {
      productId: product._id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      price,
      qty,
      variations: chosen,
      options,
    };
  }

  function addToCart(go) {
    const item = buildItem();
    if (!item) return;
    add(item);
    if (go) router.push('/checkout');
  }

  return (
    <div className="mt-6">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-4xl font-semibold text-wine">{pkr(price)}</span>
        {product.discount > 0 && <span className="text-lg text-muted line-through">{pkr(product.price)}</span>}
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
                {o.price ? <span className="ml-1 opacity-70">+{pkr(o.price)}</span> : null}
              </button>
            ))}
          </div>
        </div>
      ))}

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

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-full border border-ink/15 bg-white">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3" aria-label="Decrease"><IconMinus width={16} height={16} /></button>
          <span className="w-8 text-center font-semibold">{qty}</span>
          <button type="button" onClick={() => setQty((q) => q + 1)} className="p-3" aria-label="Increase"><IconPlus width={16} height={16} /></button>
        </div>
        <button onClick={() => addToCart(false)} className="btn-ghost flex-1 py-3.5">
          <IconBag width={18} height={18} /> Add to cart
        </button>
        <button onClick={() => addToCart(true)} className="btn-wine w-full py-4 text-base sm:w-auto sm:flex-1">
          Buy now
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function WhatsAppOrder({ number, name }) {
  return (
    <a href={`https://wa.me/${number}?text=${encodeURIComponent(`Hi, I want to order: ${name}`)}`} className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-[#128C7E]">
      <IconWhatsApp width={18} height={18} /> Order on WhatsApp
    </a>
  );
}
