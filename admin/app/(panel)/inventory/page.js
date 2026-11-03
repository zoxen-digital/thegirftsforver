'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { previewSrc } from '@/components/ImageField';
import { useToast } from '@/components/Toast';
import { IconAlert, IconEdit, IconFile, IconPlus, IconSearch, IconTrash } from '@/components/Icons';
import { money } from '@/lib/utils';

export default function InventoryPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [lowOnly, setLowOnly] = useState(false);

  const load = useCallback(async () => {
    const d = await fetch('/api/admin/inventory?limit=1000').then((r) => r.json());
    setItems(d.items || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function adjust(item, body) {
    const res = await fetch(`/api/admin/inventory/${item._id}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const d = await res.json();
    if (!res.ok) return toast(d.error || 'Failed', 'error');
    setItems((list) => list.map((x) => (x._id === item._id ? d.item : x)));
  }

  async function remove(item) {
    if (!confirm(`Delete ${item.name}?`)) return;
    await fetch(`/api/admin/inventory/${item._id}`, { method: 'DELETE' });
    toast('Item deleted');
    load();
  }

  const low = items.filter((i) => i.stock <= (i.lowStockAt ?? 5));
  const shown = (lowOnly ? low : items).filter((i) => i.name.toLowerCase().includes(q.toLowerCase()));
  const grand = items.reduce((s, i) => s + i.stock * i.unitPrice, 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-bold">Inventory Stock Levels</h1>
          <div className="text-sm text-slate-600"><Link href="/">Dashboard</Link> › Inventory Stock</div>
        </div>
        <div className="flex gap-2">
          <Link href="/inventory/new" className="btn bg-emerald-700 py-1.5 text-xs text-white"><IconPlus width={14} height={14} /> Create Item</Link>
          <Link href="/inventory/logs" className="btn bg-blue-600 py-1.5 text-xs text-white"><IconFile width={14} height={14} /> Acquisition Logs</Link>
        </div>
      </div>
      <div className="card p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold">Current Stock Levels</h2>
            <button onClick={() => setLowOnly((v) => !v)} className={`flex items-center gap-1 rounded border px-2 py-0.5 text-xs ${lowOnly ? 'border-red-600 bg-red-600 text-white' : 'border-red-500 text-red-600'}`}>
              <IconAlert width={14} height={14} /> Low Stock Only <span className="rounded bg-red-600 px-1 text-white">{low.length}</span>
            </button>
          </div>
          <div className="relative w-64">
            <IconSearch width={14} height={14} className="absolute left-2 top-2.5 text-slate-400" />
            <input className="w-full rounded border border-slate-200 py-1.5 pl-7 pr-2 text-sm" placeholder="Search items..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-[15px]">
            <thead className="bg-slate-50 text-slate-700">
              <tr className="border-y">
                <th className="p-3 text-left font-medium">Image</th>
                <th className="p-3 text-left font-medium">Item Name</th>
                <th className="p-3 text-center font-medium">Stock (Write/Adjust)</th>
                <th className="p-3 text-right font-medium">Unit Price</th>
                <th className="p-3 text-right font-medium">Item Total</th>
                <th className="p-3 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((i) => {
                const isLow = i.stock <= (i.lowStockAt ?? 5);
                return (
                  <tr key={i._id} className="border-b odd:bg-slate-50/70">
                    <td className="p-2">
                      {i.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewSrc(i.image)} alt="" className="h-12 w-12 rounded object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded border text-[10px] text-slate-500">No Img</div>
                      )}
                    </td>
                    <td className="p-3 font-semibold">
                      {i.name}
                      {isLow && <div className="mt-1"><span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] text-white">Only {i.stock} left!</span></div>}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => adjust(i, { delta: -1 })} className="h-6 w-6 rounded border border-red-400 text-red-500">−</button>
                        <input
                          key={i.stock}
                          defaultValue={i.stock}
                          onBlur={(e) => Number(e.target.value) !== i.stock && adjust(i, { stock: Number(e.target.value) })}
                          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                          className={`w-20 rounded border px-1 py-0.5 text-center text-xs ${isLow ? 'border-red-500 text-red-600' : 'border-slate-200'}`}
                        />
                        <button onClick={() => adjust(i, { delta: 1 })} className="h-6 w-6 rounded border border-emerald-500 text-emerald-600">+</button>
                      </div>
                    </td>
                    <td className="p-3 text-right font-semibold text-emerald-700">{money(i.unitPrice)}</td>
                    <td className="p-3 text-right font-semibold text-blue-600">{money(i.stock * i.unitPrice)}</td>
                    <td className="p-3">
                      <div className="flex justify-center gap-2">
                        <Link href={`/inventory/${i._id}`} className="rounded border border-amber-400 p-1 text-amber-500"><IconEdit width={14} height={14} /></Link>
                        <button onClick={() => remove(i)} className="rounded border border-red-500 p-1 text-red-600"><IconTrash width={14} height={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!shown.length && <tr><td colSpan={6} className="p-4 text-slate-500">No items</td></tr>}
            </tbody>
            <tfoot>
              <tr><td colSpan={4} className="p-3 text-right font-bold">Total Stock Value</td><td className="p-3 text-right font-bold text-blue-700">{money(grand)}</td><td /></tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
