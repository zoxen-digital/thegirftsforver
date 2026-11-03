import { NextResponse } from 'next/server';
import { checkPassword, requireAdmin, savePassword } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { current, next } = await req.json().catch(() => ({}));
  if (typeof next !== 'string' || next.length < 8) {
    return NextResponse.json({ success: false, error: 'New password must be at least 8 characters' }, { status: 400 });
  }
  if (!(await checkPassword(current || ''))) {
    return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 });
  }
  await savePassword(next);
  return NextResponse.json({ success: true });
}
