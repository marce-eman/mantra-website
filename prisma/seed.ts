import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding products...");

  // Hapus data produk lama jika ada
  await prisma.product.deleteMany();

  // Masukkan 4 data produk awal MANTRA
  await prisma.product.createMany({
    data: [
      {
        name: "MANTRA - OVERSIZED HOODIE VOL 1",
        slug: "mantra-oversized-hoodie-vol-1",
        description: "Heavyweight cotton fleece oversized hoodie with custom screenprinted brutalist art.",
        price: 450000,
        stock: 15,
        images: ["/images/products/hoodie-1.jpg"],
      },
      {
        name: "MANTRA - T-SHIRT OPUS ARCANUM",
        slug: "mantra-tshirt-opus-arcanum",
        description: "100% Cotton combed 24s. Boxy fit aesthetic with high-density graphics.",
        price: 250000,
        stock: 20,
        images: ["/images/products/tshirt-1.jpg"],
      },
      {
        name: "MANTRA - CAP VOID SHADOW",
        slug: "mantra-cap-void-shadow",
        description: "Unstructured 6-panel strapback cap with front embroidery.",
        price: 180000,
        stock: 10,
        images: ["/images/products/cap-1.jpg"],
      },
      {
        name: "MANTRA - ARCANUM JACKET VOL 1",
        slug: "mantra-arcanum-jacket-vol-1",
        description: "Heavyweight utility jacket with industrial hardware and brutalist typography.",
        price: 650000,
        stock: 12,
        images: ["/images/products/jacket-1.jpg"],
      },
    ],
  });

  console.log("Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });