import Link from "next/link";
import { ArrowLeft, Truck, Clock, Globe, ShieldAlert } from "lucide-react";

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#ececec] pt-24 pb-20 px-6 md:px-12 border-t border-[#1f1f1f]">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Top Navigation */}
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
            // TERMS & LOGISTICS
          </span>
          <h1 className="text-3xl md:text-5xl font-light tracking-widest uppercase leading-tight">
            SHIPPING POLICY
          </h1>
          <p className="text-[#ececec]/60 text-xs md:text-sm uppercase tracking-widest max-w-2xl leading-relaxed font-light">
            Clear guidelines on processing, delivery timelines, and international transit for MANTRA shipments.
          </p>
        </div>

        {/* Highlight Grid / Quick Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-5 rounded-2xl space-y-2">
            <Clock className="w-5 h-5 text-[#ececec]/40" />
            <h2 className="text-xs font-bold uppercase tracking-widest">Processing Time</h2>
            <p className="text-[11px] text-[#ececec]/50 font-light leading-relaxed">
              1–3 business days prior to dispatch.
            </p>
          </div>

          <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-5 rounded-2xl space-y-2">
            <Truck className="w-5 h-5 text-[#ececec]/40" />
            <h2 className="text-xs font-bold uppercase tracking-widest">Domestic Transit</h2>
            <p className="text-[11px] text-[#ececec]/50 font-light leading-relaxed">
              2–5 business days across Indonesia.
            </p>
          </div>

          <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-5 rounded-2xl space-y-2">
            <Globe className="w-5 h-5 text-[#ececec]/40" />
            <h2 className="text-xs font-bold uppercase tracking-widest">Worldwide Transit</h2>
            <p className="text-[11px] text-[#ececec]/50 font-light leading-relaxed">
              7–14 business days international.
            </p>
          </div>

          <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-5 rounded-2xl space-y-2">
            <ShieldAlert className="w-5 h-5 text-[#ececec]/40" />
            <h2 className="text-xs font-bold uppercase tracking-widest">Insurance</h2>
            <p className="text-[11px] text-[#ececec]/50 font-light leading-relaxed">
              All parcels tracked & fully insured.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-10 border-t border-[#1f1f1f] pt-10 text-xs text-[#ececec]/70 font-light tracking-wider leading-relaxed">
          
          {/* Section 1 */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-[#ececec]/40 uppercase tracking-widest">
              01 / ORDER PROCESSING
            </span>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#ececec]">
              DISPATCH & FULFILLMENT
            </h3>
            <p>
              Orders are verified and processed Monday through Friday, excluding national holidays. Orders placed during drop events or weekends will begin processing on the following business day. Once your order has been dispatched, you will receive an automated email containing your tracking reference.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-[#ececec]/40 uppercase tracking-widest">
              02 / DOMESTIC SHIPPING
            </span>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#ececec]">
              INDONESIA DESTINATIONS
            </h3>
            <p>
              Domestic orders are handled via express courier partners (JNE / J&T / Sicepat). Delivery times range from 1 to 3 business days for major Java urban centers (Bandung, Jakarta, Surabaya) and 3 to 7 business days for outer island destinations.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-[#ececec]/40 uppercase tracking-widest">
              03 / INTERNATIONAL SHIPPING & DUTIES
            </span>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#ececec]">
              GLOBAL TRANSIT & CUSTOMS
            </h3>
            <p>
              We ship worldwide via DHL Express. International shipments may be subject to import duties, taxes, and customs fees imposed by the destination country. These charges are the sole responsibility of the customer and are not included in the checkout price or shipping charge.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-[#ececec]/40 uppercase tracking-widest">
              04 / LOST & DAMAGED PACKAGES
            </span>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#ececec]">
              TRANSIT CLAIMS
            </h3>
            <p>
              MANTRA is not liable for packages lost or stolen after verified delivery by the carrier. If your shipment arrives damaged, please retain all packaging materials and photograph the damage immediately before contacting our support team within 48 hours of receipt.
            </p>
          </div>

        </div>

        {/* Contact Support CTA */}
        <div className="p-8 bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-1">HAVING ISSUES WITH A SHIPMENT?</h3>
            <p className="text-xs text-[#ececec]/50 font-light">Reach out to our support team with your order ID.</p>
        </div>
        <a
            href="https://wa.me/6281234567890?text=Halo%20Admin%20MANTRA,%20saya%20butuh%20bantuan%20mengenai%20pengiriman."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#ececec] text-[#050505] px-6 py-3 rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors shrink-0 cursor-pointer"
        >
            Contact via WhatsApp
        </a>
        </div>

      </div>
    </div>
  );
}