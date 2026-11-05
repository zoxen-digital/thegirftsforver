'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Logo from './Logo';
import { useToast } from './Toast';
import {
  IconBell, IconCart, IconChat, IconChevron, IconCollapse, IconDb, IconGlobe, IconGrid, IconImage, IconLayers, IconLock, IconLogout, IconMenu,
} from './Icons';

const MENU = [
  { label: 'Dashboard', href: '/', icon: IconGrid },
  { label: 'Products', icon: IconCart, children: [['All Products', '/products'], ['Add Product', '/products/new']] },
  {
    label: 'Category',
    icon: IconLayers,
    children: [['All Categories', '/categories'], ['Add Category', '/categories/new'], ['Add Sub Category', '/categories/new?sub=1'], ['Sort Categories', '/category-sort'], ['Home Sort', '/category-sort?type=home']],
  },
  { label: 'Blogs', icon: IconLayers, children: [['All Blogs', '/blogs'], ['Add Blog', '/blogs/new']] },
  { label: 'Content Pages', icon: IconLayers, children: [['All Pages', '/pages'], ['Add Page', '/pages/new']] },
  { label: 'Slider', href: '/slides', icon: IconImage },
  { label: 'Orders', href: '/orders', icon: IconCart },
  { label: 'Inventory Management', href: '/inventory', icon: IconDb },
  { label: 'Fields', icon: IconLayers, children: [['All Fields', '/fields'], ['Add Field', '/fields/new']] },
  { label: 'Category Reviews', icon: IconLayers, children: [['All Reviews', '/category-reviews'], ['Add Review', '/category-reviews/new']] },
  { label: 'Google Reviews', icon: IconChat, children: [['All Reviews', '/google-reviews'], ['Add Review', '/google-reviews/new']] },
  { label: 'WhatsApp Reviews', icon: IconImage, children: [['All Reviews', '/whatsapp-reviews'], ['Add Review', '/whatsapp-reviews/new']] },
  { label: 'Forms', icon: IconLayers, children: [['All Forms', '/forms'], ['Add Form', '/forms/new']] },
  { label: 'Tags', icon: IconImage, children: [['All Tags', '/tags'], ['Add Tag', '/tags/new']] },
  { label: 'Websites', icon: IconGlobe, children: [['All Websites', '/websites'], ['Add Website', '/websites/new']] },
  { label: 'Change Password', href: '/change-password', icon: IconLock },
];

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [880, 1175, 1568].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f;
      o.connect(g);
      g.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.18;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.9, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      o.start(t);
      o.stop(t + 0.4);
    });
  } catch {}
}

