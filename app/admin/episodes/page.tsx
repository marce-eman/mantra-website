import { prisma } from "@/lib/prisma";
import EpisodesClient from "./EpisodesClient";

export default async function AdminEpisodesPage() {
  // Ambil semua data episode dari database
  const episodes = await prisma.episode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 md:p-12">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-light tracking-widest uppercase mb-2 font-serif">
          Manage Episodes
        </h1>
        <p className="text-xs text-[#ececec]/50 uppercase tracking-widest">
          Atur cerita utama dan tampilan latar untuk Halaman Home.
        </p>
      </div>

      {/* Oper data ke komponen interaktif (Client) */}
      <EpisodesClient initialEpisodes={episodes} />
    </div>
  );
}