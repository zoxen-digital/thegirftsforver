'use client';

import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { IconCalendar, IconCheckCircle, IconDollar, IconSearch, IconXCircle } from '@/components/Icons';
import { money } from '@/lib/utils';

const iso = (d) => d.toLocaleDateString('en-CA');

function presetRange(p) {
  const now = new Date();
  const start = new Date(now);
  if (p === 'today') return [iso(now), iso(now)];
  if (p === 'week') { start.setDate(now.getDate() - now.getDay()); return [iso(start), iso(now)]; }
  if (p === 'month') return [iso(new Date(now.getFullYear(), now.getMonth(), 1)), iso(new Date(now.getFullYear(), now.getMonth() + 1, 0))];
  if (p === 'year') return [iso(new Date(now.getFullYear(), 0, 1)), iso(new Date(now.getFullYear(), 11, 31))];
  return ['', ''];
}

const PRESETS = [['today', 'Today'], ['week', 'This Week'], ['month', 'This Month'], ['year', 'This Year'], ['all', 'All Time']];

const CARDS = [
  ['products', 'Total Products', 'bg-[#0d6efd]'],
  ['categories', 'Total Categories', 'bg-[#198754]'],
  ['blogs', 'Total Blogs', 'bg-[#0dcaf0]'],
  ['sliders', 'Total Sliders', 'bg-[#ffc107]'],
  ['forms', 'Total Forms', 'bg-[#6c757d]'],
  ['orders', 'Total Orders', 'bg-[#212529]'],
];

function eachDay(from, to) {
  if (!from || !to) return null;
  const out = [];
  const d = new Date(from + 'T00:00:00');
  const end = new Date(to + 'T00:00:00');
  while (d <= end && out.length < 400) { out.push(iso(d)); d.setDate(d.getDate() + 1); }
  return out;
}

function StatCard({ icon: Icon, title, tone, badge, label1, value1, label2, value2 }) {
  return (
    <div className="card p-4 text-center">
      <div className="mb-2 flex items-center justify-between">
        <div className={`flex items-center gap-2 text-lg font-bold ${tone}`}>
          <Icon width={18} height={18} /> {title}
        </div>
        <span className="rounded px-2 py-0.5 text-xs font-semibold" style={{ background: badge[0], color: badge[1] }}>{badge[2]}</span>
      </div>
      <div className="text-lg text-slate-600">{label1}</div>
      <div className="text-3xl font-bold">{value1}</div>
      <div className="mt-1 text-lg text-slate-600">{label2}</div>
      <div className={`text-3xl font-bold ${tone}`}>{value2}</div>
    </div>
  );
}

export default function Dashboard() {
  const [preset, setPreset] = useState('month');
  const [range, setRange] = useState(presetRange('month'));
  const [applied, setApplied] = useState(presetRange('month'));
  const [data, setData] = useState(null);

  useEffect(() => {
    const qs = new URLSearchParams();
    if (applied[0]) qs.set('from', applied[0]);
    if (applied[1]) qs.set('to', applied[1]);
    fetch(`/api/admin/stats?${qs}`).then((r) => r.json()).then(setData).catch(() => {});
  }, [applied]);

  const label = PRESETS.find(([k]) => k === preset)?.[1] || 'Custom';
  const badge = (bg, fg) => [bg, fg, label];

  const chart = useMemo(() => {
    const byDay = Object.fromEntries((data?.daily || []).map((d) => [d._id, d]));
    const days = eachDay(applied[0], applied[1]) || (data?.daily || []).map((d) => d._id);
    return days.map((day) => ({
      day: new Date(day + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      revenue: byDay[day]?.revenue || 0,
      orders: byDay[day]?.orders || 0,
    }));
  }, [data, applied]);

  const t = data?.totals || {};

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {CARDS.map(([k, l, bg]) => (
          <div key={k} className={`${bg} rounded py-4 text-center ${k === 'sliders' ? 'text-slate-900' : 'text-white'}`}>
            <div className="text-xl font-semibold">{l}</div>
            <div className="text-3xl font-bold">{t[k] ?? '–'}</div>
          </div>
        ))}
      </div>

      <div className="card flex flex-wrap items-center gap-2 rounded-md px-3 py-2">
        <span className="flex items-center gap-1 font-semibold text-slate-700"><IconCalendar width={16} height={16} /> Filter by Date:</span>
        {PRESETS.map(([k, l]) => (
          <button
            key={k}
            onClick={() => { setPreset(k); const r = presetRange(k); setRange(r); setApplied(r); }}
            className={`rounded border px-2 py-0.5 text-xs ${preset === k ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-400 text-slate-500'}`}
          >
            {l}
          </button>
        ))}
        <span className="ml-3 text-slate-600">From:</span>
        <input type="date" className="rounded border border-slate-200 px-2 py-0.5 text-sm" value={range[0]} onChange={(e) => setRange([e.target.value, range[1]])} />
        <span className="text-slate-600">To:</span>
        <input type="date" className="rounded border border-slate-200 px-2 py-0.5 text-sm" value={range[1]} onChange={(e) => setRange([range[0], e.target.value])} />
        <button onClick={() => { setPreset('custom'); setApplied(range); }} className="flex items-center gap-1 rounded bg-blue-600 px-2 py-1 text-xs text-white">
          <IconSearch width={14} height={14} /> Apply
        </button>
        <span className="ml-auto rounded border border-slate-200 px-2 py-0.5 text-[11px] font-semibold">{label}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={IconCheckCircle} title="Delivered Orders" tone="text-emerald-700" badge={badge('#d1e7dd', '#0f5132')}
          label1="Delivered Count" value1={data?.delivered.count ?? '–'} label2="Delivered Revenue" value2={money(data?.delivered.revenue)} />
        <StatCard icon={IconCheckCircle} title="Confirmed Orders" tone="text-blue-600" badge={badge('#cfe2ff', '#084298')}
          label1="Confirmed Count" value1={data?.confirmed.count ?? '–'} label2="Confirmed Revenue" value2={money(data?.confirmed.revenue)} />
        <StatCard icon={IconXCircle} title="Cancelled Orders" tone="text-red-600" badge={badge('#f8d7da', '#842029')}
          label1="Cancelled Count" value1={data?.cancelled.count ?? '–'} label2="Lost Revenue" value2={money(data?.cancelled.revenue)} />
        <StatCard icon={IconDollar} title="Net Profit / Volume" tone="text-emerald-700" badge={badge('#e2e3e5', '#41464b')}
          label1="Total Order Count" value1={data?.net.count ?? '–'} label2="Net Profit" value2={money(data?.net.profit)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="card p-4">
          <h2 className="mb-4 text-2xl font-semibold">Revenue Graph <span className="text-xs text-slate-500">({label})</span></h2>
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={chart} margin={{ left: 10, right: 10 }}>
              <CartesianGrid vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="day" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => 'Rs. ' + v.toLocaleString()} tick={{ fontSize: 12 }} width={90} />
              <Tooltip formatter={(v) => money(v)} />
              <Area type="monotone" dataKey="revenue" stroke="#2e7d32" strokeWidth={3} fill="#2e7d32" fillOpacity={0.12} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-4">
          <h2 className="mb-4 text-2xl font-semibold">Order Volume Graph <span className="text-xs text-slate-500">({label})</span></h2>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={chart}>
              <CartesianGrid vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="day" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
