import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === "STAFF") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }
  const body = await req.json();
  const ingredient = await prisma.ingredient.update({
    where: { id: params.id },
    data: {
      name: body.name,
      unit: body.unit,
      minQuantity: parseFloat(body.minQuantity),
      costPerUnit: parseFloat(body.costPerUnit),
    },
  });
  return NextResponse.json(ingredient);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }
  await prisma.ingredient.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
