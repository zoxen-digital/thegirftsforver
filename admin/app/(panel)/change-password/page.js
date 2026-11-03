'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useToast } from '@/components/Toast';

const empty = { current: '', next: '', confirm: '' };

export default function ChangePassword() {
  const toast = useToast();
  const [f, setF] = useState(empty);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (f.next !== f.confirm) return toast('New passwords do not match', 'error');
    setSaving(true);
    const res = await fetch('/api/auth/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current: f.current, next: f.next }),
    });
    const d = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) return toast(d.error || 'Update failed', 'error');
    setF(empty);
    toast('Password updated');
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px] font-bold">Change Password</h1>
        <div className="text-sm text-slate-600"><Link href="/">Dashboard</Link> › Change Password</div>
      </div>
      <form onSubmit={submit} className="card flex max-w-xl flex-col gap-5 p-6">
        <div>
          <label className="label">Current Password</label>
          <input className="input" type="password" autoComplete="current-password" value={f.current} onChange={set('current')} required />
        </div>
        <div>
          <label className="label">New Password</label>
          <input className="input" type="password" autoComplete="new-password" minLength={8} value={f.next} onChange={set('next')} required />
          <p className="hint">At least 8 characters.</p>
        </div>
        <div>
          <label className="label">Confirm New Password</label>
          <input className="input" type="password" autoComplete="new-password" minLength={8} value={f.confirm} onChange={set('confirm')} required />
        </div>
        <button className="btn-primary py-3 text-base" disabled={saving}>{saving ? 'Saving…' : 'Update Password'}</button>
      </form>
    </div>
  );
}
