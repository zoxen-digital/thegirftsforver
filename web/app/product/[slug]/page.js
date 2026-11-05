import Link from 'next/link';
import { notFound } from 'next/navigation';
import Gallery from '@/components/Gallery';
import BuyBox from '@/components/BuyBox';
import ProductCard from '@/components/ProductCard';
import Reviews from '@/components/Reviews';
import { getProduct, getRelated, getReviews, getSite, getSuggestions } from '@/lib/data';
import { IconStar } from '@/components/Icons';
import { img, salePrice } from '@/lib/utils';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: p.metaDescription || p.shortDescription?.replace(/<[^>]+>/g, '').slice(0, 160),
    keywords: p.metaKeywords,
    openGraph: { images: p.coverImage?.startsWith('http') ? [p.coverImage] : [] },
  };
}

function youtubeId(url = '') {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m?.[1];
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  const [related, suggestions, site, reviews] = await Promise.all([
    getRelated(p),
    getSuggestions(p),
    getSite(),
    getReviews({ kind: 'category', category: p.category?._id, limit: 6 }),
  ]);
  const images = [p.coverImage, ...(p.gallery || [])].filter(Boolean).map(img);
  const yt = youtubeId(p.youtubeUrl);
  const sale = salePrice(p.price, p.discount);
  const stars = reviews.length ? Math.round(reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length) : 5;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    image: images.filter((u) => u.startsWith('http')),
    description: p.metaDescription,
    offers: { '@type': 'Offer', priceCurrency: 'PKR', price: sale, availability: 'https://schema.org/InStock' },
  };

  return (
    <div className="container-x pt-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted">
        <Link href="/" className="hover:text-wine">Home</Link> /
        {p.category && <><Link href={`/category/${p.category.slug}`} className="hover:text-wine">{p.category.name}</Link> /</>}
        <span className="line-clamp-1 text-ink">{p.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <Gallery images={images.length ? images : ['/placeholder.svg']} alt={p.name} />
        <div>
          <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">{p.name}</h1>
          <div className="mt-3 flex gap-0.5" aria-label={`${stars} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((n) => <IconStar key={n} filled={n <= stars} width={20} height={20} />)}
          </div>
          <BuyBox
            product={{
              _id: p._id,
              name: p.name,
              slug: p.slug,
              image: images[0],
              price: p.price,
              discount: p.discount,
              variations: p.variations || {},
              modifiers: p.modifiers || [],
              imagesNeed: p.imagesNeed || 0,
              form: p.form ? { name: p.form.name, fields: p.form.fields || [] } : null,
              freeDelivery: p.freeDelivery,
            }}
            whatsapp={site.whatsapp}
            suggestions={suggestions}
          />
          {p.shortDescription && <div className="prose-gift mt-6 text-[15px]" dangerouslySetInnerHTML={{ __html: p.shortDescription }} />}
          {p.tags?.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {p.tags.map((t) => <span key={t._id} className="rounded-full bg-blush px-3 py-1 text-xs font-medium text-wine">{t.name}</span>)}
            </div>
          )}
        </div>
      </div>

      {(p.description || yt) && (
        <section className="mt-16 grid gap-10 lg:grid-cols-[2fr_1fr]">
          {p.description && (
            <div>
              <h2 className="section-title mb-6 text-2xl sm:text-3xl">About this gift</h2>
              <div className="prose-gift" dangerouslySetInnerHTML={{ __html: p.description }} />
            </div>
          )}
          {yt && (
            <div className="aspect-video overflow-hidden rounded-3xl bg-ink">
              <iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${yt}`} title={p.name} allowFullScreen loading="lazy" />
            </div>
          )}
        </section>
      )}

      <div className="-mx-4 sm:-mx-6 lg:-mx-8">
        <Reviews reviews={reviews} title="Reviews for this collection" />
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="section-title mb-8">You may also love</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
            {related.slice(0, 8).map((r) => <ProductCard key={r._id} p={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
