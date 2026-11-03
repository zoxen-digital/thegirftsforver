import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { StoredUpload } from '@/lib/models';

export const runtime = 'nodejs';

const MIME = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX = 5 * 1024 * 1024;

/** Customer photo uploads for personalised gifts. Always stored in the "misc" folder. */
export async function POST(req) {
  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!file || typeof file === 'string') return NextResponse.json({ success: false, error: 'No file' }, { status: 400 });
  const ext = MIME[file.type];
  if (!ext) return NextResponse.json({ success: false, error: 'Only JPG, PNG or WEBP images' }, { status: 415 });
  if (file.size > MAX) return NextResponse.json({ success: false, error: 'Image must be 5MB or smaller' }, { status: 413 });

  const data = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
  await dbConnect();
  await StoredUpload.create({ folder: 'misc', filename, mimeType: file.type, size: data.length, data });
  return NextResponse.json({ success: true, url: `/api/uploads/misc/${filename}` });
}
