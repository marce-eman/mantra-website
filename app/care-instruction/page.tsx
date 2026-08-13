import Link from "next/link";
import { ArrowLeft, Shirt, Wind, Flame, Ban, ShieldCheck } from "lucide-react";

export default function CareInstructionPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#ececec] pt-24 pb-20 px-6 md:px-12 border-t border-[#1f1f1f]">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Navigation Back */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#ececec]/50 hover:text-white transition-colors font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>

        {/* Header Section */}
        <div className="space-y-4">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#ececec]/50 font-mono block">
            // GARMENT PRESERVATION
          </span>
          <h1 className="text-3xl md:text-5xl font-light tracking-widest uppercase leading-tight">
            CARE INSTRUCTION
          </h1>
          <p className="text-[#ececec]/60 text-xs md:text-sm uppercase tracking-widest max-w-2xl leading-relaxed font-light">
            Maintain the heavyweight feel, boxy silhouette, and print integrity of your MANTRA garments over time.
          </p>
        </div>

        {/* Care Quick Guide Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-5 rounded-2xl space-y-2">
            <Shirt className="w-5 h-5 text-[#ececec]/40" />
            <h2 className="text-xs font-bold uppercase tracking-widest">Cold Wash</h2>
            <p className="text-[11px] text-[#ececec]/50 font-light leading-relaxed">
              Max 30°C. Wash inside out with similar dark tones.
            </p>
          </div>

          <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-5 rounded-2xl space-y-2">
            <Wind className="w-5 h-5 text-[#ececec]/40" />
            <h2 className="text-xs font-bold uppercase tracking-widest">Air Dry Only</h2>
            <p className="text-[11px] text-[#ececec]/50 font-light leading-relaxed">
              Hang dry in shaded area. Never tumble dry.
            </p>
          </div>

          <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-5 rounded-2xl space-y-2">
            <Flame className="w-5 h-5 text-[#ececec]/40" />
            <h2 className="text-xs font-bold uppercase tracking-widest">Low Heat Iron</h2>
            <p className="text-[11px] text-[#ececec]/50 font-light leading-relaxed">
              Iron inside out. Avoid direct contact with prints.
            </p>
          </div>

          <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-5 rounded-2xl space-y-2">
            <Ban className="w-5 h-5 text-[#ececec]/40" />
            <h2 className="text-xs font-bold uppercase tracking-widest">No Bleach</h2>
            <p className="text-[11px] text-[#ececec]/50 font-light leading-relaxed">
              Do not use harsh detergents or chemical bleaches.
            </p>
          </div>
        </div>

        {/* Detailed Instructions */}
        <div className="space-y-10 border-t border-[#1f1f1f] pt-10 text-xs text-[#ececec]/70 font-light tracking-wider leading-relaxed">
          
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-[#ececec]/40 uppercase tracking-widest">
              01 / WASHING TECHNIQUE
            </span>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#ececec]">
              HEAVYWEIGHT COTTON & FLEECE
            </h3>
            <p>
              Always turn garments inside out before washing to protect high-density prints and embroidery. Use mild liquid detergent and set your washing machine to a gentle or cold cycle (30°C / 86°F max). Avoid washing heavy fleece items with abrasive fabrics such as denim or zippers.
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-mono text-[#ececec]/40 uppercase tracking-widest">
              02 / DRYING & SHRINKAGE PREVENTION
            </span>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#ececec]">
              NATURAL DRYING
            </h3>
            <p>
              Heavyweight cottons are susceptible to heat shrinkage. Do not tumble dry under any circumstances. Reshape the garment while damp and lay flat or hang dry in a shaded, well-ventilated area away from direct sunlight to prevent color fading.
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-mono text-[#ececec]/40 uppercase tracking-widest">
              03 / IRONING & PRINT CARE
            </span>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#ececec]">
              STEAM & SILHOUETTE MAINTENANCE
            </h3>
            <p>
              Use a garment steamer for best results. If using a conventional iron, iron inside out on low heat settings. Never place a hot iron directly onto screenprints, high-build graphics, or woven labels to avoid heat damage.
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-mono text-[#ececec]/40 uppercase tracking-widest">
              04 / STORAGE & FOLDING
            </span>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#ececec]">
              MAINTAINING STRUCTURE
            </h3>
            <p>
              Store heavy hoodies and boxy t-shirts folded on flat surfaces rather than thin wire hangers to prevent neckband stretching and shoulder distortion over time.
            </p>
          </div>

        </div>

        {/* Quality Commitment CTA */}
        <div className="p-8 bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest mb-1">CRAFTED TO LAST</h3>
              <p className="text-xs text-[#ececec]/50 font-light">
                Following these care steps guarantees maximum longevity for your MANTRA pieces.
              </p>
            </div>
          </div>
          <Link
            href="/shop"
            className="bg-[#ececec] text-[#050505] px-6 py-3 rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors shrink-0 cursor-pointer"
          >
            Explore Collection
          </Link>
        </div>

      </div>
    </div>
  );
}