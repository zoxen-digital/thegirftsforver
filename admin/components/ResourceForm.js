'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ImageField, { GalleryField } from './ImageField';
import RichText from './RichText';
import { useOptions } from './useOptions';
import { useToast } from './Toast';
import { IconStar } from './Icons';
import { UI } from '@/lib/resourceUi';

const VAR_GROUPS = [['size', 'Size'], ['color', 'Color'], ['quantity', 'Quantity'], ['suitColor', 'Suit Color']];

function Label({ f }) {
  if (!f.label) return null;
  return (
    <label className="label">
      {f.label}
      {f.optional && <span className="ml-1 text-orange-500">Optional</span>}
      {f.required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function Select({ f, value, onChange }) {
  const opts = useOptions(f.source);
  const list = f.options || opts.map((o) => [o._id, o[f.labelKey || 'name']]);
  const v = value && typeof value === 'object' ? value._id : value;
  return (
    <select className="input" value={v || ''} onChange={(e) => onChange(e.target.value || null)} required={f.required}>
      {!f.options && <option value="">{f.placeholder || '-- Select --'}</option>}
      {list.map(([val, label]) => (
        <option key={val} value={val}>{label}</option>
      ))}
    </select>
  );
}

function Checklist({ f, value = [], onChange }) {
  const opts = useOptions(f.source);
  const ids = (value || []).map((v) => (typeof v === 'object' ? v._id : v));
  return (
    <div className="max-h-[520px] overflow-y-auto pr-2">
      {opts.map((o) => (
        <label key={o._id} className="flex items-center gap-2 py-0.5 text-[17px] text-slate-700">
          <input
            type="checkbox"
            checked={ids.includes(o._id)}
            onChange={(e) => onChange(e.target.checked ? [...ids, o._id] : ids.filter((x) => x !== o._id))}
          />
          {o[f.labelKey || 'name']}
        </label>
      ))}
      {opts.length === 0 && <p className="text-sm text-slate-400">Nothing to select yet.</p>}
    </div>
  );
}

function MultiSelect({ f, value = [], onChange }) {
  const opts = useOptions(f.source);
  const [q, setQ] = useState('');
  const ids = (value || []).map((v) => (typeof v === 'object' ? v._id : v));
  const chosen = opts.filter((o) => ids.includes(o._id));
  const rest = opts.filter((o) => !ids.includes(o._id) && o.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="rounded-lg border border-slate-300 p-2">
      <div className="mb-2 flex flex-wrap gap-2">
        {chosen.map((o) => (
          <span key={o._id} className="flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-sm text-blue-800">
            {o.name}
            <button type="button" onClick={() => onChange(ids.filter((x) => x !== o._id))}>×</button>
          </span>
        ))}
      </div>
      <input className="w-full px-1 py-1 text-[15px] outline-none" placeholder="Select tags" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="max-h-40 overflow-y-auto">
        {rest.slice(0, 50).map((o) => (
          <button key={o._id} type="button" className="block w-full rounded px-2 py-1 text-left text-sm hover:bg-slate-100" onClick={() => { onChange([...ids, o._id]); setQ(''); }}>
            {o.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function Variations({ value = {}, onChange }) {
  const v = value || {};
  const set = (group, rows) => onChange({ ...v, [group]: rows });
  return (
    <div>
      <h3 className="mb-5 mt-2 text-2xl font-bold">Product Variations</h3>
      {VAR_GROUPS.map(([group, label]) => {
        const rows = v[group] || [];
        const list = rows.length ? rows : [];
        return (
          <div key={group} className="mb-6">
            <div className="label">{label}</div>
            {list.map((row, i) => (
              <div key={i} className="mb-2 grid grid-cols-[1fr_1fr_110px_32px] items-center gap-3">
                <input className="input" placeholder="Select or type value" value={row.value || ''} onChange={(e) => set(group, list.map((r, j) => (j === i ? { ...r, value: e.target.value } : r)))} />
                <input className="input" placeholder="Label" value={row.label || ''} onChange={(e) => set(group, list.map((r, j) => (j === i ? { ...r, label: e.target.value } : r)))} />
                <input className="input" type="number" placeholder="Price" value={row.price ?? ''} onChange={(e) => set(group, list.map((r, j) => (j === i ? { ...r, price: e.target.value === '' ? undefined : Number(e.target.value) } : r)))} />
                <button type="button" className="h-7 w-7 rounded bg-red-600 text-sm text-white" onClick={() => set(group, list.filter((_, j) => j !== i))}>×</button>
              </div>
            ))}
            <button type="button" className="rounded bg-emerald-700 px-2 py-1 text-xs font-medium text-white" onClick={() => set(group, [...list, { value: '', label: '', price: undefined }])}>
              + Add {label}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function Rating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <IconStar filled={n <= (value || 0)} width={28} height={28} />
        </button>
      ))}
    </div>
  );
}

export function FieldInput({ f, value, onChange }) {
  switch (f.type) {
    case 'textarea':
      return <textarea className="input min-h-28" placeholder={f.placeholder} value={value || ''} onChange={(e) => onChange(e.target.value)} required={f.required} />;
    case 'number':
      return <input className="input" type="number" step="any" placeholder={f.placeholder} value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} required={f.required} />;
    case 'richtext':
      return <RichText value={value} onChange={onChange} placeholder={f.placeholder} folder={f.folder} />;
    case 'image':
      return <ImageField value={value} onChange={onChange} folder={f.folder} height={f.height} />;
    case 'gallery':
      return <GalleryField value={value || []} onChange={onChange} folder={f.folder} />;
    case 'select':
      return <Select f={f} value={value} onChange={onChange} />;
    case 'checklist':
      return <Checklist f={f} value={value} onChange={onChange} />;
    case 'multiselect':
      return <MultiSelect f={f} value={value} onChange={onChange} />;
    case 'variations':
      return <Variations value={value} onChange={onChange} />;
    case 'rating':
      return <Rating value={value} onChange={onChange} />;
    case 'checkbox':
      return <input type="checkbox" className="h-4 w-4" checked={!!value} onChange={(e) => onChange(e.target.checked)} />;
    default:
      return <input className="input" placeholder={f.placeholder} value={value ?? ''} onChange={(e) => onChange(e.target.value)} required={f.required} />;
  }
}

function defaults(fields) {
  const d = {};
  for (const f of fields) {
    if (f.type === 'flags') for (const [k, , def] of f.items) d[k] = !!def;
    else if (f.default !== undefined) d[f.key] = f.default;
  }
  return d;
}

/** Converts populated refs ({_id,name}) back into plain ids before saving. */
function normalize(data) {
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    if (Array.isArray(v)) out[k] = v.map((x) => (x && typeof x === 'object' && x._id && !('value' in x) ? x._id : x));
    else if (v && typeof v === 'object' && v._id) out[k] = v._id;
    else if (v === '') out[k] = k === 'parent' || k === 'form' || k === 'category' ? null : v;
    else out[k] = v;
  }
  return out;
}

export default function ResourceForm({ resource, id, duplicateOf }) {
  const ui = UI[resource];
  const router = useRouter();
  const toast = useToast();
  const [data, setData] = useState(() => defaults(ui.fields));
  const [loading, setLoading] = useState(!!(id || duplicateOf));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const src = id || duplicateOf;
    if (!src) return;
    fetch(`/api/admin/${resource}/${src}`)
      .then((r) => r.json())
      .then((d) => {
        let item = d.item || {};
        if (duplicateOf) {
          const { _id, pid, cid, slug, createdAt, updatedAt, ...rest } = item;
          // uploaded files belong to the original; the copy keeps the URLs but they're shared
          item = { ...rest, name: `${rest.name || ''} (Copy)` };
        }
        setData(item);
        setLoading(false);
      });
  }, [id, duplicateOf, resource]);

  const set = (k) => (v) => setData((d) => ({ ...d, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(id ? `/api/admin/${resource}/${id}` : `/api/admin/${resource}`, {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalize(data)),
    });
    const out = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok || out.success === false) return toast(out.error || 'Save failed', 'error');
    toast(`${ui.singular} ${id ? 'updated' : 'created'}`);
    router.push(ui.backHref || `/${resource}`);
    router.refresh();
  }

  if (loading) return <div className="card p-10 text-slate-500">Loading…</div>;

  const renderField = (f, i) => {
    if (f.type === 'flags') {
      return (
        <div key={'flags' + i} className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          {f.items.map(([k, label]) => (
            <label key={k} className="text-[15px] font-semibold">
              <div className="mb-1">{label}</div>
              <input type="checkbox" className="h-4 w-4" checked={!!data[k]} onChange={(e) => set(k)(e.target.checked)} />
            </label>
          ))}
        </div>
      );
    }
    if (f.type === 'variations') return <FieldInput key={f.key} f={f} value={data[f.key]} onChange={set(f.key)} />;
    if (ui.layout === 'rows') {
      return (
        <div key={f.key} className="grid gap-2 md:grid-cols-[300px_1fr] md:items-start md:gap-6">
          <div className="pt-3"><Label f={f} /></div>
          <div>
            <FieldInput f={f} value={data[f.key]} onChange={set(f.key)} />
            {f.hint && <p className="hint">{f.hint}</p>}
          </div>
        </div>
      );
    }
    return (
      <div key={f.key} className={f.half ? '' : 'col-span-2'}>
        <Label f={f} />
        <FieldInput f={f} value={data[f.key]} onChange={set(f.key)} />
        {f.hint && <p className="hint">{f.hint}</p>}
      </div>
    );
  };

  const submitBtn = (
    <button className="btn-primary w-full py-3.5 text-base md:w-auto md:min-w-80" disabled={saving}>
      {saving ? 'Saving…' : id ? `Update ${ui.singular.toLowerCase()}` : ui.submitLabel || `Add ${ui.singular.toLowerCase()}`}
    </button>
  );

  const title = id ? `Edit ${ui.singular}` : ui.formTitle || `Add ${ui.singular}`;
  const crumbs = (
    <div className="flex items-center gap-3 text-sm text-slate-600">
      <Link href="/">Dashboard</Link> <span>›</span>
      <Link href={ui.backHref || `/${resource}`}>{ui.title}</Link> <span>›</span>
      <span className="text-slate-400">{id ? 'Edit' : 'New'}</span>
    </div>
  );

  return (
    <form onSubmit={submit}>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px] font-bold">{title}</h1>
        {crumbs}
      </div>

      {ui.layout === 'split' ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="card grid grid-cols-2 content-start gap-6 p-6">{ui.fields.filter((f) => !f.side).map(renderField)}</div>
          <div className="card grid grid-cols-2 content-start gap-6 p-6">
            {ui.fields.filter((f) => f.side).map((f, i) => (f.type === 'flags' || f.type === 'variations' ? <div key={i} className="col-span-2">{renderField(f, i)}</div> : renderField(f, i)))}
            <div className="col-span-2">{submitBtn}</div>
          </div>
        </div>
      ) : ui.layout === 'narrow' ? (
        <div className="card max-w-3xl p-6">
          <div className="grid grid-cols-2 gap-6">{ui.fields.map((f, i) => <div key={i} className="col-span-2">{renderField(f, i)}</div>)}</div>
          <div className="mt-6">{submitBtn}</div>
        </div>
      ) : (
        <div className="card flex flex-col gap-6 p-6">
          {ui.fields.map(renderField)}
          <div className="md:pl-[324px]">{submitBtn}</div>
        </div>
      )}
    </form>
  );
}
