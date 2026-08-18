"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, LogIn } from "lucide-react";

// === PINDAHKAN BANNER KE LUAR SINI ===
// Agar komponen ini independen dan animasinya tidak ke-reset oleh timer jam
const Banner = () => (
  <div className="border-y border-[#1f1f1f] bg-[#0a0a0a] py-3 overflow-hidden w-full">
    <div className="flex whitespace-nowrap animate-marquee-slow">
      {Array.from({ length: 12 }).map((_, i) => (
        <span key={i} className="flex items-center space-x-8 mx-6 text-[#ececec]/30 text-[10px] uppercase tracking-[0.3em] font-mono shrink-0">
          <span>MANTRA</span>
          <span className="w-1 h-1 rounded-full bg-current inline-block" />
          <Image src="/images/ICON CHROME 1.png" alt="icon" width={10} height={10} className="object-contain opacity-50 shrink-0" />
          <span className="w-1 h-1 rounded-full bg-current inline-block" />
        </span>
      ))}
    </div>
  </div>
);

export default function NotFound() {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0, ms: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateClock = () => {
      const now = new Date();
      setTime({ h: now.getHours() % 12, m: now.getMinutes(), s: now.getSeconds(), ms: now.getMilliseconds() });
    };
    updateClock();
    
    // Timer berjalan setiap 50ms untuk pergerakan jarum yang halus
    const interval = setInterval(updateClock, 50);
    return () => clearInterval(interval);
  }, []);

  const hourDeg = time.h * 30 + time.m * 0.5 + time.s * (0.5 / 60) + 40;
  const minuteDeg = time.m * 6 + time.s * 0.1 + time.ms * 0.0001 - 40;
  const secondDeg = time.s * 6 + time.ms * 0.006;

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050505] overflow-hidden">
      
      {/* Banner Atas */}
      <div className="absolute top-0 left-0 w-full z-10"><Banner /></div>

      {/* Banner Bawah */}
      <div className="absolute bottom-0 left-0 w-full z-10"><Banner /></div>

      {/* JAM UTAMA */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75vw] max-w-[480px] aspect-square z-20">
        <Image src="/images/Bacground-jam1.png" alt="Mantra Clock" fill priority sizes="(max-width: 640px) 75vw, 480px" className="object-contain drop-shadow-2xl" />

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{ transform: `rotate(${hourDeg}deg)`, transformOrigin: "50% 50%" }}>
            <img src="/images/hour-hand.png" alt="Hour" draggable={false} className="absolute top-1/2 left-1/2 h-[22%] w-auto max-w-none select-none drop-shadow-md" style={{ transform: "translate(-82.5%, -83%)" }} />
          </div>
          <div className="absolute inset-0" style={{ transform: `rotate(${minuteDeg}deg)`, transformOrigin: "50% 50%" }}>
            <img src="/images/minute-hand.png" alt="Minute" draggable={false} className="absolute top-1/2 left-1/2 h-[32%] w-auto max-w-none select-none drop-shadow-lg" style={{ transform: "translate(-9.5%, -89.5%)" }} />
          </div>
          <div className="absolute inset-0" style={{ transform: `rotate(${secondDeg}deg)`, transformOrigin: "50% 50%" }}>
            <div className="absolute top-1/2 left-1/2 w-[2px] h-[38%] bg-gradient-to-t from-[#888888] via-[#dddddd] to-[#ffffff] rounded-t-sm" style={{ transform: "translate(-50%, -100%)" }} />
          </div>
          <div className="absolute top-1/2 left-1/2 h-[7%] aspect-square z-50" style={{ transform: "translate(-50%, -50%)" }}>
            <img src="/images/center-cap.png" alt="Center Pivot" draggable={false} className="w-full h-full object-contain select-none drop-shadow-xl" />
          </div>
        </div>

        <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2 z-30 pointer-events-none text-center">
          <p className="text-[#ececec]/70 text-[11px] sm:text-xs uppercase tracking-[0.25em] whitespace-nowrap font-light drop-shadow-lg">
            OPEN ONLY <strong className="font-bold text-[#ececec]">ON FRIDAYS</strong>
          </p>
        </div>
      </div>

      <div className="absolute bottom-[10vh] left-1/2 -translate-x-1/2 z-30 grid grid-cols-1 sm:grid-cols-2 gap-3 w-max max-w-[90vw]">
        
        <Link 
          href="/login?redirect=/account/orders" 
          className="flex items-center justify-center gap-2 text-[#ececec]/70 hover:text-white text-[10px] uppercase tracking-widest transition-all border border-[#1f1f1f] bg-[#0a0a0a] hover:bg-[#111111] hover:border-[#ececec]/40 px-6 py-3 rounded-xl whitespace-nowrap"
        >
          <LogIn className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Access My Orders</span>
        </Link>
        
        <Link 
          href="/track" 
          className="flex items-center justify-center gap-2 text-[#ececec]/70 hover:text-white text-[10px] uppercase tracking-widest transition-all border border-[#1f1f1f] bg-[#0a0a0a] hover:bg-[#111111] hover:border-[#ececec]/40 px-6 py-3 rounded-xl whitespace-nowrap"
        >
          <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span>Track Parcel</span>
        </Link>

      </div>

    </div>
  );
}