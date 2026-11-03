import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { StoredUpload } from '@/lib/models';
import { MAX_UPLOAD_BYTES, UPLOAD_FOLDERS, UPLOAD_MIME } from '@/lib/uploads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let form;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid form data' }, { status: 400 });
  }

  const file = form.get('file');
  const folder = String(form.get('folder') || 'misc');

  if (!UPLOAD_FOLDERS.includes(folder)) {
    return NextResponse.json({ success: false, error: 'Invalid folder' }, { status: 400 });
  }
  if (!file || typeof file === 'string') {
    return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
  }
  const ext = UPLOAD_MIME[file.type];
  if (!ext) {
    return NextResponse.json({ success: false, error: 'Only JPEG, PNG, WEBP or GIF images are allowed' }, { status: 415 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ success: false, error: 'Image must be 8MB or smaller' }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;

  await dbConnect();
  await StoredUpload.create({ folder, filename, mimeType: file.type, size: buffer.length, data: buffer });

  return NextResponse.json({
    success: true,
    url: `/api/uploads/${folder}/${filename}`,
    filename,
    size: buffer.length,
    folder,
  });
}
