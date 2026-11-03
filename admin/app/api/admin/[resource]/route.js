import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { nextSeq } from '@/lib/models';
import { RESOURCES } from '@/lib/resources';
import { slugify } from '@/lib/utils';
import { buildFilter, uniqueSlug } from '@/lib/crud';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { resource } = await params;
  const cfg = RESOURCES[resource];
  if (!cfg) return NextResponse.json({ error: 'Unknown resource' }, { status: 404 });

  await dbConnect();
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get('page')) || 1);
  const limit = Math.min(1000, Math.max(1, Number(sp.get('limit')) || 10));
  const filter = buildFilter(cfg, sp);

  let query = cfg.model.find(filter).sort(sp.get('sort') ? JSON.parse(sp.get('sort')) : cfg.sort || { createdAt: -1 });
  query = query.skip((page - 1) * limit).limit(limit);
  for (const p of cfg.populate || []) query = query.populate(p);

  const [items, total] = await Promise.all([query.lean(), cfg.model.countDocuments(filter)]);
  return NextResponse.json({ items, total, page, limit });
}

export async function POST(req, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { resource } = await params;
  const cfg = RESOURCES[resource];
  if (!cfg) return NextResponse.json({ error: 'Unknown resource' }, { status: 404 });

  await dbConnect();
  const body = await req.json();
  delete body._id;
  Object.assign(body, cfg.fixed || {});
  if (cfg.slugFrom) body.slug = await uniqueSlug(cfg.model, slugify(body.slug || body[cfg.slugFrom] || ''));
  if (cfg.seq && !body[cfg.idField]) body[cfg.idField] = await nextSeq(cfg.seq);

  try {
    const doc = await cfg.model.create(body);
    return NextResponse.json({ success: true, item: doc });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}
