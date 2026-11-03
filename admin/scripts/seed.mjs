// Seeds demo content for TheGiftsForever.
//   npm run seed            -> only seeds when the catalog is empty
//   npm run seed -- --fresh -> wipes catalog/content collections first (orders & uploads are kept)
import mongoose from 'mongoose';
import * as M from '../lib/models.js';
import { slugify } from '../lib/utils.js';

const U = (id, w = 1200) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

const IMG = {
  giftBox: '1549465220-1a8b9238cd48',
  wrapping: '1513201099705-a9746e1e201f',
  bouquet: '1561181286-d3fee7d55364',
  giftBox2: '1607344645866-009c320b63e0',
  flowers: '1490750967868-88aa4486c946',
  flowers2: '1487530811176-3780de880c2d',
  rose: '1526047932273-341f2a7631f9',
  roses: '1518895949257-7621c3c786d7',
  choco: '1548907040-4baa42d10919',
  choco2: '1511381939415-e44015466834',
  cake: '1578985545062-69928b1d9587',
  cake2: '1464349095431-e9a21285b5f3',
  cake3: '1606312619070-d48b4c652a52',
  fruits: '1610832958506-aa56368176cf',
  fruits2: '1619566636858-adf3ef46400b',
  watch: '1523275335684-37898b6baf30',
  wallet: '1627123424574-724758594e93',
  perfume: '1541643600914-78b084683601',
  balloons: '1530103862676-de8c9debad1d',
  baby: '1515488042361-ee00e0ddd4e4',
  jewel: '1599643478518-a784e5dc4c8f',
  wrap2: '1512909006721-3d6018887383',
  teddy: '1558636508-e0db3814bd1d',
  wedding: '1606800052052-a08af7148866',
  tulips: '1584735175315-9d5df23860e6',
  flowerBox: '1563241527-3004b7be0ffd',
  cupcakes: '1535632066927-ab7c9ab60908',
  giftRed: '1481391319762-47dff72954d9',
  mug: '1514228742587-6b1558fcca3d',
  celebration: '1488477181946-6428a0291777',
  hamper: '1577805947697-89e18249d767',
  decor: '1586023492125-27b2c045efd7',
  bouquet2: '1520903920243-00d872a2d1c9',
  tshirt: '1521572163474-6864f9cf17ab',
  bag: '1553062407-98eeb64c6a62',
  giftPink: '1607083206869-4c7672e72a8a',
  peonies: '1612528443702-f6741f70a049',
  candle: '1602751584552-8ba73aad10e1',
  kids: '1609501676725-7186f017a4b7',
  sweets: '1573865526739-10659fec78a5',
  donuts: '1606787366850-de6330128bfc',
  sunflower: '1562690868-60bbe7293e94',
};

const P = (text) => `<p>${text}</p>`;

// featured categories become home page rows (in this order)
const CATEGORIES = [
  ['Gift for Her', IMG.giftPink, true, true],
  ['Gift for Him', IMG.watch, true, true],
  ['Roses Bouquets', IMG.roses, true, true],
  ['Chocolate Bouquets', IMG.choco, true, true],
  ['Cakes', IMG.cake, true, true],
  ['Flower Boxes', IMG.flowerBox, true, false],
  ['Chocolate Gift Boxes', IMG.choco2, true, false],
  ['Balloon Box Gifts', IMG.balloons, true, false],
  ['Gift Baskets', IMG.hamper, true, false],
  ['Fruit Baskets', IMG.fruits, true, false],
  ['Kids Gifts', IMG.kids, true, false],
  ['Baby Gifts', IMG.baby, true, false],
  ['Sorry Gifts', IMG.teddy, true, false],
  ['Birthday Gifts', IMG.celebration, false, true],
  ['Anniversary Gifts', IMG.wedding, false, true],
  ['Eid Gifts', IMG.sweets, false, false],
  ['Valentines Gifts', IMG.rose, false, false],
  ['Mothers Day Gifts', IMG.peonies, false, false],
  ['Corporate Gifting', IMG.giftBox, false, false],
];

