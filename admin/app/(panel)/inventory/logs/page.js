'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Pager } from '@/components/ResourceTable';
import { money } from '@/lib/utils';

export default function InventoryLogs() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0 });
  const limit = 25;

  useEffect(() => {
    fetch(`/api/admin/inventory-logs?page=${page}&limit=${limit}`).then((r) => r.json()).then(setData);
  }, [page]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px] font-bold">Acquisition Logs</h1>
        <div className="text-sm text-slate-600"><Link href="/">Dashboard</Link> › <Link href="/inventory">Inventory</Link> › Logs</div>
      </div>
      <div className="card p-6">
        <div className="overflow-x-auto">
          <table className="data w-full min-w-[800px]">
            <thead><tr>{['Date', 'Item', 'Change', 'Stock After', 'Value', 'Note'].map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {data.items.map((l) => (
                <tr key={l._id}>
                  <td>{new Date(l.createdAt).toLocaleString('en-GB')}</td>
                  <td className="font-semibold">{l.itemName}</td>
                  <td className={l.change > 0 ? 'text-emerald-700' : 'text-red-600'}>{l.change > 0 ? '+' : ''}{l.change}</td>
                  <td>{l.stockAfter}</td>
                  <td>{money(Math.abs(l.change) * (l.unitPrice || 0))}</td>
                  <td>{l.note}</td>
                </tr>
              ))}
              {!data.items.length && <tr><td colSpan={6}>No stock movements yet</td></tr>}
            </tbody>
          </table>
        </div>
        <Pager page={page} pages={Math.max(1, Math.ceil(data.total / limit))} total={data.total} limit={limit} setPage={setPage} />
      </div>
    </div>
  );
}
