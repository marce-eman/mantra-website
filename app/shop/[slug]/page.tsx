export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductDetailClient from "./ProductDetailClient";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  // Tarik data produk asli dari database Supabase beserta Episode terkait
  let product = await prisma.product.findUnique({
    where: { slug: decodedSlug },
    include: {
      episode: true,
    },
  });

  if (!product) {
    product = await prisma.product.findFirst({
      where: { articleNo: decodedSlug },
      include: {
        episode: true,
      },
    });
  }

  if (!product) {
    return notFound();
  }

  // Ambil produk rekomendasi dari Episode yang SAMA
  let relatedProducts: any[] = [];
  if (product.episodeId) {
    relatedProducts = await prisma.product.findMany({
      where: {
        episodeId: product.episodeId,
        id: { not: product.id },
      },
      orderBy: { createdAt: "asc" },
      take: 4,
    });
  }

  // Jika produk dalam episode sama tidak ada produk lain, ambil produk aktif lain sebagai fallback
  if (relatedProducts.length === 0) {
    relatedProducts = await prisma.product.findMany({
      where: {
        id: { not: product.id },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    });
  }

  const productSizes = product.sizes || [];

  const formattedProduct = {
    ...product,
    sizes: productSizes,
    inStock: product.stock > 0,
  };

  return (
    <ProductDetailClient
      product={formattedProduct}
      relatedProducts={relatedProducts}
      episode={product.episode}
    />
  );
}