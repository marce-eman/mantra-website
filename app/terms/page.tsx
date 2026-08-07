export default function TermsPage() {
  return (
    <div className="bg-[#050505] min-h-screen border-t border-[#1f1f1f] py-16">
      <div className="max-w-3xl mx-auto px-4 prose prose-invert">
        <h1 className="text-3xl md:text-5xl font-black text-[#ececec] uppercase tracking-widest mb-12 border-b border-[#1f1f1f] pb-6">
          Terms of Service
        </h1>
        
        <div className="space-y-8 text-[#ececec]/80 text-sm leading-relaxed font-mono">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <section>
            <h2 className="text-xl font-bold text-[#ececec] uppercase tracking-widest mb-4 font-sans">1. Agreement to Terms</h2>
            <p>
              By accessing this website, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#ececec] uppercase tracking-widest mb-4 font-sans">2. Intellectual Property</h2>
            <p>
              The design, architecture, and all content on this site (MANTRA) are the exclusive property of the creator. Unauthorized reproduction is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#ececec] uppercase tracking-widest mb-4 font-sans">3. Products and Services</h2>
            <p>
              We reserve the right to limit the sales of our products or Services to any person, geographic region or jurisdiction. We may exercise this right on a case-by-case basis.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
