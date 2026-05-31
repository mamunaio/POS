import { prisma } from "../src/index.js";

async function main() {
  const branch = await prisma.branch.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Main Branch",
      address: "Dhaka",
    },
  });

  await prisma.product.upsert({
    where: { sku: "WATER-500" },
    update: {},
    create: {
      sku: "WATER-500",
      barcode: "8901234567890",
      name: "Mineral Water 500ml",
      priceMinor: 2000, // 20.00
      taxRateBps: 0,
      stock: 100,
    },
  });

  await prisma.product.upsert({
    where: { sku: "CHIPS-100" },
    update: {},
    create: {
      sku: "CHIPS-100",
      barcode: "8909876543210",
      name: "Potato Chips 100g",
      priceMinor: 5000, // 50.00
      taxRateBps: 1500, // 15%
      stock: 50,
    },
  });

  console.log(`Seeded branch ${branch.name} and sample products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
