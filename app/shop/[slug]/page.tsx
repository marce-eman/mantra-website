import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductDetailClient from "./ProductDetailClient";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Tarik data produk asli dari database Supabase
  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) {
    return notFound();
  }

  // Karena Prisma sudah memastikan formatnya adalah Array (daftar), 
  // kita tinggal panggil langsung datanya, atau pakai array kosong [] jika tidak ada data.
  const productSizes = product.sizes || [];

  // Format data untuk dikirim ke Client Component
  const formattedProduct = {
    ...product,
    sizes: productSizes, // Datanya sudah otomatis berbentuk ["S", "XL"]
    inStock: product.stock > 0,
  };

  return <ProductDetailClient product={formattedProduct} />;
}