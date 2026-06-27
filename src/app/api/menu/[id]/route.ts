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
  const item = await prisma.menuItem.update({
    where: { id: params.id },
    data: {
      name: body.name,
      description: body.description,
      price: parseFloat(body.price),
      image: body.image,
      categoryId: body.categoryId,
      isAvailable: body.isAvailable,
    },
    include: { category: true },
  });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  await prisma.menuItem.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
