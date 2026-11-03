'use client';

import { useRef, useState } from 'react';
import { useToast } from './Toast';
import { IconUpload } from './Icons';

const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif';

/** Resolve a stored URL for previewing in the admin (uploads are served by this app too). */
export function previewSrc(url) {
  if (!url) return '';
  if (url.startsWith('/uploads/')) return '/placeholder.svg'; // legacy disk uploads don't exist on serverless
  return url;
}

export async function uploadImage(file, folder) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('folder', folder);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.error || 'Upload failed');
  return data.url;
}

function pastedFile(e) {
  return [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith('image/'))?.getAsFile();
}

/**
 * Single image field: upload → returns saved public URL via onChange.
 * Old uploads are removed server-side when the document is saved without them.
 */
export default function ImageField({ value, onChange, folder = 'misc', allowUrl = true, height = 'h-56' }) {
  const toast = useToast();
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  async function handle(file) {
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
      toast('Image uploaded');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  return (
    <div>
      <input ref={input} type="file" accept={ACCEPT} hidden onChange={(e) => handle(e.target.files?.[0])} />
      {value ? (
        <div className="flex items-start gap-4 rounded-xl border border-slate-200 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewSrc(value)} alt="" className="h-32 w-32 rounded-lg object-cover" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="truncate text-xs text-slate-500">{value}</p>
            <div className="flex gap-2">
              <button type="button" className="btn-outline py-1.5" disabled={busy} onClick={() => input.current?.click()}>
                {busy ? 'Uploading…' : 'Replace'}
              </button>
              <button type="button" className="btn border border-red-300 py-1.5 text-red-600 hover:bg-red-50" onClick={() => onChange('')}>
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          tabIndex={0}
          onClick={() => input.current?.click()}
          onPaste={(e) => handle(pastedFile(e))}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files?.[0]); }}
          className={`flex ${height} cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-[15px] text-slate-600 transition ${drag ? 'border-blue-500 bg-blue-50' : 'border-blue-300'}`}
        >
          <IconUpload className="text-blue-500" />
          {busy ? <span>Uploading…</span> : <span>Drop, paste, or <span className="text-blue-600">click to browse</span></span>}
          <span className="text-xs text-slate-400">PNG, JPG, WEBP or GIF · max 8MB</span>
        </div>
      )}
      {allowUrl && !value && (
        <input
          className="input mt-3"
          placeholder="Or paste image URL"
          onBlur={(e) => e.target.value && onChange(e.target.value.trim())}
        />
      )}
    </div>
  );
}

export function GalleryField({ value = [], onChange, folder = 'gallery' }) {
  const toast = useToast();
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [urls, setUrls] = useState('');

  async function handle(files) {
    const list = [...(files || [])].filter(Boolean);
    if (!list.length) return;
    setBusy(true);
    const added = [];
    for (const f of list) {
      try {
        added.push(await uploadImage(f, folder));
      } catch (e) {
        toast(`${f.name}: ${e.message}`, 'error');
      }
    }
    setBusy(false);
    if (input.current) input.current.value = '';
    if (added.length) {
      onChange([...(value || []), ...added]);
      toast(`${added.length} image(s) uploaded`);
    }
  }

  return (
    <div>
      <input ref={input} type="file" accept={ACCEPT} multiple hidden onChange={(e) => handle(e.target.files)} />
      {value?.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {value.map((u, i) => (
            <div key={u + i} className="group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewSrc(u)} alt="" className="aspect-square w-full rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="absolute right-1 top-1 rounded bg-red-600 px-1.5 text-xs text-white opacity-90"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div
        tabIndex={0}
        onClick={() => input.current?.click()}
        onPaste={(e) => handle([pastedFile(e)])}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handle(e.dataTransfer.files); }}
        className="flex h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-blue-300 text-sm text-slate-600"
      >
        <IconUpload className="text-blue-500" />
        {busy ? 'Uploading…' : <span>Drop, paste, or <span className="text-blue-600">click to browse</span></span>}
      </div>
      <textarea
        className="input mt-3 h-28"
        placeholder="Paste multiple image URLs (one per line)"
        value={urls}
        onChange={(e) => setUrls(e.target.value)}
      />
      <button
        type="button"
        className="btn mt-2 bg-slate-600 py-1 text-xs text-white"
        onClick={() => {
          const list = urls.split('\n').map((s) => s.trim()).filter(Boolean);
          if (list.length) onChange([...(value || []), ...list]);
          setUrls('');
        }}
      >
        Add URLs
      </button>
    </div>
  );
}
