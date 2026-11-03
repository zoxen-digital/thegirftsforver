import { notFound } from 'next/navigation';
import ResourceTable from '@/components/ResourceTable';
import { UI } from '@/lib/resourceUi';

export default async function ListPage({ params }) {
  const { resource } = await params;
  if (!UI[resource]?.columns) notFound();
  return <ResourceTable resource={resource} />;
}
