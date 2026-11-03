'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { previewSrc } from '@/components/ImageField';
import { useToast } from '@/components/Toast';

function Sorter() {
  const home = useSearchParams().get('type') === 'home';
  const field = home ? 'homeSort' : 'sort';
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [drag, setDrag] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const qs = new URLSearchParams({ limit: 1000, sort: JSON.stringify({ [field]: 1, name: 1 }) });
    if (home) qs.set('featured', 'true');
    fetch(`/api/admin/categories?${qs}`).then((r) => r.json()).then((d) => setItems(d.items || []));
  }, [field, home]);

  function onEnter(i) {
    if (drag === null || drag === i) return;
    setItems((list) => {
      const next = [...list];
      const [m] = next.splice(drag, 1);
      next.splice(i, 0, m);
      return next;
    });
    setDrag(i);
  }

  async function save() {
    setSaving(true);
    await Promise.all(
      items.map((c, i) =>
        fetch(`/api/admin/categories/${c._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [field]: i + 1 }) })
      )
    );
    setSaving(false);
    toast('Order saved');
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px] font-bold">{home ? 'Home Sort Categories' : 'Sort Categories'}</h1>
        <div className="text-sm text-slate-600"><Link href="/">Dashboard</Link> › <Link href="/categories">Categories</Link> › Sort</div>
      </div>
      <div className="card max-w-3xl p-6">
        <p className="mb-4 text-sm text-slate-500">
          {home ? 'Drag featured categories to set the order of product rows on the home page.' : 'Drag categories to set their order in menus and listings.'}
        </p>
        <ul className="flex flex-col gap-2">
          {items.map((c, i) => (
            <li
              key={c._id}
              draggable
              onDragStart={() => setDrag(i)}
              onDragEnter={() => onEnter(i)}
              onDragEnd={() => setDrag(null)}
              onDragOver={(e) => e.preventDefault()}
              className={`flex cursor-grab items-center gap-3 rounded-lg border p-2 ${drag === i ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'}`}
            >
              <span className="w-6 text-center text-slate-400">⋮⋮</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {c.image ? <img src={previewSrc(c.image)} alt="" className="h-10 w-10 rounded object-cover" /> : <div className="h-10 w-10 rounded bg-slate-100" />}
              <span className="flex-1 font-medium">{c.name}</span>
              <span className="text-sm text-slate-400">#{i + 1}</span>
            </li>
          ))}
          {!items.length && <li className="text-slate-500">{home ? 'No featured categories yet — mark some as "Feature Category".' : 'No categories'}</li>}
        </ul>
        <button onClick={save} disabled={saving} className="btn-primary mt-6 px-8 py-3">{saving ? 'Saving…' : 'Save Order'}</button>
      </div>
    </div>
  );
}

export default function SortPage() {
  return (
    <Suspense>
      <Sorter />
    </Suspense>
  );
}
