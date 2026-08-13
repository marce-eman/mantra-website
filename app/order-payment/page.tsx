import Link from "next/link";
import { auth } from "@/auth";
import { ArrowLeft, CreditCard, ShieldCheck, RefreshCw, ShoppingBag, ArrowRight } from "lucide-react";

export default async function OrderPaymentPolicyPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[#050505] text-[#ececec] pt-24 pb-20 px-6 md:px-12 border-t border-[#1f1f1f]">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Navigation */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#ececec]/50 hover:text-white transition-colors font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-4">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#ececec]/50 font-mono block">
            // GUIDE & TERMS
          </span>
          <h1 className="text-3xl md:text-5xl font-light tracking-widest uppercase leading-tight">
            ORDER & PAYMENT
          </h1>
          <p className="text-[#ececec]/60 text-xs md:text-sm uppercase tracking-widest max-w-2xl leading-relaxed font-light">
            Guidelines on placing orders, accepted payment methods, and tracking order statuses.
          </p>
        </div>

        {/* Dynamic Banner Action (Cek Login Status) */}
        <div className="p-6 bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest">
                {session?.user ? "LOOKING FOR YOUR ORDERS?" : "TRACK AN EXISTING ORDER?"}
              </h3>
              <p className="text-[11px] text-[#ececec]/50 font-light">
                {session?.user
                  ? "View your active orders, payment status, and shipping history."
                  : "Sign in to access your personal dashboard and purchase history."}
              </p>
            </div>
          </div>
          <Link
            href={session?.user ? "/account/orders" : "/login?redirect=/account/orders"}
            className="bg-[#ececec] text-[#050505] px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors shrink-0 flex items-center gap-2 cursor-pointer"
          >
            {session?.user ? "View My Orders" : "Login to Check Orders"} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#111111] border border-[#1f1f1f] p-5 rounded-2xl space-y-2">
            <CreditCard className="w-5 h-5 text-[#ececec]/40" />
            <h2 className="text-xs font-bold uppercase tracking-widest">ACCEPTED PAYMENTS</h2>
            <p className="text-[11px] text-[#ececec]/50 font-light leading-relaxed">
              Bank Transfer (BCA/Mandiri) & Instant QRIS for seamless checkout.
            </p>
          </div>

          <div className="bg-[#111111] border border-[#1f1f1f] p-5 rounded-2xl space-y-2">
            <ShieldCheck className="w-5 h-5 text-[#ececec]/40" />
            <h2 className="text-xs font-bold uppercase tracking-widest">VERIFICATION</h2>
            <p className="text-[11px] text-[#ececec]/50 font-light leading-relaxed">
              Automatic payment verification via Midtrans / Manual confirmation within 1 hour.
            </p>
          </div>

          <div className="bg-[#111111] border border-[#1f1f1f] p-5 rounded-2xl space-y-2">
            <RefreshCw className="w-5 h-5 text-[#ececec]/40" />
            <h2 className="text-xs font-bold uppercase tracking-widest">ORDER MODIFICATION</h2>
            <p className="text-[11px] text-[#ececec]/50 font-light leading-relaxed">
              Orders cannot be modified once payment is verified and handed to the courier.
            </p>
          </div>
        </div>

        {/* Detailed Guidelines */}
        <div className="space-y-10 border-t border-[#1f1f1f] pt-10 text-xs text-[#ececec]/70 font-light tracking-wider leading-relaxed">
          
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-[#ececec]/40 uppercase tracking-widest">
              01 / ORDERING PROCESS
            </span>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#ececec]">
              HOW TO PLACE AN ORDER
            </h3>
            <p>
              Select your desired piece, choose the size/color variation, and add it to your cart. Proceed to checkout, enter your shipping destination, and select your preferred payment method. Items are locked only after checkout is initiated.
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-mono text-[#ececec]/40 uppercase tracking-widest">
              02 / PAYMENT TIME LIMIT
            </span>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#ececec]">
              PAYMENT EXPIRATION
            </h3>
            <p>
              Manual bank transfers and QRIS codes remain active for 24 hours. Unpaid orders will be automatically canceled by the system to release stock back to the catalogue.
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-mono text-[#ececec]/40 uppercase tracking-widest">
              03 / ORDER STATUS MEANINGS
            </span>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#ececec]">
              UNDERSTANDING STATUSES
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-[#ececec]/60">
              <li><strong className="text-[#ececec]">PENDING:</strong> Order created, awaiting payment confirmation.</li>
              <li><strong className="text-[#ececec]">PAID / PROCESSING:</strong> Payment received; item is being packed and prepared for shipping.</li>
              <li><strong className="text-[#ececec]">SHIPPED:</strong> Package handed to courier; tracking number assigned.</li>
              <li><strong className="text-[#ececec]">CANCELLED:</strong> Expiry time exceeded or manually voided.</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}