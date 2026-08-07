export default function FaqPage() {
  return (
    <div className="bg-[#050505] min-h-screen border-t border-[#1f1f1f] py-16">
      <div className="max-w-3xl mx-auto px-4 prose prose-invert">
        <h1 className="text-3xl md:text-5xl font-black text-[#ececec] uppercase tracking-widest mb-12 border-b border-[#1f1f1f] pb-6">
          Frequently Asked Questions
        </h1>
        
        <div className="space-y-8">
          <div className="border border-[#1f1f1f] p-6 bg-[#0a0a0a]">
            <h3 className="text-[#ececec] uppercase tracking-widest font-bold text-sm mb-4">When will my order ship?</h3>
            <p className="text-[#ececec]/60 text-sm leading-relaxed font-mono">
              Orders are processed within 24-48 hours. Shipping takes 2-3 business days depending on your sector.
            </p>
          </div>

          <div className="border border-[#1f1f1f] p-6 bg-[#0a0a0a]">
            <h3 className="text-[#ececec] uppercase tracking-widest font-bold text-sm mb-4">How does the sizing work?</h3>
            <p className="text-[#ececec]/60 text-sm leading-relaxed font-mono">
              Most of our garments feature an oversized, brutalist cut. We recommend taking your true size for the intended fit, or sizing down for a standard fit.
            </p>
          </div>

          <div className="border border-[#1f1f1f] p-6 bg-[#0a0a0a]">
            <h3 className="text-[#ececec] uppercase tracking-widest font-bold text-sm mb-4">Do you ship internationally?</h3>
            <p className="text-[#ececec]/60 text-sm leading-relaxed font-mono">
              Currently, MANTRA operates exclusively within Indonesia. International expansion is pending.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
