import Link from 'next/link';

export default function PageHeader({ title, eyebrow, crumbs = [], children }) {
  return (
    <section className="relative overflow-hidden bg-blush">
      <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-rose/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-10 h-60 w-60 rounded-full bg-gold/20 blur-3xl" />
      <div className="container-x relative py-12 sm:py-16">
        <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted">
          <Link href="/" className="hover:text-wine">Home</Link>
          {crumbs.map(([l, h]) => (
            <span key={l} className="flex items-center gap-2">
              <span>/</span>
              {h ? <Link href={h} className="hover:text-wine">{l}</Link> : <span className="text-ink">{l}</span>}
            </span>
          ))}
        </nav>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">{title}</h1>
        {children}
      </div>
    </section>
  );
}
