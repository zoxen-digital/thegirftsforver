import * as M from './models';
import { deleteUploads } from './uploads';

/**
 * Server-side registry for the generic admin CRUD API (/api/admin/[resource]).
 * - search: fields matched by the ?q / ?name text filter
 * - slugFrom: field used to auto-generate `slug` when empty
 * - seq: counter name for numeric ids (stored in `idField`)
 * - images / imageArrays: upload URL fields cleaned up on replace/delete
 * - fixed: filter applied to every query and merged into created docs
 */
export const RESOURCES = {
  products: {
    model: M.Product,
    search: ['name'],
    slugFrom: 'name',
    seq: 'product',
    idField: 'pid',
    images: ['coverImage'],
    imageArrays: ['gallery'],
    populate: [{ path: 'category', select: 'name slug' }],
    sort: { createdAt: -1 },
  },
  categories: {
    model: M.Category,
    search: ['name'],
    slugFrom: 'name',
    seq: 'category',
    idField: 'cid',
    images: ['image'],
    populate: [{ path: 'parent', select: 'name' }],
    sort: { createdAt: -1 },
  },
  blogs: { model: M.Blog, search: ['title'], slugFrom: 'title', images: ['coverImage'], sort: { createdAt: -1 } },
  pages: { model: M.ContentPage, search: ['title'], slugFrom: 'title', images: ['coverImage'], sort: { createdAt: -1 } },
  slides: { model: M.Slide, search: ['title'], images: ['image'], sort: { sort: 1, createdAt: -1 } },
  orders: {
    model: M.Order,
    search: ['customer.name', 'receiver.name', 'customer.phone', 'receiver.phone'],
    seq: 'order',
    idField: 'oid',
    images: ['image'],
    sort: { createdAt: -1 },
  },
  inventory: { model: M.InventoryItem, search: ['name'], images: ['image'], sort: { createdAt: 1 } },
  'inventory-logs': { model: M.InventoryLog, search: ['itemName', 'note'], sort: { createdAt: -1 } },
  fields: { model: M.Field, search: ['label', 'name'], sort: { createdAt: -1 } },
  forms: { model: M.Form, search: ['name'], populate: [{ path: 'fields', select: 'label name type' }], sort: { createdAt: -1 } },
  'category-reviews': {
    model: M.Review,
    search: ['name', 'review'],
    imageArrays: ['images'],
    fixed: { kind: 'category' },
    populate: [{ path: 'category', select: 'name' }],
    sort: { createdAt: -1 },
  },
  'google-reviews': { model: M.Review, search: ['name', 'review'], imageArrays: ['images'], fixed: { kind: 'google' }, sort: { createdAt: -1 } },
  'whatsapp-reviews': {
    model: M.Review,
    search: ['name', 'review'],
    imageArrays: ['images'],
    fixed: { kind: 'whatsapp', whatsapp: true },
    sort: { createdAt: -1 },
  },
  tags: { model: M.Tag, search: ['name'], slugFrom: 'name', sort: { name: 1 } },
  websites: { model: M.Website, search: ['name', 'domain'], sort: { createdAt: 1 } },
};

export function collectImageUrls(cfg, doc) {
  if (!doc) return [];
  const urls = [];
  for (const f of cfg.images || []) if (doc[f]) urls.push(doc[f]);
  for (const f of cfg.imageArrays || []) urls.push(...(doc[f] || []));
  return urls;
}

/** Deletes uploads no longer referenced by any other document of this resource (duplicates share URLs). */
export async function deleteUnusedUploads(cfg, urls, excludeId) {
  const fields = [...(cfg.images || []), ...(cfg.imageArrays || [])];
  const orphaned = [];
  for (const url of new Set(urls)) {
    if (!url?.startsWith('/api/uploads/')) continue;
    const used = await cfg.model.exists({ _id: { $ne: excludeId }, $or: fields.map((f) => ({ [f]: url })) });
    if (!used) orphaned.push(url);
  }
  await deleteUploads(orphaned);
}
