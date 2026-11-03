import OrderForm from '@/components/OrderForm';

export default async function EditOrder({ params }) {
  const { id } = await params;
  return <OrderForm id={id} />;
}