function NavGroup({ item, pathname, onNavigate }) {
  const active = item.children?.some(([, h]) => h.split('?')[0] !== '/' && pathname.startsWith(h.split('?')[0]));
  const [open, setOpen] = useState(active);
  const Icon = item.icon;
  if (!item.children) {
    const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={`flex items-center gap-4 rounded-lg px-3 py-3 text-[16px] font-semibold transition ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-900 hover:bg-slate-50'}`}
      >
        <Icon /> {item.label}
      </Link>
    );
  }
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center gap-4 rounded-lg px-3 py-3 text-left text-[16px] font-semibold transition ${active ? 'text-blue-700' : 'text-slate-900'} hover:bg-slate-50`}
      >
        <Icon /> <span className="flex-1">{item.label}</span>
        <IconChevron width={16} height={16} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="mb-1 ml-12 flex flex-col border-l border-slate-200">
          {item.children.map(([label, href]) => (
            <Link key={href} href={href} onClick={onNavigate} className="py-1.5 pl-4 text-sm text-slate-600 hover:text-blue-600">
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Shell({ children, adminName }) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [websites, setWebsites] = useState([]);
  const [site, setSite] = useState('');
  const lastCount = useRef(null);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    fetch('/api/admin/options?type=websites')
      .then((r) => r.json())
      .then((d) => {
        setWebsites(d.items || []);
        let saved = '';
        try { saved = localStorage.getItem('tgf_site') || ''; } catch {}
        setSite(saved || d.items?.[0]?._id || '');
      })
      .catch(() => {});
  }, []);

  // orders stay "new" until confirmed: keep the alert up and keep ringing until then
  useEffect(() => {
    let stop = false;
    async function check() {
      try {
        const d = await fetch('/api/admin/orders?limit=1&status=new').then((r) => r.json());
        const count = d.total || 0;
        setPending(count);
        if (count > 0) playChime();
        const top = d.items?.[0];
        if (top && lastCount.current !== null && count > lastCount.current) {
          toast(`New order #${top.oid} from ${top.customer?.name || 'customer'}`, 'info');
        }
        lastCount.current = count;
      } catch {}
      if (!stop) setTimeout(check, 15000);
    }
    check();
    return () => { stop = true; };
  }, [toast]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
  }

  const sidebar = (
    <nav className="flex flex-col gap-1 px-4 pb-10">
      <div className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Main Home</div>
      {MENU.map((item) => (
        <NavGroup key={item.label} item={item} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen">
      {/* desktop sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 hidden w-[296px] overflow-y-auto border-r border-slate-100 bg-white transition-transform lg:block ${collapsed ? '-translate-x-full' : ''}`}>
        <div className="flex h-[84px] items-center justify-between border-b border-slate-100 px-8">
          <Logo />
          <button onClick={() => setCollapsed(true)} className="text-slate-400 hover:text-slate-700" aria-label="Collapse sidebar">
            <IconCollapse width={18} height={18} />
          </button>
        </div>
        {sidebar}
      </aside>

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[290px] overflow-y-auto bg-white">
            <div className="flex h-[72px] items-center border-b border-slate-100 px-6">
              <Logo />
            </div>
            {sidebar}
          </aside>
        </div>
      )}

      <div className={`transition-[padding] ${collapsed ? 'lg:pl-0' : 'lg:pl-[296px]'}`}>
        <header className="sticky top-0 z-20 flex h-[84px] items-center gap-3 border-b border-slate-100 bg-white px-4 sm:px-8">
          <button
            onClick={() => (window.innerWidth >= 1024 ? setCollapsed((c) => !c) : setMobileOpen(true))}
            className={`text-slate-600 ${collapsed ? '' : 'lg:hidden'}`}
            aria-label="Open menu"
          >
            <IconMenu />
          </button>
          <div className="flex-1" />
          {pending > 0 && (
            <Link href="/orders" className="flex items-center gap-2 rounded bg-red-600 px-3 py-1.5 text-sm font-semibold text-white">
              <IconBell width={16} height={16} /> {pending} new order{pending > 1 ? 's' : ''}
            </Link>
          )}
          <button onClick={playChime} className="hidden items-center gap-1 rounded border border-slate-400 px-2 py-1 text-xs text-slate-600 sm:flex">
            <IconBell width={14} height={14} /> Test Sound
          </button>
          <select
            value={site}
            onChange={(e) => {
              setSite(e.target.value);
              try { localStorage.setItem('tgf_site', e.target.value); } catch {}
            }}
            className="hidden w-44 rounded border border-slate-200 bg-white px-2 py-1.5 text-[15px] sm:block"
          >
            {websites.length === 0 && <option value="">TheGiftsForever</option>}
            {websites.map((w) => (
              <option key={w._id} value={w._id}>{w.name}</option>
            ))}
          </select>
          <div className="ml-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
              {(adminName || 'A').slice(0, 1).toUpperCase()}
            </div>
            <div className="hidden leading-tight sm:block">
              <div className="text-[15px] font-semibold">{adminName}</div>
              <div className="text-xs text-slate-400">Admin</div>
            </div>
            <button onClick={logout} title="Logout" className="ml-2 text-slate-400 hover:text-red-600">
              <IconLogout />
            </button>
          </div>
        </header>
        <main className="px-4 py-8 sm:px-8">{children}</main>
        <footer className="border-t border-slate-100 bg-white py-6 text-center text-[15px] text-slate-600">
          Copyright © {new Date().getFullYear()} TheGiftsForever
        </footer>
      </div>
    </div>
  );
}
