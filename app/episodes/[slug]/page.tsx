import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowLeft, PlayCircle } from "lucide-react";
import { notFound } from "next/navigation";

const episodes = {
  "1": {
    no: "001",
    title: "The Architecture of Shadows",
    subtitle: "Opus Arcanum — Article No.001",
    heroImage: "/images/ARTICLES STORIES.png",
    leftBody: `Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.

sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.`,
    rightBody: `Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?`,
    galleryImages: [
      "/images/Group 351.png",
      "/images/Rectangle 33.png",
      "/images/Rectangle 31.png",
      "/images/Rectangle 35.png",
    ],
    editorialBlocks: [
      {
        image: "/images/Rectangle 31.png",
        caption: "+ Headline",
        body: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dita sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur.",
        bodyRight: "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.",
        imageRight: "/images/Rectangle 33.png",
      }
    ],
    videoThumb: "/images/vid art1.png",
  },
  "2": {
    no: "002",
    title: "Fabric & Form",
    subtitle: "Opus Arcanum — Article No.002",
    heroImage: "/images/ARTICLES STORIES2.png",
    leftBody: `Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.`,
    rightBody: `Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?`,
    galleryImages: [
      "/images/Group 36.png",
      "/images/Rectangle 37.png",
      "/images/Rectangle 29.png",
      "/images/Rectangle 31.png",
    ],
    editorialBlocks: [
      {
        image: "/images/Rectangle 32.png",
        caption: "+ Headline",
        body: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
        bodyRight: "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.",
        imageRight: "/images/Rectangle 33.png",
      },
    ],
    videoThumb: "/images/vid art1.png",
  },
  "3": {
    no: "003",
    title: "Behind the Void",
    subtitle: "Opus Arcanum — Article No.003",
    heroImage: "/images/ARTICLES STORIES3.png",
    leftBody: `Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`,
    rightBody: `Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?`,
    galleryImages: [
      "/images/Group 36-1.png",
      "/images/Rectangle 33.png",
      "/images/Rectangle 34.png",
      "/images/Rectangle 35.png",
    ],
    editorialBlocks: [
      {
        image: "/images/Rectangle 36.png",
        caption: "+ Headline",
        body: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
        bodyRight: "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.",
        imageRight: "/images/Rectangle 37.png",
      },
    ],
    videoThumb: "/images/vid art1.png",
  },
  "4": {
    no: "004",
    title: "Arcanum Jacket",
    subtitle: "Opus Arcanum — Article No.004",
    heroImage: "/images/ARTICLES STORIES4.png",
    leftBody: `Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`,
    rightBody: `Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?`,
    galleryImages: [
      "/images/Group 47.png",
      "/images/Rectangle 26.png",
      "/images/Rectangle 27.png",
      "/images/Rectangle 28.png",
    ],
    editorialBlocks: [
      {
        image: "/images/Rectangle 29.png",
        caption: "+ Headline",
        body: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
        bodyRight: "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.",
        imageRight: "/images/Rectangle 31.png",
      },
    ],
    videoThumb: "/images/vid art1.png",
  },
};