// [name, category, price, discount, cover, gallery[], extra categories]
const PRODUCTS = [
  ['Blush & Bloom Pamper Box for Her', 'Gift for Her', 8500, 10, IMG.giftPink, [IMG.candle, IMG.perfume], ['Birthday Gifts', 'Mothers Day Gifts']],
  ['Golden Hour Jewellery & Rose Gift Set', 'Gift for Her', 12500, 15, IMG.jewel, [IMG.rose], ['Anniversary Gifts', 'Valentines Gifts']],
  ['Signature Handbag & Fragrance Hamper', 'Gift for Her', 18999, 10, IMG.bag, [IMG.perfume], ['Birthday Gifts']],
  ['Scented Candle Self-Care Box', 'Gift for Her', 4999, 0, IMG.candle, [IMG.giftPink], ['Mothers Day Gifts']],
  ['Classic Timepiece & Wallet Combo for Him', 'Gift for Him', 9999, 10, IMG.watch, [IMG.wallet], ['Birthday Gifts', 'Anniversary Gifts']],
  ['Gentleman’s Leather Wallet Gift Box', 'Gift for Him', 5500, 15, IMG.wallet, [IMG.giftBox], ['Corporate Gifting']],
  ['Oud Perfume & Chocolates Hamper for Him', 'Gift for Him', 11500, 10, IMG.perfume, [IMG.choco2], ['Eid Gifts']],
  ['Weekend Tee, Watch & Treats Box', 'Gift for Him', 7499, 20, IMG.tshirt, [IMG.watch], ['Birthday Gifts']],
  ['Forever Red — 24 Premium Red Roses', 'Roses Bouquets', 7999, 15, IMG.roses, [IMG.rose], ['Valentines Gifts', 'Anniversary Gifts']],
  ['Single Stem Love Rose in Kraft Wrap', 'Roses Bouquets', 2500, 0, IMG.rose, [], ['Valentines Gifts', 'Sorry Gifts']],
  ['Pastel Peony & Rose Bouquet', 'Roses Bouquets', 6500, 10, IMG.peonies, [IMG.bouquet2], ['Mothers Day Gifts']],
  ['Garden Mix Seasonal Bouquet', 'Roses Bouquets', 4500, 10, IMG.bouquet, [IMG.flowers], ['Birthday Gifts']],
  ['Sunshine Sunflower Bunch', 'Roses Bouquets', 3999, 0, IMG.sunflower, [IMG.flowers2], ['Sorry Gifts']],
  ['Ferrero Rocher Gold Chocolate Bouquet', 'Chocolate Bouquets', 6000, 15, IMG.choco, [IMG.choco2], ['Birthday Gifts', 'Eid Gifts']],
  ['KitKat & Dairy Milk Party Bouquet', 'Chocolate Bouquets', 4500, 0, IMG.choco2, [IMG.choco], ['Kids Gifts']],
  ['Roses & Truffles Mixed Bouquet', 'Chocolate Bouquets', 8999, 10, IMG.bouquet2, [IMG.choco], ['Valentines Gifts']],
  ['Sweet Treat Mini Chocolate Bouquet', 'Chocolate Bouquets', 3499, 10, IMG.sweets, [], ['Sorry Gifts']],
  ['Belgian Chocolate Fudge Cake (2 lb)', 'Cakes', 3800, 0, IMG.cake, [IMG.cake2], ['Birthday Gifts']],
  ['Red Velvet Celebration Cake', 'Cakes', 4200, 10, IMG.cake2, [IMG.cake3], ['Anniversary Gifts', 'Valentines Gifts']],
  ['Strawberry Cream Layer Cake', 'Cakes', 3900, 0, IMG.cake3, [IMG.cake], ['Birthday Gifts']],
  ['Gourmet Cupcake Dozen', 'Cakes', 2999, 0, IMG.cupcakes, [IMG.donuts], ['Kids Gifts']],
  ['Glazed Donut Party Box (12 pcs)', 'Cakes', 2499, 10, IMG.donuts, [IMG.cupcakes], ['Kids Gifts']],
  ['Luxe 50 Roses Hat Box', 'Flower Boxes', 16000, 10, IMG.flowerBox, [IMG.roses], ['Anniversary Gifts']],
  ['Tulip Garden Keepsake Box', 'Flower Boxes', 9500, 10, IMG.tulips, [IMG.flowers2], ['Mothers Day Gifts']],
  ['Blooms & Bonbons Flower Box', 'Flower Boxes', 11000, 15, IMG.flowers, [IMG.choco2], ['Eid Gifts']],
  ['Assorted Premium Chocolate Box', 'Chocolate Gift Boxes', 8500, 15, IMG.choco2, [IMG.choco], ['Corporate Gifting', 'Eid Gifts']],
  ['Heart Shaped Truffle Box', 'Chocolate Gift Boxes', 6500, 10, IMG.giftRed, [IMG.choco], ['Valentines Gifts']],
  ['Eid Mithai & Chocolate Gift Tray', 'Chocolate Gift Boxes', 5500, 10, IMG.sweets, [IMG.choco2], ['Eid Gifts', 'Corporate Gifting']],
  ['Happy Birthday Balloon Surprise Box', 'Balloon Box Gifts', 7400, 10, IMG.balloons, [IMG.celebration], ['Birthday Gifts', 'Kids Gifts']],
  ['Pink Rose Balloon Luxury Box', 'Balloon Box Gifts', 19000, 10, IMG.celebration, [IMG.balloons], ['Anniversary Gifts']],
  ['Miss You Teddy & Balloon Box', 'Balloon Box Gifts', 6000, 15, IMG.teddy, [IMG.balloons], ['Sorry Gifts']],
  ['Grand Gourmet Gift Hamper', 'Gift Baskets', 14999, 10, IMG.hamper, [IMG.wrapping], ['Corporate Gifting', 'Eid Gifts']],
  ['Coffee Lover’s Mug & Treats Basket', 'Gift Baskets', 4999, 10, IMG.mug, [IMG.hamper], ['Corporate Gifting']],
  ['Ribbon-Wrapped Classic Gift Basket', 'Gift Baskets', 7500, 15, IMG.wrapping, [IMG.giftBox], ['Birthday Gifts']],
  ['Fresh Seasonal Fruit Basket', 'Fruit Baskets', 6500, 10, IMG.fruits, [IMG.fruits2], ['Sorry Gifts']],
  ['Premium Imported Fruit Hamper', 'Fruit Baskets', 9500, 10, IMG.fruits2, [IMG.fruits], ['Corporate Gifting']],
  ['Superhero Adventure Gift Basket', 'Kids Gifts', 6500, 10, IMG.kids, [IMG.balloons], ['Birthday Gifts']],
  ['Candy Land Snack Box', 'Kids Gifts', 3999, 0, IMG.sweets, [IMG.donuts], []],
  ['Newborn Essentials Baby Hamper', 'Baby Gifts', 13999, 10, IMG.baby, [IMG.teddy], []],
  ['Welcome Little One Teddy Set', 'Baby Gifts', 5000, 20, IMG.teddy, [IMG.baby], []],
  ['I’m Sorry Roses & Teddy Combo', 'Sorry Gifts', 6999, 10, IMG.teddy, [IMG.roses], ['Valentines Gifts']],
  ['Forgive Me Chocolate & Card Box', 'Sorry Gifts', 4500, 10, IMG.giftRed, [IMG.choco], []],
  ['Personalised Photo Frame Gift Box', 'Gift for Her', 5999, 10, IMG.decor, [IMG.wrap2], ['Anniversary Gifts', 'Mothers Day Gifts']],
  ['Executive Desk Gift Set', 'Gift for Him', 8999, 10, IMG.giftBox, [IMG.wallet], ['Corporate Gifting']],
];

