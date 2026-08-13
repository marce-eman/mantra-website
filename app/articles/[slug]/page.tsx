export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import ArticleClient from "./ArticleClient";

export default async function EpisodePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;

  // JURUS FIX: Ubah kode "%20" dari URL kembali menjadi "spasi" biasa
  const decodedSlug = decodeURIComponent(resolvedParams.slug);

  // Cari artikel di DB menggunakan decodedSlug (yang sudah bersih dari %20)
  let article = await prisma.product.findUnique({
    where: { slug: decodedSlug },
    include: { episode: true },
  });

  // Jika tidak ketemu berdasarkan slug, cari berdasarkan articleNo
  if (!article) {
    article = await prisma.product.findFirst({
      where: { articleNo: decodedSlug },
      include: { episode: true },
    });
  }

  // Ambil semua episode yang berstatus ACTIVE secara berurutan
  const activeEpisodes = await prisma.episode.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    include: {
      articles: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  let recommendedEpisode = null;

  // Tentukan satu episode berikutnya secara berurutan
  if (activeEpisodes.length > 0) {
    const currentEpId = article?.episodeId;
    const currentIndex = activeEpisodes.findIndex((ep) => ep.id === currentEpId);

    if (currentIndex !== -1 && activeEpisodes.length > 1) {
      const nextIndex = (currentIndex + 1) % activeEpisodes.length;
      recommendedEpisode = activeEpisodes[nextIndex];
    } else if (activeEpisodes.length === 1 && activeEpisodes[0].id !== currentEpId) {
      recommendedEpisode = activeEpisodes[0];
    } else if (currentIndex === -1 && activeEpisodes.length > 0) {
      recommendedEpisode = activeEpisodes[0];
    }
  }

  // Oper artikel dan satu episode rekomendasi ke komponen klien
  return <ArticleClient article={article} recommendedEpisode={recommendedEpisode} />;
}