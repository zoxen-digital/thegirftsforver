import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { RESOURCES, collectImageUrls, deleteUnusedUploads } from '@/lib/resources';
import { slugify } from '@/lib/utils';
import { uniqueSlug } from '@/lib/crud';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function load(params) {
  const { resource, id } = await params;
  const cfg = RESOURCES[resource];
  if (!cfg) return { error: NextResponse.json({ error: 'Unknown resource' }, { status: 404 }) };
  await dbConnect();
  return { cfg, id };
}

export async function GET(_req, ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { cfg, id, error } = await load(ctx.params);
  if (error) return error;
  const item = await cfg.model.findById(id).lean();
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PUT(req, ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { cfg, id, error } = await load(ctx.params);
  if (error) return error;

  const before = await cfg.model.findById(id).lean();
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  delete body._id;
  delete body.createdAt;
  delete body.updatedAt;
  if (cfg.slugFrom && ('slug' in body || cfg.slugFrom in body)) {
    body.slug = await uniqueSlug(cfg.model, slugify(body.slug || body[cfg.slugFrom] || before.slug), id);
  }

  try {
    const item = await cfg.model.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true }).lean();
    // remove uploads that are no longer referenced
    const keep = new Set(collectImageUrls(cfg, item));
    await deleteUnusedUploads(cfg, collectImageUrls(cfg, before).filter((u) => !keep.has(u)), id);
    return NextResponse.json({ success: true, item });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}

export async function DELETE(_req, ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { cfg, id, error } = await load(ctx.params);
  if (error) return error;
  const doc = await cfg.model.findByIdAndDelete(id).lean();
  if (doc) await deleteUnusedUploads(cfg, collectImageUrls(cfg, doc), id);
  return NextResponse.json({ success: true });
}