const SLIDES = [
  ['/hero/basket1.avif', 'The art of thoughtful gifting', 'Gifts that say it better than words', 'Handcrafted hampers, fresh blooms and keepsakes — delivered to the people you love, anywhere in Pakistan.', '/categories', 'Shop all gifts'],
  ['/hero/hl1026-1.avif', 'Same-day delivery across Karachi', 'Fresh roses, delivered today', 'Imported and local blooms arranged by our florists the morning of delivery.', '/category/roses-bouquets', 'Shop roses'],
  ['/hero/image-3.avif', 'Birthdays · Anniversaries · Eid', 'Make every celebration sweeter', 'Pair a bakery-fresh cake with flowers or chocolates and surprise them at midnight.', '/category/cakes', 'Order a cake'],
];

const REVIEWS = [
  ['Ayesha Khan', 'Sent roses and a cake to my mother in Lahore from Dubai — she called me in tears. Perfectly on time and beautifully wrapped.'],
  ['Hamza Siddiqui', 'Ordered the watch and wallet combo for my brother. Premium packaging, real leather, and the team sent me photos before delivery.'],
  ['Sana Malik', 'Their flower box looked even better than the pictures. The roses stayed fresh for over a week!'],
  ['Omar Farooq', 'Midnight surprise for my wife worked flawlessly. Super responsive on WhatsApp. Highly recommended.'],
  ['Fatima Raza', 'The newborn hamper was so thoughtfully curated. Will definitely be ordering again for Eid.'],
  ['Bilal Ahmed', 'We use TheGiftsForever for all our corporate gifting now — consistent quality and great invoices.'],
];

