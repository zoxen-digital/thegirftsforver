import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { InventoryItem, InventoryLog } from '@/lib/models';

export const runtime = 'nodejs';

/** Body: { delta: number } to add/remove, or { stock: number } to write an absolute value. */
export async function POST(req, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const { delta, stock, note } = await req.json();
  await dbConnect();

  const item = await InventoryItem.findById(id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const next = typeof stock === 'number' ? stock : item.stock + Number(delta || 0);
  const change = next - item.stock;
  if (next < 0) return NextResponse.json({ error: 'Stock cannot go below 0' }, { status: 400 });
  if (change === 0) return NextResponse.json({ success: true, item });

  item.stock = next;
  await item.save();
  await InventoryLog.create({
    item: item._id,
    itemName: item.name,
    change,
    stockAfter: next,
    unitPrice: item.unitPrice,
    note: note || (change > 0 ? 'Stock added' : 'Stock removed'),
  });
  return NextResponse.json({ success: true, item });
}
