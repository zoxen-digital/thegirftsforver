import { dbConnect } from '@/lib/db';
import { StoredUpload } from '@/lib/models';
import { UPLOAD_FOLDERS } from '@/lib/uploads';

export const runtime = 'nodejs';

function bad(status, msg) {
  return new Response(msg, { status, headers: { 'Content-Type': 'text/plain' } });
}

export async function GET(_req, { params }) {
  const { folder, filename } = await params;
  if (!UPLOAD_FOLDERS.includes(folder)) return bad(404, 'Not found');
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return bad(400, 'Bad path');
  }

  await dbConnect();
  const doc = await StoredUpload.findOne({ folder, filename }).lean();
  if (!doc) return bad(404, 'Not found');

  const bytes = Buffer.isBuffer(doc.data) ? doc.data : Buffer.from(doc.data.buffer ?? doc.data);
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(bytes));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': doc.mimeType,
      'Content-Length': String(bytes.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