const BLOGS = [
  ['25 Thoughtful Birthday Gift Ideas for Every Budget', IMG.celebration, 'From under PKR 3,000 surprises to luxury hampers — the ultimate birthday gifting guide.'],
  ['How to Keep Your Roses Fresh for Longer', IMG.roses, 'Five florist-approved tricks to make your bouquet last well beyond the first week.'],
  ['Eid Gifting Etiquette: What to Send and When', IMG.sweets, 'A modern guide to Eidi, mithai boxes and gifts for family near and far.'],
  ['Sending Gifts to Pakistan from Abroad: A Complete Guide', IMG.wrapping, 'Payments, delivery timings and how to make sure your surprise lands perfectly.'],
];

const PAGES = [
  ['Privacy Policy', 'We only collect the information needed to deliver your gift — sender and receiver contact details and the delivery address. We never sell your data. Order details are stored securely and photos you upload are used only to personalise your gift.'],
  ['Terms & Conditions', 'By placing an order you agree that delivery times are estimates and may vary on public holidays. Flowers and cakes may vary slightly from photos due to seasonal availability; we always substitute with items of equal or higher value.'],
  ['Refund Policy', 'If your gift arrives damaged or not as described, contact us within 12 hours with a photo and we will replace it or issue a refund. Cancellations are accepted up to 6 hours before the scheduled delivery.'],
  ['Delivery Information', 'Same-day delivery is available in Karachi for orders placed before 4 PM. Lahore, Islamabad and Rawalpindi: next day. Other cities: 2–3 working days. Midnight delivery is available in select cities.'],
];