export default async function EpisodePage({ params }: { params: Promise<{ slug: string }> }) {

  // 3. Kita "tunggu" (await) params-nya sampai datanya siap
  const resolvedParams = await params;

  // 4. Baru kita ambil slug-nya
  const episode = episodes[resolvedParams.slug as keyof typeof episodes];

  if (!episode) {
    notFound();
  }

  const blockData = episode.editorialBlocks[0] || null;

  return (
    <div className="flex flex-col min-h-screen bg-[#050505]">

      {/* ─────────────────────────────────────────
          1. HERO SECTION
      ───────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center pt-32 pb-12 overflow-hidden">
        {/* Background Image Setup */}
        <div className="absolute inset-0 z-0">
          <Image
            src={episode.heroImage}
            alt={episode.title}
            fill
            className="object-cover opacity-40 grayscale"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-transparent to-[#050505]" />
        </div>

        {/* Text Content */}
        <div className="relative z-10 w-full max-w-screen-xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start mt-12 gap-8">
          <div className="max-w-md">
            <h1 className="text-4xl md:text-5xl text-[#ececec] font-light mb-2 font-serif tracking-wide leading-tight">
              {episode.title}
            </h1>
            <p className="text-[#ececec]/60 text-[10px] uppercase tracking-widest mb-4">
              Discover. Shape. Form.
            </p>
            <p className="text-[#ececec]/60 text-[10px] leading-relaxed text-justify whitespace-pre-line">
              {episode.leftBody.split('\n')[0]} {/* Ambil paragraf pertama saja untuk hero */}
            </p>
          </div>
          <div className="text-[#ececec]/60 text-[10px] uppercase tracking-widest flex items-center gap-2">
            Article {episode.no} <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Video Player Placeholder */}
        <div className="relative z-10 mt-16 md:mt-24 w-full max-w-3xl mx-6 aspect-[16/9] md:aspect-[21/9] bg-[#111] border border-[#1f1f1f] rounded-xl overflow-hidden group cursor-pointer shadow-2xl">
          <Image
            src={episode.videoThumb}
            alt="Video Cover"
            fill
            className="object-cover opacity-50 grayscale group-hover:opacity-75 group-hover:grayscale-0 transition-all duration-700"
          />
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

          {/* Header */}
          <div className="mb-12">
            <span className="text-[#111]/60 text-[9px] uppercase tracking-[0.2em] font-bold block mb-2">
              Episode {episode.no.replace('00', '0')}
            </span>
            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
              <h2 className="text-3xl md:text-5xl font-light tracking-[0.15em] font-serif uppercase">
                OPUS ARCANUM
              </h2>
              <span className="text-[#111]/60 text-[9px] uppercase tracking-[0.2em] md:pb-2">
                ARTICLE NO.{episode.no}
              </span>
            </div>
          </div>

          {/* Text Paragraphs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <p className="text-[#111]/80 text-[10px] leading-relaxed font-medium text-justify whitespace-pre-line">
              {episode.leftBody}
            </p>
            <p className="text-[#111]/80 text-[10px] leading-relaxed font-medium text-justify whitespace-pre-line">
              {episode.rightBody}
            </p>
          </div>

          {/* Horizontal Gallery/Carousel */}
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8 items-stretch">
            {episode.galleryImages.map((img, index) => (
              <div key={index} className={`shrink-0 ${index === 0 ? 'w-[280px] md:w-[320px]' : 'w-[240px] md:w-[280px]'} aspect-[4/5] bg-[#050505] rounded-xl relative overflow-hidden snap-center group`}>
                <Image src={img} fill className={`object-cover ${index === 0 ? 'opacity-80 group-hover:opacity-100 transition-opacity' : 'opacity-80'}`} alt={`Gallery Image ${index + 1}`} />
                {index === 0 && (
                  <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-[#333]">
                    <p className="text-[#ececec] text-xs font-serif tracking-widest">+ {episode.title}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-center items-center gap-8 mt-6">
            <button className="text-[#111]/50 hover:text-[#111] transition-colors"><ArrowLeft className="w-5 h-5" /></button>
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-[#111]"></span>
              <span className="w-2 h-2 rounded-full bg-[#111]/30"></span>
              <span className="w-2 h-2 rounded-full bg-[#111]/30"></span>
              <span className="w-2 h-2 rounded-full bg-[#111]/30"></span>
            </div>
            <button className="text-[#111]/50 hover:text-[#111] transition-colors"><ArrowRight className="w-5 h-5" /></button>
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

          {blockData && (
            <>
              {/* Row 1: Image Left, Text Right */}
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
                  <p className="text-[#ececec]/60 text-[10px] leading-relaxed text-justify mb-4">
                    {blockData.body}
                  </p>
                </div>
              </div>

              {/* Row 2: Text Left, Image Right */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                <div className="w-full md:w-1/2 max-w-md md:text-right order-2 md:order-1 flex flex-col items-end ml-auto">
                  <h3 className="text-[#ececec] text-[11px] uppercase tracking-[0.2em] font-bold mb-6">
                    {blockData.caption}
                  </h3>
                  <p className="text-[#ececec]/60 text-[10px] leading-relaxed text-justify md:text-right mb-4">
                    {blockData.bodyRight}
                  </p>
                </div>
                <div className="w-full md:w-1/2 order-1 md:order-2 flex justify-start">
                  <div className="relative w-full max-w-[500px] aspect-[16/10] rounded-xl overflow-hidden border border-[#1f1f1f]">
                    <Image src={blockData.imageRight} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Zigzag Right" />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Video Placeholder */}
          <div className="flex justify-center pt-12">
            <div className="relative w-full max-w-4xl aspect-[21/9] bg-[#111] border border-[#1f1f1f] rounded-xl overflow-hidden group cursor-pointer shadow-2xl">
              <Image
                src={episode.videoThumb}
                alt="Secondary Video Cover"
                fill
                className="object-cover opacity-40 grayscale group-hover:opacity-70 group-hover:grayscale-0 transition-all duration-700"
              />
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
          5. LEARN THE CHANTS
      ───────────────────────────────────────── */}
      <section id="learn-the-chants" className="relative z-20 bg-[#050505] pt-24 pb-24 border-b border-[#1f1f1f]">
        <div className="flex">

          {/* Left Column: Vertical Social Links (Sudah diupdate SVG) */}
          <div className="hidden md:flex flex-col items-center justify-between w-16 shrink-0 border-r border-[#1f1f1f] py-12 px-4">
            <div className="flex flex-col gap-6 items-center text-[#ececec]/60">
              {/* Instagram */}
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              {/* Facebook */}
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.37 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.592 9 4.75V8z" />
                </svg>
              </a>
              {/* Twitter / X */}
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* TikTok */}
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                </svg>
              </a>
            </div>
            <div className="-rotate-90 text-[#ececec]/30 text-[9px] uppercase tracking-[0.25em] whitespace-nowrap select-none mt-24">
              DISCOVER OUR STORIES
            </div>
          </div>

          {/* Right Area: Header Title + Custom Grid Layout */}
          <div className="flex-1 px-6 md:px-12">

            {/* Header Title */}
            <div className="flex justify-end items-end mb-12">
              <div className="text-right">
                <span className="text-[#ececec]/40 text-[9px] uppercase tracking-[0.3em] block mb-1">
                  EPISODE 02
                </span>
                <h2 className="text-2xl md:text-4xl font-light text-[#ececec] tracking-[0.2em] font-serif uppercase">
                  LEARN THE CHANTS
                </h2>
              </div>
            </div>

            {/* Grid Layout 3 Kolom (2 Landscape di Kiri, 2 Portrait di Kanan) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

              {/* Kolom 1: Dua Gambar Landscape Ditumpuk */}
              <div className="flex flex-col gap-6">
                <Link
                  href="/episodes/1"
                  className="relative overflow-hidden rounded-2xl border border-[#1f1f1f]/80 group aspect-[4/3] bg-black/30 block cursor-pointer"
                >
                  <Image
                    src="/images/Rectangle 26.png"
                    alt="Lookbook 1"
                    fill
                    className="object-cover grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors rounded-2xl" />
                </Link>

                <Link
                  href="/episodes/2"
                  className="relative overflow-hidden rounded-2xl border border-[#1f1f1f]/80 group aspect-[4/3] bg-black/30 block cursor-pointer"
                >
                  <Image
                    src="/images/Rectangle 27.png"
                    alt="Lookbook 2"
                    fill
                    className="object-cover grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors rounded-2xl" />
                </Link>
              </div>

              {/* Kolom 2: Gambar Portrait Pertama (Wanita) */}
              <Link
                href="/episodes/3"
                className="relative overflow-hidden rounded-2xl border border-[#1f1f1f]/80 group aspect-[3/4] bg-black/30 block cursor-pointer"
              >
                <Image
                  src="/images/Rectangle 28.png"
                  alt="Lookbook 3"
                  fill
                  className="object-cover grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors rounded-2xl" />
              </Link>

              {/* Kolom 3: Gambar Portrait Kedua (Motor) */}
              <Link
                href="/episodes/4"
                className="relative overflow-hidden rounded-2xl border border-[#1f1f1f]/80 group aspect-[3/4] bg-black/30 block cursor-pointer"
              >
                <Image
                  src="/images/Rectangle 29.png"
                  alt="Lookbook 4"
                  fill
                  className="object-cover grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors rounded-2xl" />
              </Link>

            </div>

          </div>
        </div>
      </section>

    </div>
  );
}