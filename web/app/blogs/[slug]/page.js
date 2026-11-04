import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Faqs from '@/components/Faqs';
import { getBlog, getBlogs } from '@/lib/data';
import { img } from '@/lib/utils';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const b = await getBlog(slug);
  if (!b) return {};
  return { title: b.metaTitle || b.title, description: b.metaDescription || b.excerpt, keywords: b.metaKeywords };
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const b = await getBlog(slug);
  if (!b) notFound();
  const more = (await getBlogs(4)).filter((x) => x.slug !== slug).slice(0, 3);
  return (
    <article className="pt-10">
      <header className="container-x max-w-3xl text-center">
        <Link href="/blogs" className="eyebrow">Gifting journal</Link>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">{b.title}</h1>
        <p className="mt-4 text-sm text-muted">{b.author} · {new Date(b.createdAt).toLocaleDateString('en-GB', { dateStyle: 'long' })}</p>
      </header>
      <div className="container-x mt-10">
        <div className="relative aspect-[21/9] overflow-hidden rounded-[32px] bg-blush">
          <Image src={img(b.coverImage)} alt={b.title} fill priority sizes="100vw" className="object-cover" />
        </div>
      </div>
      <div className="prose-gift container-x mt-12 max-w-3xl" dangerouslySetInnerHTML={{ __html: b.content || '' }} />
      <Faqs items={b.faqs} />
      {more.length > 0 && (
        <section className="container-x mt-20">
          <h2 className="section-title mb-6 text-2xl">Keep reading</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {more.map((m) => (
              <Link key={m._id} href={`/blogs/${m.slug}`} className="group">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-blush">
                  <Image src={img(m.coverImage)} alt={m.title} fill sizes="33vw" className="object-cover transition group-hover:scale-105" />
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold group-hover:text-wine">{m.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
