"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime({ h: now.getHours() % 12, m: now.getMinutes(), s: now.getSeconds() });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const hourDeg   = (time.h / 12) * 360 + (time.m / 60) * 30;
  const minuteDeg = (time.m / 60) * 360 + (time.s / 60) * 6;
  const secondDeg = (time.s / 60) * 360;

  const TickerRow = ({ reverse = false }) => (
    <div className={`flex whitespace-nowrap border-${reverse ? "t" : "b"} border-[#1f1f1f] py-2 overflow-hidden`}>
      <div className={`${reverse ? "animate-marquee-reverse" : "animate-marquee"} flex space-x-10 text-[#ececec]/20 text-[10px] uppercase tracking-widest font-mono`}>
        {Array.from({ length: 16 }).map((_, i) => (
          <span key={i} className="flex items-center gap-6 shrink-0">
            <span>MANTRA</span>
            <span className="w-1 h-1 rounded-full bg-current" />
            <span>OPEN ONLY ON FRIDAYS</span>
            <span className="w-1 h-1 rounded-full bg-current" />
            <Image src="/images/ICON CHROME 1.png" alt="" width={10} height={10} className="object-contain opacity-40 shrink-0" />
          </span>
        ))}
      </div>
    </div>
  );

  return (
    // Fixed overlay — covers the inherited root layout Navbar + Footer
    <div className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center overflow-hidden">

      {/* Top ticker */}
      <div className="absolute top-0 left-0 w-full z-10">
        <TickerRow />
        <TickerRow reverse />
      </div>

      {/* Bottom ticker */}
      <div className="absolute bottom-0 left-0 w-full z-10">
        <TickerRow reverse />
        <TickerRow />
      </div>

      {/* Clock — dead center */}
      <div className="relative z-20 flex items-center justify-center w-[88vw] max-w-[680px] aspect-square">
        {/* Clock image */}
        <Image
          src="/images/Jam Mantra.png"
          alt="Mantra Clock"
          fill
          className="object-contain"
          priority
        />

        {/* Live clock hands */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Hour */}
          <div
            className="absolute bottom-1/2 left-1/2 origin-bottom"
            style={{
              width: 4, height: "21%", marginLeft: -2,
              background: "linear-gradient(to top,#c0c0c0,#909090)",
              borderRadius: "2px 2px 0 0",
              transform: `rotate(${hourDeg}deg)`,
              transition: "transform 0.5s ease",
            }}
          />
          {/* Minute */}
          <div
            className="absolute bottom-1/2 left-1/2 origin-bottom"
            style={{
              width: 3, height: "30%", marginLeft: -1.5,
              background: "linear-gradient(to top,#d0d0d0,#aaa)",
              borderRadius: "2px 2px 0 0",
              transform: `rotate(${minuteDeg}deg)`,
              transition: "transform 0.5s ease",
            }}
          />
          {/* Second */}
          <div
            className="absolute bottom-1/2 left-1/2 origin-bottom"
            style={{
              width: 1.5, height: "36%", marginLeft: -0.75,
              background: "#e0e0e0",
              borderRadius: "1px 1px 0 0",
              transform: `rotate(${secondDeg}deg)`,
              transition: "transform 0.2s ease",
            }}
          />
          {/* Center pivot */}
          <div className="absolute w-3 h-3 rounded-full bg-[#c0c0c0] shadow-lg z-10" />
        </div>

        {/* "OPEN ONLY ON FRIDAYS" inside clock face */}
        <div className="absolute bottom-[28%] left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center">
          <p className="text-[#ececec]/70 text-[11px] sm:text-sm uppercase tracking-[0.25em] whitespace-nowrap font-light">
            OPEN ONLY <strong className="font-bold text-[#ececec]">ON FRIDAYS</strong>
          </p>
        </div>
      </div>

      {/* Return link */}
      <div className="relative z-20 mt-10">
        <Link
          href="/"
          className="text-[#ececec]/30 hover:text-[#ececec] text-[10px] uppercase tracking-widest transition-colors border border-[#1f1f1f] hover:border-[#ececec]/30 px-8 py-3"
        >
          Return to the void
        </Link>
      </div>
    </div>
  );
}
