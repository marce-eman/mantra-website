"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, XCircle } from "lucide-react";

// --- KOMPONEN BANTUAN UNTUK KARTU GRID (EPISODE GENAP) ---
const GridCard = ({ item, aspect }: { item: any; aspect: string }) => (
  <Link
    href={`/articles/${item.slug}`}
    className={`relative overflow-hidden rounded-2xl border border-transparent hover:border-[#1f1f1f] group ${aspect} bg-black/30 block cursor-pointer transition-all duration-500 hover:-translate-y-2`}
  >
    <Image
      src={item.image}
      alt={item.title}
      fill
      className="object-cover grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 rounded-2xl"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl z-10" />

    <div className="absolute bottom-6 left-4 right-4 translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 z-20">
      <div className="bg-black/80 backdrop-blur-md border border-[#1f1f1f] p-4 md:p-5 rounded-xl shadow-xl">
        <p className="text-[#ececec]/60 text-[9px] uppercase tracking-widest mb-1">
          <span className="text-[#ececec] font-bold mr-1">+</span>
          Article No.{item.articleNo}
        </p>
        <h3 className="text-[#ececec] text-sm md:text-lg font-light tracking-wide mb-2 md:mb-3 truncate">
          {item.title}
        </h3>
        <div className="text-[#ececec]/60 text-[9px] uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors">
          Learn more <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  </Link>
);

