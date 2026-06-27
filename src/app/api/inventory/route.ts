import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ingredients = await prisma.ingredient.findMany({
    orderBy: { name: "asc" },
    include: {
      stockMovements: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });
  return NextResponse.json(ingredients);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === "STAFF") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const body = await req.json();
  const ingredient = await prisma.ingredient.create({
    data: {
      name: body.name,
      unit: body.unit,
      quantity: parseFloat(body.quantity) || 0,
      minQuantity: parseFloat(body.minQuantity) || 10,
      costPerUnit: parseFloat(body.costPerUnit) || 0,
    },
  });
  return NextResponse.json(ingredient);
}
