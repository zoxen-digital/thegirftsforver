import Image from 'next/image';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { IconGift, IconHeart, IconShield, IconTruck } from '@/components/Icons';

export const metadata = { title: 'About Us', description: 'The story behind TheGiftsForever — Pakistan’s thoughtful online gifting studio.' };

const VALUES = [
  [IconHeart, 'Made with heart', 'Every hamper is assembled by hand and checked twice before it leaves our studio.'],
  [IconTruck, 'On time, every time', 'Our own riders in Karachi plus trusted partners nationwide.'],
  [IconShield, 'Freshness promise', 'Flowers and cakes are prepared on the day of delivery — or we replace them.'],
  [IconGift, 'Wrapped to impress', 'Signature wine-and-gold packaging with a handwritten card.'],
];

export default function About() {
  return (
    <>
      <PageHeader title="Gifts that last forever" eyebrow="Our story" crumbs={[['About']]} />
      <section className="container-x mt-16 grid items-center gap-12 lg:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[32px]">
          <Image src="https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=1200&q=80" alt="Gift wrapping in our studio" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
        </div>
        <div>
          <p className="eyebrow">Since 2019</p>
          <h2 className="section-title mt-3">We bring people closer — one gift at a time</h2>
          <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-ink/80">
            <p>TheGiftsForever started with a simple idea: distance shouldn’t stop you from being there for the people you love. Whether you live in Dubai, London or down the road, we help you celebrate birthdays, anniversaries, Eid and every quiet “thinking of you” moment.</p>
            <p>Our studio in Karachi curates fresh flowers, artisan cakes, gourmet chocolates and personalised keepsakes, then delivers them with care across Pakistan.</p>
            <p>Thousands of smiles later, we’re still obsessed with the details — the ribbon, the card, the timing — because that’s what turns a present into a memory.</p>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[['25k+', 'Gifts delivered'], ['120+', 'Cities served'], ['4.9★', 'Average rating']].map(([n, l]) => (
              <div key={l} className="rounded-2xl bg-white p-4">
                <div className="font-display text-3xl font-semibold text-wine">{n}</div>
                <div className="mt-1 text-xs text-muted">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="container-x mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {VALUES.map(([Icon, t, d]) => (
          <div key={t} className="rounded-3xl bg-white p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blush text-wine"><Icon /></span>
            <h3 className="mt-5 text-lg font-semibold">{t}</h3>
            <p className="mt-2 text-sm text-muted">{d}</p>
          </div>
        ))}
      </section>
      <div className="container-x mt-16 text-center">
        <Link href="/categories" className="btn-wine">Explore our gifts</Link>
      </div>
    </>
  );
}
