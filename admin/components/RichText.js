'use client';

import { useEffect, useRef, useState } from 'react';
import { uploadImage } from './ImageField';
import { useToast } from './Toast';

const B = ({ title, onClick, children }) => (
  <button type="button" title={title} onMouseDown={(e) => e.preventDefault()} onClick={onClick} className="rounded px-2 py-1 text-slate-600 hover:bg-slate-100">
    {children}
  </button>
);

const s = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

/** Lightweight WYSIWYG editor (no external API key) producing HTML. */
export default function RichText({ value, onChange, placeholder = 'Enter the Description', folder = 'pages' }) {
  const ref = useRef(null);
  const file = useRef(null);
  const toast = useToast();
  const [source, setSource] = useState(false);

  useEffect(() => {
    if (ref.current && !source && ref.current.innerHTML !== (value || '')) ref.current.innerHTML = value || '';
  }, [value, source]);

  const exec = (cmd, arg) => {
    document.execCommand(cmd, false, arg);
    onChange(ref.current.innerHTML);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 px-3 py-2 shadow-sm">
        <B title="Undo" onClick={() => exec('undo')}><svg {...s}><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-15-6.7L3 13" /></svg></B>
        <B title="Redo" onClick={() => exec('redo')}><svg {...s}><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 15-6.7L21 13" /></svg></B>
        <span className="mx-1 h-5 w-px bg-slate-200" />
        <select onMouseDown={(e) => e.stopPropagation()} onChange={(e) => { exec('formatBlock', e.target.value); e.target.value = ''; }} defaultValue="" className="rounded border border-slate-200 px-1 py-1 text-sm">
          <option value="" disabled>Format</option>
          <option value="p">Paragraph</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="blockquote">Quote</option>
        </select>
        <B title="Bold" onClick={() => exec('bold')}><b>B</b></B>
        <B title="Italic" onClick={() => exec('italic')}><i className="font-serif">I</i></B>
        <span className="mx-1 h-5 w-px bg-slate-200" />
        <B title="Bullet list" onClick={() => exec('insertUnorderedList')}><svg {...s}><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></svg></B>
        <B title="Numbered list" onClick={() => exec('insertOrderedList')}><svg {...s}><path d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" /></svg></B>
        <span className="mx-1 h-5 w-px bg-slate-200" />
        <B title="Align left" onClick={() => exec('justifyLeft')}><svg {...s}><path d="M3 6h18M3 12h12M3 18h16" /></svg></B>
        <B title="Center" onClick={() => exec('justifyCenter')}><svg {...s}><path d="M3 6h18M6 12h12M4 18h16" /></svg></B>
        <B title="Align right" onClick={() => exec('justifyRight')}><svg {...s}><path d="M3 6h18M9 12h12M5 18h16" /></svg></B>
        <span className="mx-1 h-5 w-px bg-slate-200" />
        <B title="Link" onClick={() => { const u = prompt('Link URL'); if (u) exec('createLink', u); }}><svg {...s}><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></svg></B>
        <B title="Image" onClick={() => file.current?.click()}><svg {...s}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></svg></B>
        <B title="Table" onClick={() => exec('insertHTML', '<table><tr><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></table><p></p>')}><svg {...s}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M12 3v18" /></svg></B>
        <B title="Source code" onClick={() => setSource((v) => !v)}><svg {...s}><path d="m16 18 6-6-6-6M8 6l-6 6 6 6" /></svg></B>
        <input
          ref={file}
          type="file"
          hidden
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (!f) return;
            try {
              const url = await uploadImage(f, folder);
              ref.current?.focus();
              exec('insertImage', url);
            } catch (err) {
              toast(err.message, 'error');
            }
          }}
        />
      </div>
      {source ? (
        <textarea className="rte-body block w-full p-4 font-mono text-sm" value={value || ''} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onInput={() => onChange(ref.current.innerHTML)}
          className="rte-body px-5 py-4 text-[15px] leading-relaxed"
        />
      )}
    </div>
  );
}
