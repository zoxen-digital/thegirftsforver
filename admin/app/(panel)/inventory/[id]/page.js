import ResourceForm from '@/components/ResourceForm';

export default async function EditInventoryItem({ params }) {
  const { id } = await params;
  return <ResourceForm resource="inventory" id={id} />;
}
