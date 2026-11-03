import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { Blog, Category, Form, Order, Product, Slide } from '@/lib/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function sumBy(status, range) {
  return Order.aggregate([
    { $match: { status, createdAt: range } },
    { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$total' }, cost: { $sum: '$cost' } } },
  ]).then((r) => r[0] || { count: 0, revenue: 0, cost: 0 });
}

export async function GET(req) {
  const denied = await requireAdmin();
  if (denied) return denied;
  await dbConnect();

  const sp = req.nextUrl.searchParams;
  const from = sp.get('from') ? new Date(sp.get('from')) : new Date(0);
  const to = sp.get('to') ? new Date(sp.get('to') + 'T23:59:59.999') : new Date();
  const range = { $gte: from, $lte: to };

  const [products, categories, blogs, sliders, forms, orders, delivered, confirmed, cancelled, totalInRange, daily] =
    await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Blog.countDocuments(),
      Slide.countDocuments(),
      Form.countDocuments(),
      Order.countDocuments(),
      sumBy('delivered', range),
      sumBy('confirmed', range),
      sumBy('cancelled', range),
      Order.countDocuments({ createdAt: range, status: { $nin: ['cancelled', 'failed'] } }),
      Order.aggregate([
        { $match: { createdAt: range } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Karachi' } },
            orders: { $sum: 1 },
            revenue: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, '$total', 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

  return NextResponse.json({
    totals: { products, categories, blogs, sliders, forms, orders },
    delivered,
    confirmed,
    cancelled,
    net: { count: totalInRange, profit: delivered.revenue - delivered.cost },
    daily,
  });
}
