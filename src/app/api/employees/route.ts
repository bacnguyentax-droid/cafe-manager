import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === "STAFF") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const employees = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      isActive: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });
  return NextResponse.json(employees);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const body = await req.json();
  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) return NextResponse.json({ error: "Email đã tồn tại" }, { status: 400 });

  const password = await bcrypt.hash(body.password || "password123", 10);
  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      password,
      role: body.role || "STAFF",
      phone: body.phone,
    },
    select: { id: true, name: true, email: true, role: true, phone: true, isActive: true, createdAt: true },
  });
  return NextResponse.json(user);
}
