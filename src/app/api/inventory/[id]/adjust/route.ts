import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, quantity, note } = await req.json();
  const qty = parseFloat(quantity);

  const ingredient = await prisma.ingredient.findUnique({ where: { id: params.id } });
  if (!ingredient) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

  let newQty = ingredient.quantity;
  if (type === "IN") newQty += qty;
  else if (type === "OUT") newQty = Math.max(0, newQty - qty);
  else if (type === "ADJUST") newQty = qty;

  const [updated] = await prisma.$transaction([
    prisma.ingredient.update({
      where: { id: params.id },
      data: { quantity: newQty },
    }),
    prisma.stockMovement.create({
      data: { ingredientId: params.id, type, quantity: qty, note },
    }),
  ]);

  return NextResponse.json(updated);
}
