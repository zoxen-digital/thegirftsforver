import CheckoutForm from './CheckoutForm';
import { getSite } from '@/lib/data';

export const metadata = { title: 'Checkout', robots: { index: false } };

export default async function CheckoutPage() {
  const site = await getSite();
  return <CheckoutForm delivery={site.delivery} payments={site.payments} freeOver={site.freeOver} />;
}
