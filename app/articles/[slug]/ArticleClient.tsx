"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowLeft, PlayCircle, XCircle } from "lucide-react";

export default function ArticleClient({ article, recommendedEpisode }: { article: any; recommendedEpisode: any }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // --- FUNGSI PINTAR: Convert Link YouTube Biasa Jadi Embed ---
  const getEmbedUrl = (url: string) => {
    if (!url || url === "#") return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : null;
  };

  const isDummy = !article;

  const no = article?.articleNo || "001";
  const title = article?.articleTitle || article?.name || (isDummy ? "The Architecture of Shadows" : "");
  const subtitle = article?.articleSubtitle || `Opus Arcanum — Article No.${no}`;
  const heroImage = article?.heroImage || article?.images?.[0] || "/images/ARTICLES STORIES.png";
  const introBody = article?.storyIntro || (isDummy ? "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit." : "");
  const leftBody = article?.storyLeft || (isDummy ? "sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit." : "");
  const rightBody = article?.storyRight || (isDummy ? "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?" : "");
  
  const galleryImages = article?.galleryImages && article.galleryImages.length > 0
    ? article.galleryImages
    : ["/images/Group 351.png", "/images/Rectangle 33.png", "/images/Rectangle 31.png", "/images/Rectangle 35.png"];

  const videoThumb = article?.videoThumb || "/images/vid art1.png";
  const videoUrl = article?.videoUrl || "#"; 
  const embedUrl = getEmbedUrl(videoUrl);

  const blockData = {
    image: article?.editorialImage || "/images/Rectangle 31.png",
    caption: article?.editorialCaption || "+ Headline",
    body: article?.editorialBody || (isDummy ? "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dita sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur." : ""),
    bodyRight: article?.editorialBodyRight || (isDummy ? "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?" : ""),
    imageRight: article?.editorialImageRight || "/images/Rectangle 33.png",
  };

  const episodeTitle = article?.episode?.title || "OPUS ARCANUM";
  const episodeNo = article?.episode?.episodeNo || "01";

  // ==========================================
  // KOMPONEN MODAL VIDEO (POP-UP)
  // ==========================================
  const VideoModal = () => (
    isVideoOpen && embedUrl ? (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-12 animate-in fade-in duration-300">
        <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-[#1f1f1f]">
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

  return (
    <div className="flex flex-col min-h-screen bg-[#050505]">
      
      {/* Panggil Modal Videonya di Sini */}
      <VideoModal />

      {/* ─────────────────────────────────────────
          1. HERO SECTION
      ───────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src={heroImage} alt={title} fill className="object-cover opacity-40 grayscale" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-transparent to-[#050505]" />
        </div>

        <div className="relative z-10 w-full max-w-screen-xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start mt-12 gap-8">
          <div className="max-w-md">
            <h1 className="text-4xl md:text-5xl text-[#ececec] font-light mb-2 font-serif tracking-wide leading-tight">
              {title}
            </h1>
            <p className="text-[#ececec]/60 text-[10px] uppercase tracking-widest mb-4">
              {subtitle}
            </p>
            <p className="text-[#ececec]/60 text-[10px] leading-relaxed text-justify whitespace-pre-line">
              {introBody} 
            </p>
          </div>
          <div className="text-[#ececec]/60 text-[10px] uppercase tracking-widest flex items-center gap-2">
            Article {no} <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* --- TOMBOL PLAY VIDEO HERO --- */}
        <div 
          onClick={() => embedUrl ? setIsVideoOpen(true) : null}
          className="relative block z-10 mt-16 md:mt-24 w-full max-w-3xl mx-6 aspect-[16/9] md:aspect-[21/9] bg-[#111] border border-[#1f1f1f] rounded-xl overflow-hidden group cursor-pointer shadow-2xl"
        >
          <Image src={videoThumb} alt="Video Cover" fill className="object-cover opacity-50 grayscale group-hover:opacity-75 group-hover:grayscale-0 transition-all duration-700" />
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayCircle className="w-16 h-16 text-[#ececec]/70 group-hover:text-white transition-colors duration-300 stroke-1" />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          2. SCROLLING MARQUEE DIVIDER
      ───────────────────────────────────────── */}
      <div className="border-y border-[#1f1f1f] bg-[#0a0a0a] py-3 overflow-hidden relative z-10">
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

      {/* ─────────────────────────────────────────
          3. OPUS ARCANUM SECTION (Light Background)
      ───────────────────────────────────────── */}
      <section className="bg-[#b3b3b3] text-[#111] py-24 relative z-10">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          <div className="mb-12">
            <span className="text-[#111]/60 text-[9px] uppercase tracking-[0.2em] font-bold block mb-2">
              Episode {episodeNo}
            </span>
            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
              <h2 className="text-3xl md:text-5xl font-light tracking-[0.15em] font-serif uppercase">
                {episodeTitle}
              </h2>
              <span className="text-[#111]/60 text-[9px] uppercase tracking-[0.2em] md:pb-2">
                ARTICLE NO.{no}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <p className="text-[#111]/80 text-[10px] leading-relaxed font-medium text-justify whitespace-pre-line">
              {leftBody}
            </p>
            <p className="text-[#111]/80 text-[10px] leading-relaxed font-medium text-justify whitespace-pre-line">
              {rightBody}
            </p>
          </div>

          <div ref={carouselRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8 items-stretch">
            {galleryImages.map((img: string, index: number) => (
              <div key={index} className={`shrink-0 ${index === 0 ? 'w-[280px] md:w-[320px]' : 'w-[240px] md:w-[280px]'} aspect-[4/5] bg-[#050505] rounded-xl relative overflow-hidden snap-center group`}>
                <Image src={img} fill className={`object-cover ${index === 0 ? 'opacity-80 group-hover:opacity-100 transition-opacity' : 'opacity-80'}`} alt={`Gallery Image ${index + 1}`} />
                {index === 0 && (
                  <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-[#333]">
                    <p className="text-[#ececec] text-xs font-serif tracking-widest">+ {title}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center gap-8 mt-6">
            <button onClick={() => scrollCarousel('left')} className="text-[#111]/50 hover:text-[#111] transition-colors cursor-pointer"><ArrowLeft className="w-5 h-5" /></button>
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-[#111]"></span>
              <span className="w-2 h-2 rounded-full bg-[#111]/30"></span>
              <span className="w-2 h-2 rounded-full bg-[#111]/30"></span>
              <span className="w-2 h-2 rounded-full bg-[#111]/30"></span>
            </div>
            <button onClick={() => scrollCarousel('right')} className="text-[#111]/50 hover:text-[#111] transition-colors cursor-pointer"><ArrowRight className="w-5 h-5" /></button>
          </div>
        </div>
      </section>

      <div className="border-y border-[#1f1f1f] bg-[#0a0a0a] py-3 overflow-hidden relative z-10">
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

      {/* ─────────────────────────────────────────
          4. ZIG-ZAG DETAILS & VIDEO
      ───────────────────────────────────────── */}
      <section className="bg-[#050505] py-24 px-6 md:px-12 relative z-10">
        <div className="max-w-screen-xl mx-auto space-y-24 md:space-y-32">

          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
            <div className="w-full md:w-1/2 flex justify-center md:justify-end">
              <div className="relative w-full max-w-[400px] aspect-[4/5] rounded-xl overflow-hidden border border-[#1f1f1f]">
                <Image src={blockData.image} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Zigzag Left" />
              </div>
            </div>
            <div className="w-full md:w-1/2 max-w-md">
              <h3 className="text-[#ececec] text-[11px] uppercase tracking-[0.2em] font-bold mb-6">
                {blockData.caption}
              </h3>
              <p className="text-[#ececec]/60 text-[10px] leading-relaxed text-justify mb-4 whitespace-pre-line">
                {blockData.body}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
            <div className="w-full md:w-1/2 max-w-md md:text-right order-2 md:order-1 flex flex-col items-end ml-auto">
              <h3 className="text-[#ececec] text-[11px] uppercase tracking-[0.2em] font-bold mb-6">
                {blockData.caption}
              </h3>
              <p className="text-[#ececec]/60 text-[10px] leading-relaxed text-justify md:text-right mb-4 whitespace-pre-line">
                {blockData.bodyRight}
              </p>
            </div>
            <div className="w-full md:w-1/2 order-1 md:order-2 flex justify-start">
              <div className="relative w-full max-w-[500px] aspect-[16/10] rounded-xl overflow-hidden border border-[#1f1f1f]">
                <Image src={blockData.imageRight} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Zigzag Right" />
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-12">
            {/* --- TOMBOL PLAY VIDEO BAWAH --- */}
            <div 
              onClick={() => embedUrl ? setIsVideoOpen(true) : null}
              className="relative block w-full max-w-4xl aspect-[21/9] bg-[#111] border border-[#1f1f1f] rounded-xl overflow-hidden group cursor-pointer shadow-2xl"
            >
              <Image src={videoThumb} alt="Secondary Video Cover" fill className="object-cover opacity-40 grayscale group-hover:opacity-70 group-hover:grayscale-0 transition-all duration-700" />
              <div className="absolute inset-0 flex items-center justify-center">
                <PlayCircle className="w-16 h-16 text-[#ececec]/70 group-hover:text-white transition-colors duration-300 stroke-1" />
              </div>
              <div className="absolute bottom-4 left-4 -rotate-90 origin-bottom-left text-[#ececec]/30 text-[7px] tracking-widest uppercase">
                MANTRA
              </div>
              <div className="absolute bottom-4 right-4 -rotate-90 origin-bottom-right text-[#ececec]/30 text-[7px] tracking-widest uppercase">
                CHROME
              </div>
            </div>
          </div>

        </div>
      </section>

      <div className="border-y border-[#1f1f1f] bg-[#0a0a0a] py-3 overflow-hidden relative z-10">
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

      {/* ─────────────────────────────────────────
          5. DINAMIS REKOMENDASI 1 EPISODE BERIKUTNYA
      ───────────────────────────────────────── */}
      {recommendedEpisode && (() => {
        const epItems = recommendedEpisode.articles && recommendedEpisode.articles.length > 0
          ? recommendedEpisode.articles.map((art: any, idx: number) => ({
              id: art.id,
              slug: art.slug,
              image: art.heroImage || art.images?.[0] || "/images/placeholder.jpg",
              title: art.name,
              articleNo: art.articleNo || `00${idx + 1}`,
            }))
          : [];

        if (epItems.length === 0) return null;

        return (
          <section className="relative z-20 bg-[#050505] pt-24 pb-24 border-b border-[#1f1f1f]">
            <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
              <div className="flex justify-end items-end mb-12">
                <div className="text-right">
                  <span className="text-[#ececec]/40 text-[9px] uppercase tracking-[0.3em] block mb-1">
                    NEXT EPISODE — {recommendedEpisode.episodeNo || "02"}
                  </span>
                  <h2 className="text-2xl md:text-4xl font-light text-[#ececec] tracking-[0.2em] font-serif uppercase">
                    {recommendedEpisode.title}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {epItems.map((item: any) => (
                  <Link
                    key={item.id}
                    href={`/articles/${item.slug}`}
                    className="relative overflow-hidden rounded-2xl border border-[#1f1f1f]/80 group aspect-[3/4] bg-black/30 block cursor-pointer transition-all duration-500 hover:-translate-y-2"
                  >
                    <Image src={item.image} alt={item.title} fill className="object-cover grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 rounded-2xl" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl z-10" />
                    <div className="absolute bottom-6 left-4 right-4 translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 z-20">
                      <div className="bg-black/80 backdrop-blur-md border border-[#1f1f1f] p-4 rounded-xl shadow-xl">
                        <p className="text-[#ececec]/60 text-[9px] uppercase tracking-widest mb-1">
                          <span className="text-[#ececec] font-bold mr-1">+</span>
                          Article No.{item.articleNo}
                        </p>
                        <h3 className="text-[#ececec] text-sm font-light tracking-wide mb-2 truncate">
                          {item.title}
                        </h3>
                        <div className="text-[#ececec]/60 text-[9px] uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors">
                          Learn more <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

    </div>
  );
}