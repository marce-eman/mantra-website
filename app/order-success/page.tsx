"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrderSuccessPage() {
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-2xl text-center border border-[#1f1f1f] bg-[#050505] p-10 md:p-16 relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ececec] to-transparent opacity-20" />
        <div className="absolute top-4 right-4 text-[#ececec]/20 text-[10px] font-mono">STATUS: CONFIRMED</div>
        
        <div className="mb-10">
          <h1 className="text-3xl md:text-5xl font-black text-[#ececec] uppercase tracking-widest mb-4">
            Order Secured
          </h1>
          <p className="text-[#ececec]/60 text-sm uppercase tracking-widest">
            Your journey into the void has begun.
          </p>
        </div>

        <div className="border border-[#1f1f1f] p-6 mb-10 bg-[#0a0a0a]">
          <p className="text-[#ececec]/60 text-xs uppercase tracking-widest mb-2">Order Reference</p>
          <p className="text-2xl text-[#ececec] font-mono font-bold tracking-widest mb-6">#MNTR-{Math.floor(100000 + Math.random() * 900000)}</p>
          
          <div className="border-t border-[#1f1f1f] pt-6">
            <p className="text-[#ececec]/60 text-xs uppercase tracking-widest mb-4">Please complete your payment within</p>
            <p className="text-4xl text-red-500 font-mono font-bold animate-pulse">
              {formatTime(timeLeft)}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
          <Link 
            href="/account/orders" 
            className="border border-[#1f1f1f] text-[#ececec] px-8 py-4 uppercase tracking-widest text-xs font-bold hover:bg-[#1f1f1f] transition-colors"
          >
            Track Order
          </Link>
          <Link 
            href="/shop" 
            className="bg-[#ececec] text-[#050505] px-8 py-4 uppercase tracking-widest text-xs font-bold hover:bg-white transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
        
      </div>
    </div>
  );
}
