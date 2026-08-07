"use client"; // 1. Tambahkan ini di baris pertama

import { useRef } from "react"; // 2. Import useRef
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/data/products";

export default function Home() {
  // 3. Setup referensi untuk menangkap elemen carousel
  const carouselRef = useRef<HTMLDivElement>(null);

  // 4. Fungsi untuk menggeser carousel ke kiri/kanan
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const episodeItems = [
    { id: 1, image: "/images/Group 351.png", title: "Fluere Nabulam" },
    { id: 2, image: "/images/Group 361.png", title: "Nocturne Cargo" },
    { id: 3, image: "/images/Group 37-1.png", title: "Void Heavyweight" },
    { id: 4, image: "/images/Group 381.jpeg", title: "Arcanum Jacket" },
  ];

  return (
    <div className="flex flex-col min-h-screen">

      {/* ─────────────────────────────────────────
          1. HERO SECTION — Eye + Clock + Text
      ───────────────────────────────────────── */}
      <section className="relative h-screen w-full flex items-center justify-center bg-[#050505] overflow-hidden">

        {/* Layer 1: Eye Background */}
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <Image
            src="/images/pexels-wendelmoretti-1925630(background mata untuk jam).png"
            alt="Mantra Eye Background"
            fill
            className="object-cover object-[center_17%] scale-100 grayscale opacity-100 brightness-100"
            priority
          />
        </div>

        {/* Layer 2: Clock */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
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

        {/* Layer 3: Text */}
        <div className="relative z-20 text-center flex flex-col items-center max-w-[400px] px-4">

          {/* Logo Wordmark */}
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
            quis consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
            Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur,
            adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore
            magnam aliquam voluptatem.
          </p>

          <Link
            className="border border-[#4a4a4a] bg-[#050505]/70 backdrop-blur-md text-[#ececec] px-6 py-2 uppercase tracking-[0.2em] text-[7px] font-bold hover:bg-white hover:text-black transition-all duration-300 rounded-full flex items-center gap-2"
            href="/#collection"
          >
            Learn More <ArrowRight className="w-2.5 h-2.5" />
          </Link>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          2. SCROLLING MARQUEE DIVIDER
      ───────────────────────────────────────── */}
      <div className="border-y border-[#1f1f1f] bg-[#0a0a0a] py-3 overflow-hidden">
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
          3. OPUS ARCANUM — Episodes Carousel 
      ───────────────────────────────────────── */}
      <section id="collection" className="relative z-20 pt-24 pb-16 bg-transparent overflow-hidden">
        {/* Header */}
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left: Title + body text */}
            <div className="md:col-span-7">
              <span className="text-[#ececec]/50 text-[10px] uppercase tracking-widest block mb-3">Episode 01</span>
              <h2 className="text-3xl md:text-5xl font-light text-[#ececec] tracking-[0.15em] mb-6 leading-none">
                OPUS<br />ARCANUM
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <p className="text-[#ececec]/60 text-xs leading-relaxed">
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur.
                </p>
                <p className="text-[#ececec]/60 text-xs leading-relaxed">
                  Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.
                </p>
              </div>
            </div>

            {/* Right: Video / Performance thumbnail */}
            <div className="md:col-span-5 flex justify-end">
              <div className="relative w-full max-w-[340px] aspect-[16/10] bg-black/60 backdrop-blur-md border border-[#1f1f1f]/80 rounded-2xl overflow-hidden group cursor-pointer shadow-2xl">
                <Image
                  src="/images/ARTICLES STORIES.png"
                  alt="Episode Preview"
                  fill
                  className="object-cover opacity-75 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full border border-[#ececec]/50 flex items-center justify-center backdrop-blur-md bg-black/40">
                    <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-[#ececec] border-b-[8px] border-b-transparent ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Carousel */}
        <div className="relative w-full">
          {/* Left Arrow */}
          <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20">
            <button
              onClick={() => scrollCarousel('left')}
              className="w-10 h-10 border border-[#1f1f1f] bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-[#ececec]/60 hover:text-white hover:bg-[#1f1f1f] transition-all"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </div>
          {/* Right Arrow */}
          <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20">
            <button
              onClick={() => scrollCarousel('right')}
              className="w-10 h-10 border border-[#1f1f1f] bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-[#ececec]/60 hover:text-white hover:bg-[#1f1f1f] transition-all"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div
            ref={carouselRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pl-16 pr-16 md:pl-24 md:pr-24 space-x-6 pb-8 items-stretch"
          >
            {episodeItems.map((item) => (
              <div key={item.id} className="shrink-0 flex items-center gap-4 snap-center group">
                {/* Rotated label */}
                <div className="hidden md:flex -rotate-90 text-[#ececec]/30 text-[9px] uppercase tracking-widest whitespace-nowrap select-none">
                  Article NO.00{item.id}
                </div>

                {/* Card - Transparan tanpa kotak solid */}
                <Link
                  href={`/episodes/${item.id}`}
                  className="relative w-[260px] h-[360px] md:w-[340px] md:h-[460px] rounded-2xl border border-transparent hover:border-[#1f1f1f] bg-transparent overflow-hidden block transition-all duration-500 hover:-translate-y-3"
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover p-2 transition-all duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0 rounded-2xl"
                  />

                  {/* Glass hover overlay */}
                  <div className="absolute bottom-8 left-4 right-4 translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 z-20">
                    <div className="bg-black/80 backdrop-blur-md border border-[#1f1f1f] p-5 rounded-xl shadow-xl">
                      <p className="text-[#ececec]/60 text-[9px] uppercase tracking-widest mb-1">
                        <span className="text-[#ececec] font-bold mr-1">+</span>
                        Fluere Nabulam
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

      <div className="border-y border-[#1f1f1f] bg-[#0a0a0a] py-3 overflow-hidden">
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
          4. EDITORIAL — LEARN THE CHANTS
      ───────────────────────────────────────── */}
      <section id="learn-the-chants" className="relative z-20 bg-transparent pt-16 pb-24 border-b border-[#1f1f1f]">

        <div className="flex">
          {/* Left Column: Vertical Social Links */}
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