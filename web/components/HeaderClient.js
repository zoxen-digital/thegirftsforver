'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Logo from './Logo';
import { useCart } from './CartProvider';
import { CurrencySelect } from './Currency';
import { IconCart, IconMail, IconMenu, IconPhone, IconSearch, IconWhatsApp, IconX, SOCIALS } from './Icons';


export default function HeaderClient({ menu, site }) {
  const { count } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 10);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function submit(e) {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  const links = [
    ['Home', '/'],
    ['Shop', '/categories'],
    ...menu.slice(0, 4).map((c) => [c.name, `/category/${c.slug}`]),
    ['Blog', '/blogs'],
    ['Contact', '/contact'],
  ];

  const searchBox = (
    <form onSubmit={submit} className="flex w-full items-center gap-2 rounded-full border border-ink/10 bg-white py-1 pl-4 pr-1 shadow-sm">
      <IconSearch width={18} height={18} className="shrink-0 text-muted" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search roses, chocolates, cakes…" className="min-w-0 flex-1 bg-transparent py-1.5 text-sm outline-none" />
      <button className="rounded-full bg-wine px-4 py-1.5 text-sm font-semibold text-white">Search</button>
    </form>
  );

  return (
    <>
      <div className="bg-wine text-[12.5px] text-white/90">
        <div className="container-x flex h-9 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="flex shrink-0 items-center gap-1.5 hover:text-white">
              <IconPhone width={14} height={14} /> {site.phone}
            </a>
            <a href={`mailto:${site.email}`} className="hidden items-center gap-1.5 hover:text-white sm:flex">
              <IconMail width={14} height={14} /> {site.email}
            </a>
          </div>
          <div className="flex items-center gap-3">
            {SOCIALS.map(([k, I]) => (
              <a key={k} href={site.social[k] || '#'} target="_blank" rel="noreferrer" aria-label={k} className="hover:text-white">
                <I width={15} height={15} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <header className={`sticky top-0 z-40 border-b transition ${scrolled ? 'border-ink/5 bg-cream/90 shadow-sm backdrop-blur-md' : 'border-ink/5 bg-cream'}`}>
        <div className="container-x flex h-[76px] items-center gap-4">
          <button onClick={() => setOpen(true)} className="-ml-1 p-1 xl:hidden" aria-label="Open menu">
            <IconMenu />
          </button>
          <Logo />
          <div className="mx-auto hidden w-full max-w-xl md:block">{searchBox}</div>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <CurrencySelect />
            <Link href="/cart" className="relative ml-2 p-1 text-ink transition hover:text-wine" aria-label="Cart">
              <IconCart width={34} height={34} strokeWidth={2} />
              {count > 0 && (
                <span className="absolute -left-3 top-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-wine px-1 text-[11px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
        <div className="container-x pb-3 md:hidden">{searchBox}</div>
        <nav className="container-x hidden h-11 items-center justify-center gap-7 border-t border-ink/5 xl:flex">
          {links.map(([l, h]) => (
            <Link key={h} href={h} className={`whitespace-nowrap text-[14.5px] font-medium transition hover:text-wine ${pathname === h ? 'text-wine' : 'text-ink/80'}`}>
              {l}
            </Link>
          ))}
        </nav>
      </header>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm animate-rise flex-col bg-cream">
            <div className="flex items-center justify-between border-b border-ink/5 p-4">
              <Logo />
              <button onClick={() => setOpen(false)} aria-label="Close menu"><IconX /></button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4">
              {links.map(([l, h]) => (
                <Link key={h} href={h} className="block border-b border-ink/5 py-3.5 text-[16px] font-medium">{l}</Link>
              ))}
              <div className="mt-6 eyebrow">More occasions</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {menu.slice(4).map((c) => (
                  <Link key={c.slug} href={`/category/${c.slug}`} className="rounded-full bg-blush px-3 py-1.5 text-sm text-wine">{c.name}</Link>
                ))}
              </div>
            </nav>
            <a href={`https://wa.me/${site.whatsapp}`} className="m-4 flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 font-semibold text-white">
              <IconWhatsApp /> Order on WhatsApp
            </a>
          </aside>
        </div>
      )}

      {/* floating WhatsApp */}
      <a
        href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent('Hi! I want to order a gift.')}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/20 transition hover:scale-105"
      >
        <IconWhatsApp width={28} height={28} />
      </a>
    </>
  );
}
