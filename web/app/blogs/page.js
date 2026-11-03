import Image from 'next/image';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { getBlogs } from '@/lib/data';
import { img } from '@/lib/utils';

export const metadata = { title: 'Gifting Blog', description: 'Gift ideas, occasion guides and flower care tips from TheGiftsForever.' };

export default async function Blogs() {
  const blogs = await getBlogs();
  const [first, ...rest] = blogs;
  return (
    <>
      <PageHeader title="The gifting journal" eyebrow="Blog" crumbs={[['Blog']]} />
      <div className="container-x mt-12">
        {!first && <p className="rounded-3xl bg-white p-12 text-center text-muted">No articles yet.</p>}
        {first && (
          <Link href={`/blogs/${first.slug}`} className="group grid overflow-hidden rounded-[32px] bg-white md:grid-cols-2">
            <div className="relative min-h-72">
              <Image src={img(first.coverImage)} alt={first.title} fill priority sizes="(max-width:768px) 100vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-12">
              <p className="eyebrow">Featured</p>
              <h2 className="mt-3 font-display text-3xl font-semibold group-hover:text-wine">{first.title}</h2>
              <p className="mt-4 text-muted">{first.excerpt}</p>
              <span className="mt-6 text-sm text-muted">{first.author} · {new Date(first.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}</span>
            </div>
          </Link>
        )}
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((b) => (
            <Link key={b._id} href={`/blogs/${b.slug}`} className="group">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-blush">
                <Image src={img(b.coverImage)} alt={b.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold group-hover:text-wine">{b.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-muted">{b.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
