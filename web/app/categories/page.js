import Image from 'next/image';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { getAllCategories } from '@/lib/data';
import { img } from '@/lib/utils';

export const metadata = { title: 'All Gift Categories' };

export default async function CategoriesPage() {
  const all = await getAllCategories();
  const parents = all.filter((c) => !c.parent);
  const kids = (id) => all.filter((c) => c.parent === id);

  return (
    <>
      <PageHeader title="Shop all occasions" eyebrow="Categories" crumbs={[['Categories']]}>
        <p className="mt-3 max-w-xl text-muted">{all.length} curated collections for birthdays, anniversaries, Eid and every moment in between.</p>
      </PageHeader>
      <div className="container-x mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {parents.map((c) => (
          <div key={c._id} className="group">
            <Link href={`/category/${c.slug}`} className="relative block aspect-[4/5] overflow-hidden rounded-3xl bg-blush">
              <Image src={img(c.image)} alt={c.name} fill sizes="(max-width:640px) 50vw, 25vw" className="object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
              <span className="absolute inset-x-4 bottom-4 font-display text-xl font-semibold text-white sm:text-2xl">{c.name}</span>
            </Link>
            {kids(c._id).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {kids(c._id).map((k) => (
                  <Link key={k._id} href={`/category/${k.slug}`} className="rounded-full bg-blush px-3 py-1 text-xs text-wine hover:bg-rose/40">{k.name}</Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
