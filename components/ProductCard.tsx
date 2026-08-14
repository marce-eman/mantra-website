"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ item }: { item: any }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const images = item.images && item.images.length > 0 ? item.images : ["/images/placeholder.jpg"];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHovered && images.length > 1) {
      interval = setInterval(() => {
        setCurrentIdx((prev) => (prev + 1) % images.length);
      }, 1000); 
    } else {
      setCurrentIdx(0); 
    }
    return () => clearInterval(interval);
  }, [isHovered, images.length]);

  return (
    <Link
      href={`/shop/${item.slug}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-[#111111] border border-[#1f1f1f] rounded-2xl overflow-hidden hover:border-[#ececec]/50 transition-all duration-300 flex flex-col relative"
    >
      {item.stock === 0 && (
        <div className="absolute top-4 right-4 bg-red-950/80 backdrop-blur text-red-400 text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-full border border-red-900/50 z-20">
          Sold Out
        </div>
      )}

      <div className="relative aspect-square w-full bg-[#181818] overflow-hidden">
        <Image
          src={images[currentIdx]}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {isHovered && images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
            {images.map((_: string, idx: number) => (
              <div 
                key={idx} 
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentIdx ? "bg-white scale-125" : "bg-white/40"}`} 
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow justify-between relative z-10 bg-[#111111]">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-wider text-[#ececec] mb-2 group-hover:text-white transition-colors">
            {item.name}
          </h2>
          <p className="text-[#ececec]/50 text-xs line-clamp-2 mb-4 font-light">
            {item.description}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-[#1f1f1f] pt-4 mt-auto">
          
          {/* HARGA PRODUK DIUBAH KE USD */}
          <span className="text-sm font-bold text-emerald-400 font-mono">
            ${item.price.toFixed(2)} USD
          </span>
          
          <span className="text-[10px] uppercase tracking-widest text-[#ececec]/60 bg-[#181818] px-3 py-1.5 rounded-lg border border-[#2a2a2a]">
            View Detail
          </span>
        </div>
      </div>
    </Link>
  );
}