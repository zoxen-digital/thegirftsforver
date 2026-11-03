import { StoredUpload } from './models';

export const UPLOAD_FOLDERS = ['products', 'gallery', 'pages', 'misc'];
export const UPLOAD_MIME = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export function parseUploadUrl(url) {
  if (typeof url !== 'string' || !url.startsWith('/api/uploads/')) return null;
  const [folder, filename] = url.slice('/api/uploads/'.length).split('/');
  if (!folder || !filename) return null;
  return { folder, filename };
}

/** Deletes the Mongo-stored file behind an /api/uploads/... URL. Other URLs are ignored. */
export async function deleteUploadByUrl(url) {
  const ref = parseUploadUrl(url);
  if (!ref) return false;
  const res = await StoredUpload.deleteOne(ref);
  return res.deletedCount > 0;
}

export async function deleteUploads(urls) {
  await Promise.all((urls || []).filter(Boolean).map(deleteUploadByUrl));
}