function body(name, cat) {
  return [
    P(`<strong>${name}</strong> is one of our most-loved ${cat.toLowerCase()} — curated by our gifting studio and hand-finished with signature wine-and-gold wrapping.`),
    '<h3>What’s inside</h3>',
    '<ul><li>Premium hand-picked items, freshly prepared on the day of delivery</li><li>Luxury gift box or wrap with satin ribbon</li><li>Complimentary handwritten message card</li></ul>',
    '<h3>Delivery</h3>',
    P('Same-day delivery in Karachi for orders before 4 PM, and fast delivery to all major cities across Pakistan. You will receive a photo of your gift on WhatsApp before dispatch.'),
  ].join('');
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Set MONGODB_URI in admin/.env.local first');
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || 'thegiftsforever' });
  const fresh = process.argv.includes('--fresh');

  if (fresh) {
    console.log('Wiping catalog & content…');
    await Promise.all(
      [M.Category, M.Product, M.Slide, M.Review, M.Blog, M.ContentPage, M.Tag, M.Field, M.Form, M.Website, M.InventoryItem, M.InventoryLog].map((m) => m.deleteMany({}))
    );
    await M.Counter.deleteMany({ _id: { $in: ['product', 'category'] } });
  } else if (await M.Product.estimatedDocumentCount()) {
    console.log('Catalog already has products — skipping. Use `npm run seed -- --fresh` to reset.');
    return mongoose.disconnect();
  }

  await M.Website.create({ name: 'TheGiftsForever', domain: 'thegiftsforever.com', phone: '+92 300 1234567', whatsapp: '923001234567', email: 'hello@thegiftsforever.com', address: 'Studio 4, Khayaban-e-Ittehad, DHA Phase 6, Karachi' });

  const tags = await M.Tag.insertMany(['Same Day', 'Bestseller', 'Luxury', 'Under 5000', 'Personalised'].map((name) => ({ name, slug: slugify(name) })));

  const msgField = await M.Field.create({ label: 'Name on the box', name: 'name_on_box', type: 'text', required: false });
  const toneField = await M.Field.create({ label: 'Ribbon colour', name: 'ribbon_colour', type: 'select', options: 'Red, Gold, Pink, White' });
  const photoField = await M.Field.create({ label: 'Photo for the frame', name: 'frame_photo', type: 'file', required: true });
  const personal = await M.Form.create({ name: 'Personalisation', fields: [msgField._id, toneField._id] });
  const photoForm = await M.Form.create({ name: 'Photo Personalisation', fields: [photoField._id, msgField._id] });

  const cats = {};
  let cid = 100;
  let i = 0;
  for (const [name, image, featured, menu] of CATEGORIES) {
    i++;
    cats[name] = await M.Category.create({
      cid: ++cid,
      name,
      slug: slugify(name),
      image: U(image, 600),
      imageName: name,
      featured,
      showOnMenu: menu,
      sort: i,
      homeSort: i,
      metaTitle: `${name} Online in Pakistan | Same Day Delivery`,
      metaDescription: `Send ${name.toLowerCase()} across Pakistan with same-day delivery in Karachi. Handpicked, beautifully wrapped and delivered with love.`,
      metaKeywords: `${name.toLowerCase()}, gifts pakistan, online gift delivery`,
      description: `<h2>${name} delivered with love</h2>${P(`Explore our curated collection of ${name.toLowerCase()} — every gift is hand-finished in our Karachi studio and delivered on time, with a complimentary message card.`)}`,
    });
  }
  await M.Counter.updateOne({ _id: 'category' }, { $set: { seq: cid } }, { upsert: true });

  let pid = 11000;
  for (const [idx, [name, cat, price, discount, cover, gallery, extra]] of PRODUCTS.entries()) {
    const isFrame = name.includes('Photo Frame');
    await M.Product.create({
      pid: ++pid,
      name,
      slug: slugify(name),
      category: cats[cat]._id,
      categories: [cats[cat]._id, ...extra.map((c) => cats[c]?._id).filter(Boolean)],
      shortDescription: P(`A beautifully curated ${cat.toLowerCase().replace(/s$/, '')} — wrapped by hand and delivered with a free message card.`),
      description: body(name, cat),
      coverImage: U(cover),
      gallery: gallery.map((g) => U(g)),
      price,
      costPrice: Math.round(price * 0.6),
      discount,
      metaKeywords: `${name.toLowerCase()}, ${cat.toLowerCase()}, gifts pakistan`,
      metaDescription: `${name} — order online with same-day delivery in Karachi and fast delivery across Pakistan.`,
      tags: [tags[idx % tags.length]._id],
      form: isFrame ? photoForm._id : idx % 5 === 0 ? personal._id : null,
      imagesNeed: 0,
      freeDelivery: price >= 10000,
      featured: idx % 3 === 0,
      featuredOnCategory: idx % 4 === 0,
      active: true,
      variations:
        cat === 'Cakes'
          ? { size: [{ value: '2lb', label: '2 lb' }, { value: '3lb', label: '3 lb', price: 1500 }, { value: '4lb', label: '4 lb', price: 3000 }] }
          : cat === 'Roses Bouquets'
            ? { quantity: [{ value: 'standard', label: 'Standard' }, { value: 'deluxe', label: 'Deluxe (+50% stems)', price: 2500 }] }
            : cat === 'Gift for Him' && name.includes('Tee')
              ? { size: ['S', 'M', 'L', 'XL'].map((s) => ({ value: s, label: s })), color: [{ value: 'black', label: 'Black' }, { value: 'white', label: 'White' }] }
              : {},
    });
  }
  await M.Counter.updateOne({ _id: 'product' }, { $set: { seq: pid } }, { upsert: true });

  await M.Slide.insertMany(SLIDES.map(([image, eyebrow, title, text, link, buttonText], k) => ({ image, eyebrow, title, content: P(text), link, buttonText, sort: k + 1, imageName: title })));

  await M.Review.insertMany([
    ...REVIEWS.map(([name, review], k) => ({ kind: 'google', name, review, rating: k === 4 ? 4 : 5 })),
    ...REVIEWS.slice(0, 4).flatMap(([name, review], k) =>
      ['Roses Bouquets', 'Gift for Him', 'Cakes', 'Flower Boxes'].slice(k, k + 1).map((c) => ({ kind: 'category', category: cats[c]._id, name, review, rating: 5 }))
    ),
  ]);

  await M.Blog.insertMany(
    BLOGS.map(([title, image, excerpt]) => ({
      title,
      slug: slugify(title),
      coverImage: U(image, 1600),
      excerpt,
      content: `${P(excerpt)}<h2>Why it matters</h2>${P('A thoughtful gift shows you listened. Start with what the person loves, then add a personal touch — a handwritten note, their favourite colour, or a memory you share.')}<h2>Our top picks</h2><ul><li>Fresh flowers paired with chocolates</li><li>Personalised keepsakes and photo frames</li><li>Gourmet hampers for the whole family</li></ul>${P('Need help choosing? Message our gifting team on WhatsApp and we will curate something special.')}`,
      metaTitle: title,
      metaDescription: excerpt,
    }))
  );

  await M.ContentPage.insertMany(PAGES.map(([title, text]) => ({ title, slug: slugify(title), content: `<h2>${title}</h2>${P(text)}`, metaTitle: title, metaDescription: text.slice(0, 150) })));

  await M.InventoryItem.insertMany(
    [['Artificial Red Rose', 0, 300], ['Satin Ribbon Roll (Wine)', 24, 450], ['Kraft Wrap Sheets', 120, 40], ['Ferrero Rocher 16pc', 18, 2100], ['KitKat 4 Finger', 15, 370], ['Dairy Milk 100g', 36, 400], ['Gift Box 10x10', 28, 240], ['Gift Box 8x10', 29, 210], ['Teddy Bear (Medium)', 4, 1200], ['Greeting Cards', 200, 50]].map(([name, stock, unitPrice]) => ({ name, stock, unitPrice, lowStockAt: 5 }))
  );

  console.log(`Seeded ${CATEGORIES.length} categories, ${PRODUCTS.length} products, ${SLIDES.length} slides, blogs, pages, reviews, inventory.`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
