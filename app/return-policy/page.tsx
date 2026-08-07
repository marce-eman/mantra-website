export default function ReturnPolicyPage() {
  return (
    <div className="bg-[#050505] min-h-screen border-t border-[#1f1f1f] py-16">
      <div className="max-w-3xl mx-auto px-4 prose prose-invert">
        <h1 className="text-3xl md:text-5xl font-black text-[#ececec] uppercase tracking-widest mb-12 border-b border-[#1f1f1f] pb-6">
          Returns & Exchanges
        </h1>
        
        <div className="space-y-8 text-[#ececec]/80 text-sm md:text-base leading-relaxed font-mono">
          <section>
            <h2 className="text-xl font-bold text-[#ececec] uppercase tracking-widest mb-4 font-sans">The 14-Day Window</h2>
            <p>
              Items may be returned within 14 days of delivery. The void accepts no delays. 
              Garments must be unworn, unwashed, and in their original structural integrity with all tags attached.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#ececec] uppercase tracking-widest mb-4 font-sans">Initiating a Return</h2>
            <p>
              Contact support@mantra.void with your order number. A return authorization code will be provided. 
              Do not send packages without authorization; they will be rejected and consumed by the void.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#ececec] uppercase tracking-widest mb-4 font-sans">Refunds</h2>
            <p>
              Once your return is inspected and approved, a refund will be processed to your original method of payment within 5-7 business days. Shipping costs are non-refundable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#ececec] uppercase tracking-widest mb-4 font-sans">Exchanges</h2>
            <p>
              We only replace items if they are defective or damaged. If you need a different size, please process a standard return and place a new order.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
