import Link from "next/link";
import { ArrowLeft, RotateCcw, ShieldCheck, Clock, PackageX, ArrowRight } from "lucide-react";

export default function ReturnPolicyPage() {
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
            // POLICY & GUARANTEE
          </span>
          <h1 className="text-3xl md:text-5xl font-light tracking-widest uppercase leading-tight">
            RETURNS & EXCHANGES
          </h1>
          <p className="text-[#ececec]/60 text-xs md:text-sm uppercase tracking-widest max-w-2xl leading-relaxed font-light">
            Clear terms regarding item returns, size exchange eligibility, and refund procedures.
          </p>
        </div>

        {/* Quick Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-5 rounded-2xl space-y-2">
            <Clock className="w-5 h-5 text-[#ececec]/40" />
            <h2 className="text-xs font-bold uppercase tracking-widest">14-Day Window</h2>
            <p className="text-[11px] text-[#ececec]/50 font-light leading-relaxed">
              Returns must be initiated within 14 days of delivery.
            </p>
          </div>

          <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-5 rounded-2xl space-y-2">
            <ShieldCheck className="w-5 h-5 text-[#ececec]/40" />
            <h2 className="text-xs font-bold uppercase tracking-widest">Original Condition</h2>
            <p className="text-[11px] text-[#ececec]/50 font-light leading-relaxed">
              Unworn, unwashed, with all original tags attached.
            </p>
          </div>

          <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-5 rounded-2xl space-y-2">
            <RotateCcw className="w-5 h-5 text-[#ececec]/40" />
            <h2 className="text-xs font-bold uppercase tracking-widest">5–7 Day Refunds</h2>
            <p className="text-[11px] text-[#ececec]/50 font-light leading-relaxed">
              Processed to original payment method upon inspection.
            </p>
          </div>

          <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-5 rounded-2xl space-y-2">
            <PackageX className="w-5 h-5 text-[#ececec]/40" />
            <h2 className="text-xs font-bold uppercase tracking-widest">Defect Guarantee</h2>
            <p className="text-[11px] text-[#ececec]/50 font-light leading-relaxed">
              Immediate replacement for damaged or incorrect pieces.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-10 border-t border-[#1f1f1f] pt-10 text-xs text-[#ececec]/70 font-light tracking-wider leading-relaxed">
          
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-[#ececec]/40 uppercase tracking-widest">
              01 / ELIGIBILITY & CONDITIONS
            </span>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#ececec]">
              THE 14-DAY RETURN WINDOW
            </h3>
            <p>
              Items may be returned within 14 calendar days from the date of package arrival. To be eligible for a return, garments must remain unworn, unwashed, free of scent, and preserved in their original structural integrity with all MANTRA tags attached.
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-mono text-[#ececec]/40 uppercase tracking-widest">
              02 / RETURN AUTHORIZATION
            </span>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#ececec]">
              INITIATING A RETURN
            </h3>
            <p>
              Contact support before shipping any package back to us. Unsolicited returns sent without prior authorization code will be rejected. Return shipping costs are the responsibility of the customer unless the return is due to a garment defect or fulfillment error.
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-mono text-[#ececec]/40 uppercase tracking-widest">
              03 / REFUNDS & INSPECTION
            </span>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#ececec]">
              PROCESSING TIMELINES
            </h3>
            <p>
              Once your returned item is received and inspected by our warehouse team, an approval notification will be issued. Approved refunds will be credited back to your original payment method within 5 to 7 business days. Initial shipping fees are non-refundable.
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-mono text-[#ececec]/40 uppercase tracking-widest">
              04 / DEFECTS & SIZE EXCHANGES
            </span>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#ececec]">
              REPLACEMENTS & LIMITED EDITIONS
            </h3>
            <p>
              We replace items if they arrive defective, damaged, or incorrect. Because MANTRA releases are strictly limited by Episode, size exchanges are subject to current inventory availability. If your requested size is out of stock, a store credit or full refund will be processed.
            </p>
          </div>

        </div>

        {/* Contact Support CTA */}
        <div className="p-8 bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-1">NEED TO START A RETURN?</h3>
            <p className="text-xs text-[#ececec]/50 font-light">Reach out to our customer care team with your order ID.</p>
          </div>
          <a
            href="https://wa.me/6281234567890?text=Halo%20Admin%20MANTRA,%20saya%20ingin%20mengajukan%20pengembalian%20produk."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#ececec] text-[#050505] px-6 py-3 rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors shrink-0 flex items-center gap-2 cursor-pointer"
          >
            Contact Support <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
}