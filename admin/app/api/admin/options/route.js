import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { Category, Field, Form, Product, Tag, Website } from '@/lib/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SOURCES = {
  categories: () => Category.find({}, 'name slug parent').sort({ name: 1 }).lean(),
  tags: () => Tag.find({}, 'name').sort({ name: 1 }).lean(),
  forms: () => Form.find({}, 'name').sort({ name: 1 }).lean(),
  fields: () => Field.find({}, 'label name type').sort({ label: 1 }).lean(),
  products: () => Product.find({ active: true }, 'name price discount costPrice coverImage').sort({ name: 1 }).lean(),
  websites: () => Website.find({}, 'name domain').sort({ createdAt: 1 }).lean(),
};

/** Lookup lists for select/checkbox fields: /api/admin/options?type=categories */
export async function GET(req) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const type = req.nextUrl.searchParams.get('type');
  if (!SOURCES[type]) return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
  await dbConnect();
  return NextResponse.json({ items: await SOURCES[type]() });
}
