import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { dbConnect } from './db';
import { AdminCredential } from './models';

export const SESSION_COOKIE = 'tgf_admin';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const s = process.env.ADMIN_SECRET;
  if (!s) throw new Error('ADMIN_SECRET is not set');
  return s;
}

function sign(payload) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
}

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

export function createSessionToken(email) {
  const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + MAX_AGE * 1000 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token) {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  if (!safeEqual(sig, sign(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!data.exp || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

function hashPassword(password, salt) {
  return crypto.scryptSync(String(password), salt, 64).toString('hex');
}

/** The password saved from the panel wins; ADMIN_PASSWORD is used until one is saved. */
export async function checkPassword(password) {
  await dbConnect();
  const saved = await AdminCredential.findById('admin').lean();
  if (saved) return safeEqual(hashPassword(password, saved.salt), saved.hash);
  const p = process.env.ADMIN_PASSWORD;
  return !!p && safeEqual(password, p);
}

export async function savePassword(password) {
  await dbConnect();
  const salt = crypto.randomBytes(16).toString('hex');
  await AdminCredential.findByIdAndUpdate('admin', { salt, hash: hashPassword(password, salt) }, { upsert: true });
}

export async function checkCredentials(email, password) {
  const e = process.env.ADMIN_EMAIL;
  if (!e || !safeEqual(String(email).trim().toLowerCase(), e.toLowerCase())) return false;
  return checkPassword(password);
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: MAX_AGE,
};

export async function getSession() {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** For route handlers: returns a 401 response when not signed in, otherwise null. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  return null;
}
