'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { UI } from '@/lib/resourceUi';
import { previewSrc } from './ImageField';
import { useOptions } from './useOptions';
import { useToast } from './Toast';
import { IconCopy, IconEdit, IconEye, IconPlus, IconStar } from './Icons';

const get = (o, path) => path.split('.').reduce((v, k) => (v == null ? v : v[k]), o);
const SITE = process.env.NEXT_PUBLIC_SITE_URL || '';

export function Pager({ page, pages, total, limit, setPage }) {
  const from = total ? (page - 1) * limit + 1 : 0;
  const to = Math.min(page * limit, total);
  const nums = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) nums.push(i);
  const btn = 'border-r border-slate-200 px-3 py-2 last:border-r-0 disabled:text-slate-400';
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-[15px] text-slate-600">
      <span>Showing {from} to {to} of {total} entries</span>
      <div className="flex overflow-hidden rounded border border-slate-200 bg-slate-50">
        <button className={btn} disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
        {nums[0] > 1 && <><button className={btn} onClick={() => setPage(1)}>1</button><span className={btn}>…</span></>}
        {nums.map((n) => (
          <button key={n} className={`${btn} ${n === page ? 'bg-blue-600 text-white' : 'text-blue-600'}`} onClick={() => setPage(n)}>{n}</button>
        ))}
        {nums.at(-1) < pages && <><span className={btn}>…</span><button className={btn + ' text-blue-600'} onClick={() => setPage(pages)}>{pages}</button></>}
        <button className={btn + ' text-blue-600'} disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}

function TopFilter({ cfg, value, onChange }) {
  const opts = useOptions(cfg.source);
  return (
    <select className="mb-5 w-full rounded border border-slate-200 px-2 py-1.5 text-[15px]" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{cfg.all}</option>
      {opts.map((o) => (
        <option key={o._id} value={o._id}>{o.name}</option>
      ))}
    </select>
  );
}

