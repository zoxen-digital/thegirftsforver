import 'server-only';
import { cache } from 'react';
import { dbConnect } from './db';
import { Blog, Category, ContentPage, Product, Review, Slide, Website } from './models';

const plain = (v) => JSON.parse(JSON.stringify(v));
const visible = { active: true, hidden: { $ne: true } };
const CARD = 'name slug coverImage price discount freeDelivery category';

export const getSite = cache(async () => {
  await dbConnect();
  const w = await Website.findOne({ active: true }).sort({ createdAt: 1 }).lean();
  return {
    name: w?.name || 'TheGiftsForever',
    phone: w?.phone || process.env.NEXT_PUBLIC_PHONE || '+92 300 1234567',
    whatsapp: (w?.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP || '923001234567').replace(/\D/g, ''),
    email: w?.email || 'hello@thegiftsforever.com',
    address: w?.address || 'Karachi, Pakistan',
    bankDetails: w?.bankDetails || '',
    social: { facebook: w?.facebook, instagram: w?.instagram, tiktok: w?.tiktok, youtube: w?.youtube, twitter: w?.twitter },
  };
});

export const getMenuCategories = cache(async () => {
  await dbConnect();
  return plain(await Category.find({ ...visible, showOnMenu: true }, 'name slug image').sort({ sort: 1, name: 1 }).limit(12).lean());
});

export async function getAllCategories() {
  await dbConnect();
  return plain(await Category.find(visible, 'name slug image parent').sort({ sort: 1, name: 1 }).lean());
}

export async function getSlides() {
  await dbConnect();
  return plain(await Slide.find({ active: true }).sort({ sort: 1, createdAt: 1 }).lean());
}

/** Featured categories (home sort order) with their first products, for the home page rows. */
export async function getHomeRows(perRow = 8) {
  await dbConnect();
  const cats = await Category.find({ ...visible, featured: true }, 'name slug').sort({ homeSort: 1, name: 1 }).limit(14).lean();
  const rows = await Promise.all(
    cats.map(async (c) => ({
      category: c,
      products: await Product.find({ ...visible, $or: [{ category: c._id }, { categories: c._id }] }, CARD)
        .sort({ featured: -1, createdAt: -1 })
        .limit(perRow)
        .lean(),
    }))
  );
  return plain(rows.filter((r) => r.products.length));
}

export async function getCategory(slug) {
  await dbConnect();
  const c = await Category.findOne({ slug, active: true }).lean();
  if (!c) return null;
  const children = await Category.find({ ...visible, parent: c._id }, 'name slug image').sort({ sort: 1 }).lean();
  return plain({ ...c, children });
}

const SORTS = {
  latest: { createdAt: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  name: { name: 1 },
};

export async function getCategoryProducts(categoryId, { sort = 'featured', page = 1, limit = 24, min, max } = {}) {
  await dbConnect();
  const filter = { ...visible, $or: [{ category: categoryId }, { categories: categoryId }] };
  if (min || max) filter.price = { ...(min ? { $gte: Number(min) } : {}), ...(max ? { $lte: Number(max) } : {}) };
  const order = sort === 'featured' ? { featuredOnCategory: -1, featured: -1, createdAt: -1 } : SORTS[sort] || SORTS.latest;
  const [items, total] = await Promise.all([
    Product.find(filter, CARD).sort(order).skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);
  return plain({ items, total, pages: Math.max(1, Math.ceil(total / limit)) });
}

export async function getProduct(slug) {
  await dbConnect();
  const p = await Product.findOne({ slug, active: true })
    .populate('category', 'name slug')
    .populate({ path: 'form', populate: { path: 'fields' } })
    .lean();
  if (!p) return null;
  if (p.form && !p.form.active) p.form = null;
  return plain(p);
}

export async function getRelated(product, limit = 8) {
  await dbConnect();
  const cat = product.category?._id || product.category;
  return plain(
    await Product.find({ ...visible, _id: { $ne: product._id }, $or: [{ category: cat }, { categories: cat }] }, CARD)
      .sort({ featured: -1, createdAt: -1 })
      .limit(limit)
      .lean()
  );
}

/** Products offered in the add-to-cart popup: the chosen suggestion category, else the product's own. */
export async function getSuggestions(product, limit = 4) {
  await dbConnect();
  const cat = product.suggestionCategory || product.category?._id || product.category;
  if (!cat) return [];
  return plain(
    await Product.find({ ...visible, _id: { $ne: product._id }, $or: [{ category: cat }, { categories: cat }] }, CARD)
      .sort({ featured: -1, createdAt: -1 })
      .limit(limit)
      .lean()
  );
}

const FALLBACK_RATES = { PKR: 1, USD: 0.0036, GBP: 0.0027, EUR: 0.0031, AED: 0.013, SAR: 0.0135, CAD: 0.005, AUD: 0.0055 };

/** PKR exchange rates, refreshed twice a day. */
export const getRates = cache(async () => {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/PKR', { next: { revalidate: 43200 } });
    const { rates } = await res.json();
    return Object.fromEntries(Object.keys(FALLBACK_RATES).map((c) => [c, rates?.[c] || FALLBACK_RATES[c]]));
  } catch {
    return FALLBACK_RATES;
  }
});

export async function searchProducts(q, limit = 48) {
  await dbConnect();
  if (!q) return [];
  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  return plain(await Product.find({ ...visible, $or: [{ name: rx }, { metaKeywords: rx }] }, CARD).limit(limit).lean());
}

export async function getReviews({ kind, category, limit = 12 } = {}) {
  await dbConnect();
  const f = { active: true };
  if (kind) f.kind = kind;
  if (category) f.category = category;
  return plain(await Review.find(f).sort({ createdAt: -1 }).limit(limit).lean());
}

export async function getBlogs(limit = 30) {
  await dbConnect();
  return plain(await Blog.find({ active: true }, 'title slug coverImage excerpt author createdAt').sort({ createdAt: -1 }).limit(limit).lean());
}

export async function getBlog(slug) {
  await dbConnect();
  const b = await Blog.findOne({ slug, active: true }).lean();
  return b ? plain(b) : null;
}

export async function getPage(slug) {
  await dbConnect();
  const p = await ContentPage.findOne({ slug, active: true }).lean();
  return p ? plain(p) : null;
}

export const getFooterPages = cache(async () => {
  await dbConnect();
  return plain(await ContentPage.find({ active: true, showInFooter: true }, 'title slug').sort({ title: 1 }).lean());
});

