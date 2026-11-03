import PageHeader from '@/components/PageHeader';
import ContactForm from '@/components/ContactForm';
import { IconClock, IconMail, IconPhone, IconPin, IconWhatsApp } from '@/components/Icons';
import { getSite } from '@/lib/data';

export const metadata = { title: 'Contact Us', description: 'Talk to our gifting team on WhatsApp, phone or email.' };

export default async function Contact() {
  const site = await getSite();
  const cards = [
    [IconWhatsApp, 'WhatsApp', 'Fastest way to reach us', `https://wa.me/${site.whatsapp}`, `+${site.whatsapp}`],
    [IconPhone, 'Call us', '10 AM – 10 PM, every day', `tel:${site.phone.replace(/\s/g, '')}`, site.phone],
    [IconMail, 'Email', 'We reply within a few hours', `mailto:${site.email}`, site.email],
    [IconPin, 'Studio', 'Pickup by appointment', null, site.address],
  ];
  return (
    <>
      <PageHeader title="We’re here to help" eyebrow="Contact" crumbs={[['Contact']]}>
        <p className="mt-3 flex items-center gap-2 text-muted"><IconClock width={16} height={16} /> Open daily, including Sundays and Eid holidays.</p>
      </PageHeader>
      <div className="container-x mt-12 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {cards.map(([Icon, t, d, href, v]) => {
            const body = (
              <>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blush text-wine"><Icon /></span>
                <span>
                  <span className="block font-semibold">{t}</span>
                  <span className="block text-xs text-muted">{d}</span>
                  <span className="mt-1 block text-sm text-wine">{v}</span>
                </span>
              </>
            );
            return href ? (
              <a key={t} href={href} className="flex gap-4 rounded-3xl bg-white p-5 transition hover:shadow-md">{body}</a>
            ) : (
              <div key={t} className="flex gap-4 rounded-3xl bg-white p-5">{body}</div>
            );
          })}
        </div>
        <ContactForm whatsapp={site.whatsapp} />
      </div>
    </>
  );
}
