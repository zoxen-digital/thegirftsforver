import { notFound } from 'next/navigation';
import ResourceForm from '@/components/ResourceForm';
import { UI } from '@/lib/resourceUi';

export default async function NewPage({ params, searchParams }) {
  const { resource } = await params;
  const { duplicate } = await searchParams;
  if (!UI[resource]) notFound();
  return <ResourceForm resource={resource} duplicateOf={duplicate} />;
}
