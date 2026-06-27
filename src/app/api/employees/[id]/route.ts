import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {
    name: body.name,
    role: body.role,
    phone: body.phone,
    isActive: body.isActive,
  };
  if (body.password) data.password = await bcrypt.hash(body.password, 10);

  const user = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, name: true, email: true, role: true, phone: true, isActive: true, createdAt: true },
  });
  return NextResponse.json(user);
}
