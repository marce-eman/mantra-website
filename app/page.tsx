import { prisma } from "@/lib/prisma";
import HomeClient from "./HomeClient";
export const revalidate = 60;

export default async function Home() {
  // Ambil SEMUA episode yang statusnya ACTIVE
  const episodes = await prisma.episode.findMany({
    where: { isActive: true }, 
    orderBy: { createdAt: "asc" },
    include: {
      articles: {
        // FILTER 'where: { isArticle: true }' SUDAH DIHAPUS DI SINI
        // Sekarang semua produk yang masuk ke episode ini pasti ikut tampil!
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return <HomeClient episodes={episodes} />;
}