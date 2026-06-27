import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Seed admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@cafe.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@cafe.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const staffPassword = await bcrypt.hash("staff123", 10);
  await prisma.user.upsert({
    where: { email: "staff@cafe.com" },
    update: {},
    create: {
      name: "Nhân viên 1",
      email: "staff@cafe.com",
      password: staffPassword,
      role: "STAFF",
    },
  });

  // Seed categories
  const coffeeCategory = await prisma.category.upsert({
    where: { name: "Cà phê" },
    update: {},
    create: { name: "Cà phê", color: "#92400E" },
  });

  const teaCategory = await prisma.category.upsert({
    where: { name: "Trà" },
    update: {},
    create: { name: "Trà", color: "#065F46" },
  });

  const smoothieCategory = await prisma.category.upsert({
    where: { name: "Sinh tố" },
    update: {},
    create: { name: "Sinh tố", color: "#7C3AED" },
  });

  const foodCategory = await prisma.category.upsert({
    where: { name: "Đồ ăn" },
    update: {},
    create: { name: "Đồ ăn", color: "#DC2626" },
  });

  // Seed menu items
  await prisma.menuItem.createMany({
    skipDuplicates: true,
    data: [
      { name: "Cà phê đen", price: 25000, categoryId: coffeeCategory.id, description: "Cà phê đen truyền thống" },
      { name: "Cà phê sữa", price: 30000, categoryId: coffeeCategory.id, description: "Cà phê sữa đặc" },
      { name: "Cà phê đá", price: 28000, categoryId: coffeeCategory.id, description: "Cà phê đá mát lạnh" },
      { name: "Cappuccino", price: 55000, categoryId: coffeeCategory.id, description: "Cappuccino kem mịn" },
      { name: "Latte", price: 55000, categoryId: coffeeCategory.id, description: "Cà phê sữa Latte" },
      { name: "Americano", price: 45000, categoryId: coffeeCategory.id, description: "Espresso pha loãng" },
      { name: "Trà đào", price: 35000, categoryId: teaCategory.id, description: "Trà đào thơm ngon" },
      { name: "Trà sữa trân châu", price: 40000, categoryId: teaCategory.id, description: "Trà sữa với trân châu" },
      { name: "Sinh tố bơ", price: 45000, categoryId: smoothieCategory.id, description: "Sinh tố bơ béo ngậy" },
      { name: "Sinh tố dâu", price: 40000, categoryId: smoothieCategory.id, description: "Sinh tố dâu tươi" },
      { name: "Bánh croissant", price: 35000, categoryId: foodCategory.id, description: "Bánh croissant bơ" },
      { name: "Bánh mì nướng", price: 25000, categoryId: foodCategory.id, description: "Bánh mì nướng bơ tỏi" },
    ],
  });

  // Seed ingredients
  const espresso = await prisma.ingredient.upsert({
    where: { name: "Espresso" },
    update: {},
    create: { name: "Espresso", unit: "ml", quantity: 5000, minQuantity: 500, costPerUnit: 0.05 },
  });

  const milk = await prisma.ingredient.upsert({
    where: { name: "Sữa tươi" },
    update: {},
    create: { name: "Sữa tươi", unit: "ml", quantity: 10000, minQuantity: 1000, costPerUnit: 0.025 },
  });

  const condensedMilk = await prisma.ingredient.upsert({
    where: { name: "Sữa đặc" },
    update: {},
    create: { name: "Sữa đặc", unit: "ml", quantity: 3000, minQuantity: 300, costPerUnit: 0.04 },
  });

  const sugar = await prisma.ingredient.upsert({
    where: { name: "Đường" },
    update: {},
    create: { name: "Đường", unit: "g", quantity: 5000, minQuantity: 500, costPerUnit: 0.01 },
  });

  const iceCream = await prisma.ingredient.upsert({
    where: { name: "Kem tươi" },
    update: {},
    create: { name: "Kem tươi", unit: "ml", quantity: 2000, minQuantity: 200, costPerUnit: 0.06 },
  });

  console.log("Seed completed:", { admin });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
