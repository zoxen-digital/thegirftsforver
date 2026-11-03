import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { IconChevronDown } from '@/components/Icons';

export const metadata = { title: 'FAQs', description: 'Answers about delivery, payments, personalisation and more.' };

const FAQ = [
  ['Do you offer same-day delivery?', 'Yes. Orders placed before 4 PM are delivered the same day in Karachi. Other major cities receive gifts within 24–48 hours.'],
  ['Can I order from outside Pakistan?', 'Absolutely — most of our customers send gifts from the UAE, UK, USA and Canada. Pay by bank transfer or let the receiver pay cash on delivery.'],
  ['Will I get a photo of the delivery?', 'Yes, we WhatsApp you a photo of your gift before dispatch and once it has been delivered (with the receiver’s permission).'],
  ['Can I add a personal message?', 'Every order includes a complimentary card. Add your message at checkout and we’ll handwrite it.'],
  ['How do personalised gifts work?', 'For photo frames, mugs and custom boxes you upload your photos on the product page. Our designers share a preview before printing when needed.'],
  ['What payment methods do you accept?', 'Cash on delivery, bank transfer, JazzCash and EasyPaisa. Card payments are available on request.'],
  ['What if the flowers aren’t fresh?', 'We prepare flowers on the day of delivery. If anything isn’t perfect, send us a photo within 12 hours and we’ll replace it free.'],
  ['Can I schedule a midnight surprise?', 'Yes, choose the midnight slot at checkout for Karachi, Lahore and Islamabad (a small surcharge may apply).'],
];

export default function Faq() {
  return (
    <>
      <PageHeader title="Frequently asked questions" eyebrow="Help centre" crumbs={[['FAQs']]} />
      <div className="container-x mt-12 max-w-3xl space-y-3">
        {FAQ.map(([q, a]) => (
          <details key={q} className="group rounded-2xl bg-white p-5 open:shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
              {q}
              <IconChevronDown width={18} height={18} className="shrink-0 text-wine transition group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">{a}</p>
          </details>
        ))}
        <p className="pt-6 text-center text-sm text-muted">
          Still have questions? <Link href="/contact" className="text-wine underline">Contact us</Link>
        </p>
      </div>
    </>
  );
}
