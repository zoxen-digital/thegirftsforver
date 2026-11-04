'use client';

import { useState } from 'react';
import { IconWhatsApp } from './Icons';

/** Sends the enquiry straight to the shop's WhatsApp — no data is stored. */
export default function ContactForm({ whatsapp }) {
  const [f, setF] = useState({ name: '', occasion: 'Birthday', budget: '', message: '' });
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  function submit(e) {
    e.preventDefault();
    const text = `Hi! My name is ${f.name}.\nOccasion: ${f.occasion}\nBudget: ${f.budget || 'flexible'}\n\n${f.message}`;
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-[32px] bg-white p-6 sm:p-10">
      <h2 className="font-display text-3xl font-semibold">Need a custom gift?</h2>
      <p className="text-sm text-muted">Tell us a little about it and we’ll continue on WhatsApp.</p>
      <input className="field" placeholder="Your name" required value={f.name} onChange={set('name')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <select className="field" value={f.occasion} onChange={set('occasion')}>
          {['Birthday', 'Anniversary', 'Eid', 'Wedding', 'Newborn', 'Corporate', 'Sorry / Get well', 'Other'].map((o) => <option key={o}>{o}</option>)}
        </select>
        <input className="field" placeholder="Budget (PKR)" value={f.budget} onChange={set('budget')} />
      </div>
      <textarea className="field" rows={5} placeholder="What would you like to send?" required value={f.message} onChange={set('message')} />
      <button className="btn-wine w-full bg-[#25D366]! py-4 shadow-none hover:bg-[#1ea952]!">
        <IconWhatsApp width={18} height={18} /> Send on WhatsApp
      </button>
    </form>
  );
}
