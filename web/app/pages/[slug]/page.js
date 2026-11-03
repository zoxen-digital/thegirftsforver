import { notFound } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import { getPage } from '@/lib/data';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await getPage(slug);
  if (!p) return {};
  return { title: p.metaTitle || p.title, description: p.metaDescription, keywords: p.metaKeywords };
}

export default async function ContentPage({ params }) {
  const { slug } = await params;
  const p = await getPage(slug);
  if (!p) notFound();
  return (
    <>
      <PageHeader title={p.title} crumbs={[[p.title]]} />
      <div className="prose-gift container-x mt-12 max-w-3xl" dangerouslySetInnerHTML={{ __html: p.content || '' }} />
    </>
  );
}
