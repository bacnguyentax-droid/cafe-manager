import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const available = searchParams.get("available");

  const where = available === "true" ? { isAvailable: true } : {};

  const items = await prisma.menuItem.findMany({
    where,
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    include: { category: true },
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === "STAFF") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const body = await req.json();
  const item = await prisma.menuItem.create({
    data: {
      name: body.name,
      description: body.description,
      price: parseFloat(body.price),
      image: body.image,
      categoryId: body.categoryId,
      isAvailable: body.isAvailable ?? true,
    },
    include: { category: true },
  });
  return NextResponse.json(item);
}
