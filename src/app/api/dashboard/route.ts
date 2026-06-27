import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todayOrders, totalRevenue, pendingOrders, lowStockItems, recentOrders, weeklyRevenue] =
    await Promise.all([
      prisma.order.count({
        where: { createdAt: { gte: today, lt: tomorrow }, status: { not: "CANCELLED" } },
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: today, lt: tomorrow }, status: "COMPLETED" },
        _sum: { totalAmount: true },
      }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.ingredient.findMany({
        where: { quantity: { lte: prisma.ingredient.fields.minQuantity } },
        select: { id: true, name: true, quantity: true, minQuantity: true, unit: true },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { staff: { select: { name: true } }, orderItems: { include: { menuItem: { select: { name: true } } } } },
      }),
      // Revenue for last 7 days
      prisma.$queryRaw`
        SELECT DATE(createdAt) as date, SUM(totalAmount) as revenue, COUNT(*) as orders
        FROM "Order"
        WHERE status = 'COMPLETED'
        AND createdAt >= datetime('now', '-7 days')
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
      `,
    ]);

  // Low stock using raw query since Prisma doesn't support column comparison in where
  const lowStock = await prisma.$queryRaw`
    SELECT id, name, quantity, minQuantity, unit FROM "Ingredient" WHERE quantity <= minQuantity
  `;

  return NextResponse.json({
    todayOrders,
    todayRevenue: totalRevenue._sum.totalAmount ?? 0,
    pendingOrders,
    lowStockCount: (lowStock as unknown[]).length,
    lowStockItems: lowStock,
    recentOrders,
    weeklyRevenue,
  });
}