// --- KOMPONEN UTAMA SETIAP EPISODE ---
function EpisodeBlock({ episode, index }: { episode: any; index: number }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -350 : 350;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // --- FUNGSI PINTAR: Convert Link YouTube Biasa Jadi Embed ---
  const getEmbedUrl = (url: string) => {
    if (!url || url === "#") return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : null;
  };
  
  const embedUrl = getEmbedUrl(episode.videoUrl);

  const defaultItems = [
    { id: "1", slug: "1", image: "/images/Group 351.png", title: "Fluere Nabulam", articleNo: "001" },
    { id: "2", slug: "2", image: "/images/Group 361.png", title: "Nocturne Cargo", articleNo: "002" },
    { id: "3", slug: "3", image: "/images/Group 37-1.png", title: "Void Heavyweight", articleNo: "003" },
    { id: "4", slug: "4", image: "/images/Group 381.jpeg", title: "Arcanum Jacket", articleNo: "004" },
  ];

  const episodeItems = episode.articles && episode.articles.length > 0
    ? episode.articles.map((art: any, idx: number) => ({
        id: art.id,
        slug: art.slug,
        image: art.heroImage || art.images?.[0] || "/images/placeholder.jpg",
        title: art.name,
        articleNo: art.articleNo || `00${idx + 1}`,
      }))
    : defaultItems;

  const isEvenEpisode = index % 2 !== 0;

  // ==========================================
  // KOMPONEN MODAL VIDEO (POP-UP)
  // ==========================================
  const VideoModal = () => (
    isVideoOpen && embedUrl ? (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-12 animate-in fade-in duration-300">
        <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-[#1f1f1f]">
          {/* Tombol Close ala Screenshot */}
          <button
            onClick={() => setIsVideoOpen(false)}
            className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-black/60 hover:bg-red-900/80 border border-[#1f1f1f] text-[#ececec] px-4 py-2 rounded-full text-[10px] uppercase tracking-widest transition-colors cursor-pointer backdrop-blur-md"
          >
            <XCircle className="w-4 h-4 text-red-400" /> Close Video
          </button>
          
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    ) : null
  );

  // ==========================================
  // LAYOUT B: EPISODE GENAP (GRID STYLE)
  // ==========================================
  if (isEvenEpisode) {
    return (
      <section className="relative z-20 bg-[#050505] pt-16 pb-24 border-b border-[#1f1f1f]">
        
        {/* Panggil Modal Videonya di Sini */}
        <VideoModal />

        <div className="flex">
          <div className="hidden md:flex flex-col items-center justify-between w-16 shrink-0 border-r border-[#1f1f1f] py-12 px-4">
            <div className="flex flex-col gap-6 items-center text-[#ececec]/60"></div>
            <div className="-rotate-90 text-[#ececec]/30 text-[9px] uppercase tracking-[0.25em] whitespace-nowrap select-none mt-24">
              DISCOVER OUR STORIES
            </div>
          </div>

          <div className="flex-1 px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mb-16">
              
              {/* KIRI: VIDEO THUMBNAIL */}
              <div className="md:col-span-5 flex justify-start">
                <div 
                  onClick={() => embedUrl ? setIsVideoOpen(true) : null}
                  className="relative block w-full max-w-[340px] aspect-[16/10] bg-black/60 backdrop-blur-md border border-[#1f1f1f]/80 rounded-2xl overflow-hidden group shadow-2xl cursor-pointer"
                >
                  <Image 
                    src={episode.heroImage || "/images/ARTICLES STORIES.png"} 
                    alt="Episode Preview" 
                    fill 
                    className="object-cover opacity-75 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full border border-[#ececec]/50 flex items-center justify-center backdrop-blur-md bg-black/40 transition-transform group-hover:scale-110">
                      <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-[#ececec] border-b-[8px] border-b-transparent ml-1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* KANAN: JUDUL EPISODE & PARAGRAF */}
              <div className="md:col-span-7 flex flex-col items-end text-right">
                <span className="text-[#ececec]/50 text-[10px] uppercase tracking-widest block mb-3">
                  Episode {episode.episodeNo || `0${index + 1}`}
                </span>
                <h2 className="text-3xl md:text-5xl font-light text-[#ececec] tracking-[0.15em] mb-6 leading-none whitespace-pre-line uppercase">
                  {episode.title || "LEARN THE CHANTS"}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left mt-2">
                  <p className="text-[#ececec]/60 text-xs leading-relaxed whitespace-pre-line">
                    {episode.descriptionLeft || ""}
                  </p>
                  <p className="text-[#ececec]/60 text-xs leading-relaxed whitespace-pre-line">
                    {episode.descriptionRight || ""}
                  </p>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {(episodeItems[0] || episodeItems[1]) && (
                <div className="flex flex-col gap-6">
                  {episodeItems[0] && <GridCard item={episodeItems[0]} aspect="aspect-[4/3]" />}
                  {episodeItems[1] && <GridCard item={episodeItems[1]} aspect="aspect-[4/3]" />}
                </div>
              )}
              {episodeItems[2] && <GridCard item={episodeItems[2]} aspect="aspect-[3/4]" />}
              {episodeItems[3] && <GridCard item={episodeItems[3]} aspect="aspect-[3/4]" />}
              {episodeItems.slice(4).map((item: any) => (
                <GridCard key={item.id} item={item} aspect="aspect-[3/4]" />
              ))}
            </div>

          </div>
        </div>
      </section>
    );
  }

  // ==========================================
  // LAYOUT A: EPISODE GANJIL (CAROUSEL STYLE)
  // ==========================================
  return (
    <section className="relative z-20 pt-24 pb-16 bg-[#050505] overflow-hidden border-b border-[#1f1f1f]">
      
      {/* Panggil Modal Videonya di Sini */}
      <VideoModal />

      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7">
            <span className="text-[#ececec]/50 text-[10px] uppercase tracking-widest block mb-3">
              Episode {episode.episodeNo || `0${index + 1}`}
            </span>
            <h2 className="text-3xl md:text-5xl font-light text-[#ececec] tracking-[0.15em] mb-6 leading-none whitespace-pre-line uppercase">
              {episode.title || "OPUS ARCANUM"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <p className="text-[#ececec]/60 text-xs leading-relaxed whitespace-pre-line">
                {episode.descriptionLeft || "Belum ada deskripsi."}
              </p>
              <p className="text-[#ececec]/60 text-xs leading-relaxed whitespace-pre-line">
                {episode.descriptionRight || ""}
              </p>
            </div>
          </div>

          <div className="md:col-span-5 flex justify-end">
            <div 
              onClick={() => embedUrl ? setIsVideoOpen(true) : null}
              className="relative block w-full max-w-[340px] aspect-[16/10] bg-black/60 backdrop-blur-md border border-[#1f1f1f]/80 rounded-2xl overflow-hidden group shadow-2xl cursor-pointer"
            >
              <Image 
                src={episode.heroImage || "/images/ARTICLES STORIES.png"} 
                alt="Episode Preview" 
                fill 
                className="object-cover opacity-75 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" 
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full border border-[#ececec]/50 flex items-center justify-center backdrop-blur-md bg-black/40 transition-transform group-hover:scale-110">
                  <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-[#ececec] border-b-[8px] border-b-transparent ml-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full">
        <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20">
          <button onClick={() => scrollCarousel("left")} className="w-10 h-10 border border-[#1f1f1f] bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-[#ececec]/60 hover:text-white hover:bg-[#1f1f1f] transition-all cursor-pointer">
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </div>
        <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20">
          <button onClick={() => scrollCarousel("right")} className="w-10 h-10 border border-[#1f1f1f] bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-[#ececec]/60 hover:text-white hover:bg-[#1f1f1f] transition-all cursor-pointer">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div ref={carouselRef} className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pl-16 pr-16 md:pl-24 md:pr-24 space-x-6 pb-8 items-stretch">
          {episodeItems.map((item: any) => (
            <div key={item.id} className="shrink-0 flex items-center gap-4 snap-center group">
              <div className="hidden md:flex -rotate-90 text-[#ececec]/30 text-[9px] uppercase tracking-widest whitespace-nowrap select-none">
                Article NO.{item.articleNo}
              </div>
              <Link href={`/articles/${item.slug}`} className="relative w-[260px] h-[360px] md:w-[340px] md:h-[460px] rounded-2xl border border-transparent hover:border-[#1f1f1f] bg-transparent overflow-hidden block transition-all duration-500 hover:-translate-y-3">
                <Image src={item.image} alt={item.title} fill className="object-cover p-2 transition-all duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0 rounded-2xl" />
                <div className="absolute bottom-8 left-4 right-4 translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 z-20">
                  <div className="bg-black/80 backdrop-blur-md border border-[#1f1f1f] p-5 rounded-xl shadow-xl">
                    <p className="text-[#ececec]/60 text-[9px] uppercase tracking-widest mb-1">
                      <span className="text-[#ececec] font-bold mr-1">+</span>
                      {item.title}
                    </p>
                    <h3 className="text-[#ececec] text-lg font-light tracking-wide mb-3">{item.title}</h3>
                    <div className="text-[#ececec]/60 text-[9px] uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors">
                      Learn more <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 rounded-2xl" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomeClient({ episodes }: { episodes: any[] }) {
  const safeEpisodes = episodes && episodes.length > 0 ? episodes : [];

  return (
    <div className="flex flex-col min-h-screen">

      {/* --- HERO SECTION --- */}
      <section className="relative h-screen w-full flex items-center justify-center bg-[#050505] overflow-hidden">
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none md:hidden">
          <div className="relative w-[150vw] aspect-square flex items-center justify-center">
            <Image
              src="/images/pexels-wendelmoretti-1925630(background mata untuk jam).png"
              alt="Mantra Eye Background"
              fill
              className="object-cover object-center grayscale opacity-100 brightness-100 scale-140 translate-y-13"
              priority
            />
            <Image
              src="/images/MASK.png"
              alt="Mantra Clock Hero"
              fill
              className="object-contain mix-blend-screen opacity-45 contrast-125 scale-120 -translate-y-1"
              priority
            />
          </div>
        </div>

        <div className="hidden md:flex absolute inset-0 z-0 items-center justify-center pointer-events-none">
          <Image
            src="/images/pexels-wendelmoretti-1925630(background mata untuk jam).png"
            alt="Mantra Eye Background"
            fill
            className="object-cover object-[center_17%] scale-100 grayscale opacity-100 brightness-100"
            priority
          />
        </div>

        <div className="hidden md:flex absolute inset-0 z-10 items-center justify-center pointer-events-none">
          <div className="relative w-full h-full max-w-[400vh] aspect-square">
            <Image
              src="/images/MASK.png"
              alt="Mantra Clock Hero"
              fill
              className="object-contain mix-blend-screen opacity-45 contrast-125 scale-120 translate-y-10"
              priority
            />
          </div>
        </div>

        <div className="relative z-20 text-center flex flex-col items-center max-w-[400px] px-4">
          <div className="mb-4 flex justify-center mt-6">
            <Image
              alt="Mantra Wordmark Hero"
              className="object-contain opacity-90 drop-shadow-md"
              height={24}
              priority
              src="/images/WORDMARK CHROME 1.png"
              width={140}
            />
          </div>

          <p className="text-[#ececec] text-[7px] uppercase tracking-[0.25em] mb-6 leading-[2.5] font-medium text-center drop-shadow-md">
            A manifestation born from the shadows. Where silence meets brutalist form,
            and identity transcends time. Crafted for those who walk through the void
            and seek truth within the dark.
          </p>

          <Link
            className="border border-[#4a4a4a] bg-[#050505]/70 backdrop-blur-md text-[#ececec] px-6 py-2 uppercase tracking-[0.2em] text-[7px] font-bold hover:bg-white hover:text-black transition-all duration-300 rounded-full flex items-center gap-2"
            href="/#collection"
          >
            Learn More
            <ArrowRight className="w-2.5 h-2.5" />
          </Link>
        </div>
      </section>

      <div id="collection" className="border-y border-[#1f1f1f] bg-[#0a0a0a] py-3 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee-slow">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="flex items-center space-x-8 mx-6 text-[#ececec]/30 text-[10px] uppercase tracking-[0.3em] font-mono">
              <span>MANTRA</span>
              <span className="w-1 h-1 rounded-full bg-current inline-block" />
              <Image src="/images/ICON CHROME 1.png" alt="icon" width={10} height={10} className="object-contain opacity-50" />
              <span className="w-1 h-1 rounded-full bg-current inline-block" />
            </span>
          ))}
        </div>
      </div>

      {safeEpisodes.map((ep, index) => (
        <EpisodeBlock key={ep.id} episode={ep} index={index} />
      ))}

      {safeEpisodes.length === 0 && (
         <EpisodeBlock episode={{}} index={0} />
      )}
    </div>
  );
}