export default function ResourceTable({ resource }) {
  const ui = UI[resource];
  const toast = useToast();
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({ page, limit });
    for (const [k, v] of Object.entries(filters)) if (v) qs.set(k, v);
    const d = await fetch(`/api/admin/${resource}?${qs}`).then((r) => r.json()).catch(() => ({ items: [], total: 0 }));
    setData(d);
    setLoading(false);
  }, [resource, page, limit, filters]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const setFilter = (k, v) => {
    setPage(1);
    setFilters((f) => ({ ...f, [k]: v }));
  };

  async function toggle(item, key) {
    const value = !item[key];
    setData((d) => ({ ...d, items: d.items.map((x) => (x._id === item._id ? { ...x, [key]: value } : x)) }));
    const res = await fetch(`/api/admin/${resource}/${item._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: value }),
    });
    if (!res.ok) { toast('Update failed', 'error'); load(); }
  }

  async function remove(item) {
    if (!confirm(`Delete this ${ui.singular.toLowerCase()}? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/${resource}/${item._id}`, { method: 'DELETE' });
    if (res.ok) { toast(`${ui.singular} deleted`); load(); } else toast('Delete failed', 'error');
  }

  const pages = Math.max(1, Math.ceil((data.total || 0) / limit));

  function cell(item, col, idx) {
    const v = col.key === '_index' ? (page - 1) * limit + idx + 1 : get(item, col.key);
    switch (col.type) {
      case 'image': {
        const src = Array.isArray(v) ? v[0] : v;
        return src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewSrc(src)} alt="" className={`${col.wideImage ? 'h-14 w-28' : 'h-14 w-14'} rounded-md object-cover shadow`} />
        ) : (
          <div className="h-14 w-14 rounded-md bg-white shadow" />
        );
      }
      case 'flag':
        return (
          <button onClick={() => toggle(item, col.key)} className={`pill ${v ? 'bg-emerald-700' : 'bg-red-600'}`}>
            {v ? 'Active' : 'Inactive'}
          </button>
        );
      case 'date':
        return v ? new Date(v).toLocaleDateString('en-GB') : '';
      case 'stars':
        return <div className="flex">{[1, 2, 3, 4, 5].map((n) => <IconStar key={n} filled={n <= v} />)}</div>;
      case 'clip':
        return <span className="line-clamp-2 max-w-xs">{v}</span>;
      case 'list':
        return (v || []).map((x) => x?.[col.listKey]).filter(Boolean).join(', ');
      case 'wide':
        return <span className="block max-w-sm">{v}</span>;
      default:
        return v == null ? '' : String(v);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px] font-bold">{ui.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
          {ui.extraLinks?.map(([l, h]) => (
            <Link key={h} href={h} className="font-semibold text-slate-800 hover:text-blue-600">{l}</Link>
          ))}
          <Link href="/">Dashboard</Link> <span>›</span> <span className="text-slate-400">{ui.title}</span>
        </div>
      </div>

      <div className="card p-6">
        <Link href={`/${resource}/new`} className="btn-outline mb-7 w-56 py-3.5 text-base">
          <IconPlus /> Add new
        </Link>

        {ui.topFilter && <TopFilter cfg={ui.topFilter} value={filters[ui.topFilter.key] || ''} onChange={(v) => setFilter(ui.topFilter.key, v)} />}

        {ui.filters?.length > 0 && (
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {ui.filters.map((f) =>
              f.type === 'select' ? (
                <select key={f.key} className="input py-2.5" value={filters[f.key] || 'all'} onChange={(e) => setFilter(f.key, e.target.value === 'all' ? '' : e.target.value)}>
                  {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              ) : (
                <input key={f.key} className="input py-2.5" placeholder={f.placeholder} value={filters[f.key] || ''} onChange={(e) => setFilter(f.key, e.target.value)} />
              )
            )}
          </div>
        )}

        <div className="mb-6 text-[15px] text-slate-600">
          Show{' '}
          <select className="mx-1 rounded border border-slate-200 px-2 py-1" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
            {[10, 25, 50, 100].map((n) => <option key={n}>{n}</option>)}
          </select>{' '}
          entries
        </div>

        <div className="overflow-x-auto">
          <table className="data w-full min-w-[900px]">
            <thead>
              <tr>
                {ui.columns.map((c) => <th key={c.key}>{c.label}</th>)}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.items?.map((item, idx) => (
                <tr key={item._id} className="hover:bg-slate-50/60">
                  {ui.columns.map((c) => <td key={c.key}>{cell(item, c, idx)}</td>)}
                  <td>
                    <div className="flex w-16 flex-col gap-1.5">
                      {ui.duplicate && (
                        <Link title="Duplicate" href={`/${resource}/new?duplicate=${item._id}`} className="flex h-8 items-center justify-center rounded bg-amber-400 text-slate-900">
                          <IconCopy width={16} height={16} />
                        </Link>
                      )}
                      <Link title="Edit" href={`/${resource}/${item._id}`} className="flex h-8 items-center justify-center rounded bg-emerald-700 text-white">
                        <IconEdit width={16} height={16} />
                      </Link>
                      {ui.viewPath && item.slug && SITE && (
                        <a title="View on site" target="_blank" href={`${SITE}${ui.viewPath}${item.slug}`} className="flex h-8 items-center justify-center rounded bg-sky-500 text-white">
                          <IconEye width={16} height={16} />
                        </a>
                      )}
                      <button onClick={() => remove(item)} className="h-7 rounded bg-red-600 text-xs font-medium text-white">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !data.items?.length && (
                <tr><td colSpan={ui.columns.length + 1}>No data available in table</td></tr>
              )}
              {loading && !data.items?.length && (
                <tr><td colSpan={ui.columns.length + 1}>Loading…</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pager page={page} pages={pages} total={data.total || 0} limit={limit} setPage={setPage} />
      </div>
    </div>
  );
}
