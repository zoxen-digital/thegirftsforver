import mongoose from 'mongoose';

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const RESERVED = new Set(['page', 'limit', 'q', 'id', 'slug', 'name', 'sort', 'from', 'to']);

export function buildFilter(cfg, sp) {
  const filter = { ...(cfg.fixed || {}) };
  const q = sp.get('q') || sp.get('name');
  if (q) filter.$or = cfg.search.map((f) => ({ [f]: { $regex: escape(q), $options: 'i' } }));
  const id = sp.get('id');
  if (id && cfg.idField && !Number.isNaN(Number(id))) filter[cfg.idField] = Number(id);
  const slug = sp.get('slug');
  if (slug) filter.slug = { $regex: escape(slug), $options: 'i' };
  const from = sp.get('from');
  const to = sp.get('to');
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to + 'T23:59:59.999');
  }
  // any other param is an exact-match filter, e.g. ?active=true&status=new&category=<id>
  for (const [k, v] of sp.entries()) {
    if (RESERVED.has(k) || v === '' || v === 'all') continue;
    if (v === 'true' || v === 'false') filter[k] = v === 'true';
    else if (mongoose.isValidObjectId(v) && v.length === 24) filter.$and = [...(filter.$and || []), { $or: [{ [k]: v }, { [k + 's']: v }] }];
    else filter[k] = v;
  }
  return filter;
}

export async function uniqueSlug(Model, base, excludeId) {
  const root = base || 'item';
  let slug = root;
  for (let i = 2; ; i++) {
    const clash = await Model.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) });
    if (!clash) return slug;
    slug = `${root}-${i}`;
  }
}
