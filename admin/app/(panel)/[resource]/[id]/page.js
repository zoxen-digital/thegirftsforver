import { notFound } from 'next/navigation';
import ResourceForm from '@/components/ResourceForm';
import { UI } from '@/lib/resourceUi';

export default async function EditPage({ params }) {
  const { resource, id } = await params;
  if (!UI[resource]) notFound();
  return <ResourceForm resource={resource} id={id} />;
}
