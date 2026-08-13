import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export default async function ShopPage() {
  // 1. Ambil semua episode berurutan, beserta produk di dalamnya
  const episodes = await prisma.episode.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      articles: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // 2. Ambil juga produk yang belum masuk episode manapun (jika ada)
  const unassignedArticles = await prisma.product.findMany({
    where: { episodeId: null },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#050505] text-[#ececec] pt-28 pb-20 px-6 md:px-12 border-t border-[#1f1f1f]">
      <div className="max-w-screen-2xl mx-auto space-y-20">
        
        {/* Header Shop */}
        <div className="border-b border-[#1f1f1f] pb-6">
          <h1 className="text-3xl md:text-5xl font-light tracking-widest uppercase mb-2">
            CATALOGUE
          </h1>
          <p className="text-[#ececec]/50 text-xs uppercase tracking-widest font-mono">
            A manifestation of shadows and brutalist aesthetic.
          </p>
        </div>

        {episodes.length === 0 && unassignedArticles.length === 0 ? (
          <div className="text-center py-20 border border-[#1f1f1f] bg-[#0a0a0a] rounded-2xl">
            <p className="text-xs uppercase tracking-widest text-[#ececec]/40 font-mono">
              Belum ada produk atau episode di database.
            </p>
          </div>
        ) : (
          <div className="space-y-24">
            
            {/* Kelompokkan produk berdasarkan Episode secara visual */}
            {episodes.map((ep) => (
              <div key={ep.id} className="space-y-8">
                
                {/* Judul Pembatas Episode di Katalog */}
                <div className="flex items-center gap-4 border-b border-[#1f1f1f] pb-4">
                  <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest">
                    EPISODE {ep.episodeNo || "0X"}
                  </span>
                  <h2 className="text-xl md:text-2xl font-light tracking-widest uppercase font-serif">
                    {ep.title}
                  </h2>
                  <span className="text-xs text-[#ececec]/40 font-mono ml-auto">
                    ({ep.articles.length} Items)
                  </span>
                </div>
                
                {/* Grid Baju untuk Episode Tersebut */}
                {ep.articles.length === 0 ? (
                  <p className="text-[#ececec]/30 text-xs uppercase tracking-widest font-mono">
                    Belum ada baju/artikel di episode ini.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {ep.articles.map((product) => (
                      <ProductCard key={product.id} item={product} />
                    ))}
                  </div>
                )}
                
              </div>
            ))}

            {/* Produk Unassigned (Jika ada yang belum punya episode) */}
            {unassignedArticles.length > 0 && (
              <div className="space-y-8 pt-8 border-t border-dashed border-[#2a2a2a]">
                <div className="flex items-center gap-4 border-b border-[#1f1f1f] pb-4">
                  <span className="text-amber-400 font-mono text-xs uppercase tracking-widest">
                    UNASSIGNED COLLECTION
                  </span>
                  <span className="text-xs text-[#ececec]/40 font-mono ml-auto">
                    ({unassignedArticles.length} Items)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {unassignedArticles.map((product) => (
                    <ProductCard key={product.id} item={product} />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}