import { NextResponse } from 'next/server';
import { SESSION_COOKIE, checkCredentials, createSessionToken, sessionCookieOptions } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!(await checkCredentials(email || '', password || ''))) {
    return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
  }
  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE, createSessionToken(email), sessionCookieOptions);
  return res;
}
