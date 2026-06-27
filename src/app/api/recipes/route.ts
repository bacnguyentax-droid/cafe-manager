import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const recipes = await prisma.recipe.findMany({
    include: {
      menuItem: { include: { category: true } },
      ingredient: true,
    },
    orderBy: { menuItem: { name: "asc" } },
  });

  // Group by menu item
  const grouped = recipes.reduce(
    (acc, r) => {
      const key = r.menuItemId;
      if (!acc[key]) {
        acc[key] = { menuItem: r.menuItem, ingredients: [] };
      }
      acc[key].ingredients.push({ ingredient: r.ingredient, quantity: r.quantity, id: r.id });
      return acc;
    },
    {} as Record<string, { menuItem: (typeof recipes)[0]["menuItem"]; ingredients: { ingredient: (typeof recipes)[0]["ingredient"]; quantity: number; id: string }[] }>
  );

  return NextResponse.json(Object.values(grouped));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === "STAFF") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const { menuItemId, ingredientId, quantity } = await req.json();
  const recipe = await prisma.recipe.upsert({
    where: { menuItemId_ingredientId: { menuItemId, ingredientId } },
    update: { quantity: parseFloat(quantity) },
    create: { menuItemId, ingredientId, quantity: parseFloat(quantity) },
    include: { menuItem: true, ingredient: true },
  });
  return NextResponse.json(recipe);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === "STAFF") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const { id } = await req.json();
  await prisma.recipe.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
