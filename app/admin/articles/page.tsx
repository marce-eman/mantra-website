import { prisma } from "@/lib/prisma";
import ArticlesClient from "./ArticlesClient";

export default async function AdminArticlesPage() {
  // 1. Ambil episode lengkap dengan artikel di dalamnya
  const episodes = await prisma.episode.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      articles: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // 2. Ambil produk yang belum masuk episode manapun
  const unassignedArticles = await prisma.product.findMany({
    where: { episodeId: null },
    orderBy: { createdAt: "desc" },
  });

  // 3. Ambil list episode untuk pilihan dropdown di modal
  const allEpisodes = await prisma.episode.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <ArticlesClient 
      initialEpisodes={episodes} 
      initialUnassigned={unassignedArticles} 
      availableEpisodes={allEpisodes}
    />
  );
}