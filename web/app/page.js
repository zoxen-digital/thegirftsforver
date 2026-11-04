import Image from 'next/image';
import Link from 'next/link';
import HeroSlider from '@/components/HeroSlider';
import ProductCard from '@/components/ProductCard';
import Reviews from '@/components/Reviews';
import { IconArrowRight, IconHeart } from '@/components/Icons';
import { getAllCategories, getBlogs, getHomeRows, getReviews, getSlides } from '@/lib/data';
import { img } from '@/lib/utils';

const FALLBACK_SLIDES = [
  {
    _id: 'f1',
    image: '/hero/basket1.avif',
    eyebrow: 'The art of gifting',
    title: 'Gifts that say it better than words',
    content: 'Handcrafted hampers, fresh blooms and keepsakes delivered to your loved ones across Pakistan.',
    link: '/categories',
  },
];

export default async function Home() {
  const [slides, categories, rows, reviews, blogs] = await Promise.all([
    getSlides(),
    getAllCategories(),
    getHomeRows(8),
    getReviews({ limit: 6 }),
    getBlogs(3),
  ]);
  const topCats = categories.filter((c) => !c.parent && c.image).slice(0, 8);

  return (
    <>
      <HeroSlider slides={slides.length ? slides : FALLBACK_SLIDES} />

      {/* categories */}
      {topCats.length > 0 && (
        <section className="container-x mt-14">
          <div className="mb-8">
            <p className="eyebrow">Shop by occasion</p>
            <h2 className="section-title mt-2">Find the perfect gift</h2>
          </div>
          <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 lg:grid-cols-8">
            {topCats.map((c) => (
              <Link key={c._id} href={`/category/${c.slug}`} className="group w-28 shrink-0 snap-start text-center sm:w-auto">
                <div className="relative mx-auto aspect-square overflow-hidden rounded-full border-4 border-white bg-blush shadow-md ring-1 ring-ink/5">
                  <Image src={img(c.image)} alt={c.name} fill sizes="140px" className="object-cover transition duration-500 group-hover:scale-110" />
                </div>
                <span className="mt-3 block text-[13.5px] font-medium leading-tight group-hover:text-wine">{c.name}</span>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/categories" className="btn-wine">View all categories <IconArrowRight width={16} height={16} /></Link>
          </div>
        </section>
      )}

      {/* first two rows */}
      {rows.slice(0, 2).map((r, idx) => (
        <ProductRow key={r.category._id} row={r} priority={idx === 0} />
      ))}

      {/* editorial banners */}
      <section className="container-x mt-24 grid gap-5 md:grid-cols-2">
        <Banner
          href="/categories"
          image="https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=1200&q=80"
          eyebrow="For her"
          title="Blooms she'll remember"
          text="Imported roses, tulips and lilies arranged by our in-house florists."
        />
        <Banner
          href="/categories"
          image="https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=1200&q=80"
          eyebrow="For him"
          title="Hampers he'll actually love"
          text="Watches, wallets, fragrances and gourmet treats — curated in one box."
          dark
        />
      </section>

      {rows.slice(2).map((r) => (
        <ProductRow key={r.category._id} row={r} />
      ))}

      {/* how it works */}
      <section className="container-x mt-24">
        <div className="relative overflow-hidden rounded-[32px] bg-wine px-6 py-16 text-white sm:px-14">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_2fr] lg:items-center">
            <div>
              <p className="eyebrow">How it works</p>
              <h2 className="mt-3 font-display text-4xl font-semibold">Send love in three easy steps</h2>
              <p className="mt-4 text-white/75">From abroad or across town — we handle everything from wrapping to the doorstep smile.</p>
            </div>
            <ol className="grid gap-5 sm:grid-cols-3">
              {[
                ['01', 'Pick a gift', 'Browse flowers, cakes, hampers and personalised keepsakes.'],
                ['02', 'Add a message', 'Write a card note and choose the delivery date.'],
                ['03', 'We deliver', 'Hand-delivered with a photo sent to you on WhatsApp.'],
              ].map(([n, t, d]) => (
                <li key={n} className="rounded-3xl bg-white/10 p-6 backdrop-blur">
                  <span className="font-display text-3xl text-gold">{n}</span>
                  <h3 className="mt-3 text-lg font-semibold">{t}</h3>
                  <p className="mt-2 text-sm text-white/70">{d}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <Reviews reviews={reviews} />

      {blogs.length > 0 && (
        <section className="container-x mt-24">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="eyebrow">From the journal</p>
              <h2 className="section-title mt-2">Gifting ideas & guides</h2>
            </div>
            <Link href="/blogs" className="hidden items-center gap-1.5 text-sm font-semibold text-wine sm:flex">All articles <IconArrowRight width={16} height={16} /></Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {blogs.map((b) => (
              <Link key={b._id} href={`/blogs/${b.slug}`} className="group">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-blush">
                  <Image src={img(b.coverImage)} alt={b.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold leading-snug group-hover:text-wine">{b.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted">{b.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container-x mt-24">
        <div className="flex flex-col items-center gap-5 rounded-[32px] bg-blush px-6 py-14 text-center">
          <IconHeart className="text-wine" width={32} height={32} />
          <h2 className="section-title max-w-2xl">Can’t find the perfect gift? Let us curate one for you.</h2>
          <p className="max-w-xl text-muted">Tell us the occasion and budget on WhatsApp and our gifting experts will build a custom hamper.</p>
          <Link href="/contact" className="btn-wine">Talk to a gifting expert</Link>
        </div>
      </section>
    </>
  );
}

function ProductRow({ row, priority }) {
  return (
    <section className="container-x mt-20">
      <div className="mb-7 flex items-end justify-between gap-4">
        <h2 className="section-title">{row.category.name}</h2>
        <Link href={`/category/${row.category.slug}`} className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-wine">
          View more <IconArrowRight width={16} height={16} />
        </Link>
      </div>
      <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {row.products.slice(0, 4).map((p, i) => (
          <div key={p._id} className="w-[64%] shrink-0 snap-start sm:w-auto">
            <ProductCard p={p} priority={priority && i < 2} />
          </div>
        ))}
      </div>
    </section>
  );
}

function Banner({ href, image, eyebrow, title, text, dark }) {
  return (
    <Link href={href} className="group relative flex min-h-[340px] overflow-hidden rounded-[28px]">
      <Image src={image} alt={title} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
      <div className={`absolute inset-0 ${dark ? 'bg-gradient-to-t from-ink/85 to-ink/10' : 'bg-gradient-to-t from-wine/85 to-wine/5'}`} />
      <div className="relative mt-auto p-8 text-white">
        <p className="eyebrow">{eyebrow}</p>
        <h3 className="mt-2 font-display text-3xl font-semibold">{title}</h3>
        <p className="mt-2 max-w-sm text-sm text-white/80">{text}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold">Shop now <IconArrowRight width={16} height={16} /></span>
      </div>
    </Link>
  );
}
