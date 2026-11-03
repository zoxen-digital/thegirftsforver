import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/components/CartProvider';
import HeaderClient from '@/components/HeaderClient';
import Footer from '@/components/Footer';
import { getAllCategories, getFooterPages, getMenuCategories, getSite } from '@/lib/data';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const dynamic = 'force-dynamic';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Send Gifts to Pakistan Online | Same Day Delivery - TheGiftsForever',
    template: '%s | TheGiftsForever',
  },
  description:
    'Send flowers, cakes, chocolates, gift hampers and personalised gifts to Pakistan. Same-day delivery in Karachi and fast nationwide delivery.',
  openGraph: { siteName: 'TheGiftsForever', type: 'website' },
};

export default async function RootLayout({ children }) {
  const [site, menu, categories, pages] = await Promise.all([getSite(), getMenuCategories(), getAllCategories(), getFooterPages()]);
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <CartProvider>
          <HeaderClient menu={menu} site={site} />
          <main className="min-h-[60vh]">{children}</main>
          <Footer site={site} categories={categories.filter((c) => !c.parent)} pages={pages} />
        </CartProvider>
      </body>
    </html>
  );
}
