import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    where.createdAt = { gte: d, lt: next };
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      staff: { select: { name: true } },
      orderItems: {
        include: { menuItem: { select: { name: true, price: true } } },
      },
    },
  });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { tableNumber, notes, items } = body as {
    tableNumber?: string;
    notes?: string;
    items: { menuItemId: string; quantity: number; price: number }[];
  };

  if (!items?.length) {
    return NextResponse.json({ error: "Cần ít nhất 1 món" }, { status: 400 });
  }

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await prisma.order.create({
    data: {
      tableNumber,
      notes,
      totalAmount,
      staffId: session.user.id,
      orderItems: {
        create: items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
    include: {
      orderItems: { include: { menuItem: true } },
    },
  });

  // Deduct stock based on recipes
  for (const item of order.orderItems) {
    const recipes = await prisma.recipe.findMany({
      where: { menuItemId: item.menuItemId },
    });
    for (const recipe of recipes) {
      const deductAmount = recipe.quantity * item.quantity;
      await prisma.ingredient.update({
        where: { id: recipe.ingredientId },
        data: { quantity: { decrement: deductAmount } },
      });
      await prisma.stockMovement.create({
        data: {
          ingredientId: recipe.ingredientId,
          type: "OUT",
          quantity: deductAmount,
          note: `Order #${order.orderNumber}`,
        },
      });
    }
  }

  return NextResponse.json(order);
}
