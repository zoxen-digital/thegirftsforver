import PageHeader from '@/components/PageHeader';
import ProductCard from '@/components/ProductCard';
import { searchProducts } from '@/lib/data';

export const metadata = { title: 'Search', robots: { index: false } };

export default async function Search({ searchParams }) {
  const { q = '' } = await searchParams;
  const items = await searchProducts(q.slice(0, 80));
  return (
    <>
      <PageHeader title={q ? `Results for “${q}”` : 'Search'} crumbs={[['Search']]}>
        <form className="mt-6 flex max-w-xl gap-2">
          <input name="q" defaultValue={q} className="field rounded-full" placeholder="Search gifts…" />
          <button className="btn-wine">Search</button>
        </form>
      </PageHeader>
      <div className="container-x mt-10">
        {items.length ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
            {items.map((p) => <ProductCard key={p._id} p={p} />)}
          </div>
        ) : (
          <p className="rounded-3xl bg-white p-12 text-center text-muted">{q ? 'No gifts matched your search. Try “roses”, “cake” or “hamper”.' : 'Type something to search.'}</p>
        )}
      </div>
    </>
  );
}
