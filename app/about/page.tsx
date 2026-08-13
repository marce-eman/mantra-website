import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#ececec] pt-24 pb-20 px-6 md:px-12 border-t border-[#1f1f1f]">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header Text Section (Sesuai image_6d7e84.png) */}
        <div className="space-y-4">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#ececec]/50 font-mono block">
            // MANIFESTO & IDENTITY
          </span>
          <h1 className="text-3xl md:text-6xl font-light tracking-widest uppercase leading-tight">
            ABOUT MANTRA
          </h1>
          <p className="text-[#ececec]/60 text-xs md:text-sm uppercase tracking-widest max-w-2xl leading-relaxed font-light">
            Crafted for the modern brutalist. A manifestation of shadows, structure, and industrial aesthetics.
          </p>
        </div>

        {/* Container Kartu Gambar Mata + Jam Presisi di Bola Mata */}
        <div className="relative aspect-[16/9] md:aspect-[21/9] w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl overflow-hidden flex items-center justify-center">
          
          {/* Layer 1: Gambar Mata */}
            <Image
                src="/images/pexels-wendelmoretti-1925630(background mata untuk jam).png"
                alt="Mantra Eye"
                fill
                className="object-cover object-[center_25%] grayscale opacity-80 "
                priority
                />

          {/* Layer 2: Jam (MASK) Presisi di Tengah Bola Mata */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-[55%] sm:w-[40%] md:w-[32%] aspect-square">
              <Image
                src="/images/MASK.png"
                alt="Mantra Clock Overlay"
                fill
                className="object-contain mix-blend-screen opacity-45 contrast-125 scale-250 translate-y-10"
                priority
              />
            </div>
          </div>

          {/* Gradient Overlay Lembut di Bawah */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/50 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-xs text-[#ececec]/70 leading-relaxed font-light tracking-wider pt-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#ececec]">
              THE ARCHITECTURE OF SILENCE
            </h3>
            <p>
              MANTRA was born out of a desire to break away from conventional streetwear narratives. We build garments not just as apparel, but as wearable structures designed to navigate raw urban spaces.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#ececec]">
              OPUS ARCANUM
            </h3>
            <p>
              Every release is treated as a distinct episode—limited in quantity, precise in silhouette, and brutal in execution. Heavyweight fabrics, custom cuts, and monochromatic depth define everything we produce.
            </p>
          </div>
        </div>

        {/* Values / Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-y border-[#1f1f1f] py-10">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#ececec]/40 uppercase tracking-widest">01 / HEAVYWEIGHT</span>
            <h4 className="text-xs font-bold uppercase tracking-widest">PREMIUM FABRICS</h4>
            <p className="text-[11px] text-[#ececec]/50 font-light">Custom heavyweight cotton fleece and high-density weaves built for longevity.</p>
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#ececec]/40 uppercase tracking-widest">02 / SILHOUETTE</span>
            <h4 className="text-xs font-bold uppercase tracking-widest">BOXY & OVERSIZED</h4>
            <p className="text-[11px] text-[#ececec]/50 font-light">Engineered drop-shoulder fits tailored to maintain rigid structure.</p>
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#ececec]/40 uppercase tracking-widest">03 / EXCLUSIVITY</span>
            <h4 className="text-xs font-bold uppercase tracking-widest">LIMITED EPISODES</h4>
            <p className="text-[11px] text-[#ececec]/50 font-light">No mass production. Every drop is strictly limited and non-repeatable.</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-8 bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl gap-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-1">DISCOVER THE CATALOGUE</h3>
            <p className="text-xs text-[#ececec]/50 font-light">Explore our latest streetwear drops and pieces.</p>
          </div>
          <Link
            href="/shop"
            className="bg-[#ececec] text-[#050505] px-6 py-3 rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
          >
            Explore Catalogue <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}