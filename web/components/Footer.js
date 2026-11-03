import Link from 'next/link';
import Logo from './Logo';
import { IconFacebook, IconInstagram, IconMail, IconPhone, IconPin, IconTiktok, IconWhatsApp } from './Icons';

export default function Footer({ site, categories, pages }) {
  return (
    <footer className="mt-24 bg-ink text-white/75">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-relaxed">
            Handpicked flowers, gourmet hampers and keepsake gift boxes — wrapped with love and delivered to your
            loved ones across Pakistan, from anywhere in the world.
          </p>
          <div className="mt-6 flex gap-3">
            {[IconInstagram, IconFacebook, IconTiktok].map((I, i) => (
              <a key={i} href="#" aria-label="Social link" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 transition hover:border-gold hover:text-gold">
                <I width={18} height={18} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-5 font-display text-lg text-white">Shop</h4>
          <ul className="space-y-2.5 text-sm">
            {categories.slice(0, 7).map((c) => (
              <li key={c.slug}><Link href={`/category/${c.slug}`} className="hover:text-gold">{c.name}</Link></li>
            ))}
            <li><Link href="/categories" className="text-gold">All categories →</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-5 font-display text-lg text-white">Help</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/about" className="hover:text-gold">About us</Link></li>
            <li><Link href="/contact" className="hover:text-gold">Contact</Link></li>
            <li><Link href="/faq" className="hover:text-gold">FAQs</Link></li>
            <li><Link href="/track-order" className="hover:text-gold">Track your order</Link></li>
            <li><Link href="/blogs" className="hover:text-gold">Gifting blog</Link></li>
            {pages.map((p) => (
              <li key={p.slug}><Link href={`/pages/${p.slug}`} className="hover:text-gold">{p.title}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-5 font-display text-lg text-white">Get in touch</h4>
          <ul className="space-y-3.5 text-sm">
            <li className="flex gap-3"><IconPin width={18} height={18} className="mt-0.5 shrink-0 text-gold" /> {site.address}</li>
            <li className="flex gap-3"><IconPhone width={18} height={18} className="shrink-0 text-gold" /> <a href={`tel:${site.phone.replace(/\s/g, '')}`}>{site.phone}</a></li>
            <li className="flex gap-3"><IconWhatsApp width={18} height={18} className="shrink-0 text-gold" /> <a href={`https://wa.me/${site.whatsapp}`}>WhatsApp us</a></li>
            <li className="flex gap-3"><IconMail width={18} height={18} className="shrink-0 text-gold" /> <a href={`mailto:${site.email}`}>{site.email}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-6 text-xs sm:flex-row">
          <span>© {new Date().getFullYear()} TheGiftsForever. All rights reserved.</span>
          <span>
            Designed &amp; Developed by{' '}
            <a href="https://zoxendigital.com" target="_blank" rel="noopener" className="font-semibold text-gold hover:underline">Zoxen Digital</a>
          </span>
          <span>Cash on delivery · Bank transfer · Secure checkout</span>
        </div>
      </div>
    </footer>
  );
}
