import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import ProductCard from '@/components/ProductCard';
import Reviews from '@/components/Reviews';
import Faqs from '@/components/Faqs';
import { getCategory, getCategoryProducts, getReviews } from '@/lib/data';
import { img } from '@/lib/utils';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const c = await getCategory(slug);
  if (!c) return {};
  return {
    title: c.metaTitle || c.name,
    description: c.metaDescription,
    keywords: c.metaKeywords,
    openGraph: { images: c.image?.startsWith('http') ? [c.image] : [] },
  };
}

const SORTS = [['featured', 'Featured'], ['latest', 'Newest'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low'], ['name', 'Name A–Z']];

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const c = await getCategory(slug);
  if (!c) notFound();
  const page = Math.max(1, Number(sp.page) || 1);
  const sort = sp.sort || 'featured';
  const [{ items, total, pages }, reviews] = await Promise.all([
    getCategoryProducts(c._id, { sort, page, min: sp.min, max: sp.max }),
    getReviews({ kind: 'category', category: c._id, limit: 6 }),
  ]);
  const href = (p) => `?${new URLSearchParams({ ...sp, page: String(p) })}`;

  return (
    <>
      <PageHeader title={c.name} eyebrow="Collection" crumbs={[['Categories', '/categories'], [c.name]]}>
        <p className="mt-3 text-muted">{total} gift{total === 1 ? '' : 's'} available</p>
      </PageHeader>

      <div className="container-x mt-10">
        {c.children?.length > 0 && (
          <div className="no-scrollbar mb-8 flex gap-3 overflow-x-auto">
            {c.children.map((k) => (
              <Link key={k._id} href={`/category/${k.slug}`} className="flex shrink-0 items-center gap-2 rounded-full border border-ink/10 bg-white py-1.5 pl-1.5 pr-4 text-sm hover:border-wine">
                <span className="relative h-8 w-8 overflow-hidden rounded-full bg-blush">
                  <Image src={img(k.image)} alt="" fill sizes="32px" className="object-cover" />
                </span>
                {k.name}
              </Link>
            ))}
          </div>
        )}

        <form className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-ink/5 bg-white p-3">
          <select name="sort" defaultValue={sort} className="rounded-full border border-ink/10 bg-cream px-4 py-2 text-sm">
            {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <input name="min" defaultValue={sp.min} type="number" placeholder="Min PKR" className="w-28 rounded-full border border-ink/10 bg-cream px-4 py-2 text-sm" />
          <input name="max" defaultValue={sp.max} type="number" placeholder="Max PKR" className="w-28 rounded-full border border-ink/10 bg-cream px-4 py-2 text-sm" />
          <button className="rounded-full bg-wine px-5 py-2 text-sm font-semibold text-white">Apply</button>
          {(sp.min || sp.max || sp.sort) && <Link href={`/category/${slug}`} className="text-sm text-muted underline">Reset</Link>}
        </form>

        {items.length ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
            {items.map((p, i) => <ProductCard key={p._id} p={p} priority={i < 4} />)}
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-16 text-center text-muted">No gifts here yet — check back soon.</div>
        )}

        {pages > 1 && (
          <nav className="mt-12 flex justify-center gap-2">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link key={n} href={href(n)} className={`flex h-10 w-10 items-center justify-center rounded-full text-sm ${n === page ? 'bg-wine text-white' : 'bg-white hover:bg-blush'}`}>{n}</Link>
            ))}
          </nav>
        )}

        {c.description && (
          <article className="prose-gift mx-auto mt-20 max-w-3xl rounded-3xl bg-white p-8 sm:p-12" dangerouslySetInnerHTML={{ __html: c.description }} />
        )}
      </div>

      <Faqs items={c.faqs} />

      <Reviews reviews={reviews} title={`What customers say about ${c.name}`} />
    </>
  );
}
