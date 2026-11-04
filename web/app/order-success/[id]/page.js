import Link from 'next/link';
import { IconCheck, IconWhatsApp } from '@/components/Icons';
import Steps from '@/components/Steps';
import { getSite } from '@/lib/data';

export const metadata = { title: 'Order placed', robots: { index: false } };

export default async function OrderSuccess({ params }) {
  const { id } = await params;
  const site = await getSite();
  return (
    <div className="container-x pt-10">
      <Steps current={3} />
      <div className="mx-auto mt-10 max-w-xl rounded-[32px] bg-white p-10 text-center shadow-sm">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <IconCheck width={30} height={30} />
        </span>
        <h1 className="mt-6 font-display text-4xl font-semibold">Thank you!</h1>
        <p className="mt-3 text-muted">Your order <b className="text-ink">#{id}</b> has been placed. Our team will confirm it on WhatsApp shortly.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Hi! I just placed order #${id}`)}`} className="btn-wine bg-[#25D366]! shadow-none hover:bg-[#1ea952]!">
            <IconWhatsApp width={18} height={18} /> Confirm on WhatsApp
          </a>
          <Link href="/categories" className="btn-ghost">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}
