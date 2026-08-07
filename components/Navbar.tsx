"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function Navbar() {
  const [activeTab, setActiveTab] = useState("home");
  const isManualScrolling = useRef(false); // Pengunci agar scroll listener tidak bentrok saat diklik
  const { items, openDrawer } = useCartStore();
  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      // Jika sedang proses klik dan scroll otomatis, abaikan scroll listener sementara
      if (isManualScrolling.current) return;

      const scrollPosition = window.scrollY;
      const collectionSection = document.getElementById("collection");
      const chantsSection = document.getElementById("learn-the-chants");

      const chantsTop = chantsSection ? chantsSection.offsetTop - 200 : Infinity;
      const collectionTop = collectionSection ? collectionSection.offsetTop - 200 : Infinity;

      if (scrollPosition >= chantsTop) {
        setActiveTab("episodes");
      } else if (scrollPosition >= collectionTop) {
        setActiveTab("collection");
      } else {
        setActiveTab("home");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    isManualScrolling.current = true; // Kunci scroll listener

    // Buka kembali kuncinya setelah animasi scroll selesai (1 detik)
    setTimeout(() => {
      isManualScrolling.current = false;
    }, 1000);
  };

  // Style stabil tanpa font-bold agar tidak terjadi layout shift/glitch
  const activeStyle = "px-5 py-1.5 border border-[#1f1f1f] rounded-full text-xs uppercase tracking-widest text-[#ececec] bg-[#111111] transition-all";
  const inactiveStyle = "px-5 py-1.5 text-xs uppercase tracking-widest text-[#ececec]/60 hover:text-white transition-colors";

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-transparent pt-4">
      <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Left Side: Home + Episodes (Tapi targetnya ke Collection) */}
        <div className="flex-1 flex items-center justify-end space-x-4 md:space-x-8 pr-8 md:pr-12">
          <Link
            href="/"
            onClick={() => handleNavClick("home")}
            className={activeTab === "home" ? activeStyle : inactiveStyle}
          >
            Home
          </Link>
          <Link
            href="/#collection"
            onClick={() => handleNavClick("collection")}
            className={`${activeTab === "collection" ? activeStyle : inactiveStyle} hidden sm:block`}
          >
            Episodes
          </Link>
        </div>

        {/* Center: Logo */}
        <div className="flex-shrink-0 flex justify-center">
          <Link href="/" onClick={() => handleNavClick("home")} className="flex items-center">
            <Image src="/images/ICON CHROME 1.png" alt="Mantra Icon" width={32} height={32} className="object-contain" />
          </Link>
        </div>

        {/* Right Side: Collection (Tapi targetnya ke Episodes) + Cart */}
        <div className="flex-1 flex items-center justify-start space-x-4 md:space-x-8 pl-8 md:pl-12">
          <Link
            href="/#learn-the-chants"
            onClick={() => handleNavClick("episodes")}
            className={`${activeTab === "episodes" ? activeStyle : inactiveStyle} hidden sm:block`}
          >
            Collection
          </Link>
          <button
            onClick={openDrawer}
            className={`flex items-center space-x-2 ${inactiveStyle}`}
          >
            <span className="hidden sm:inline">Cart</span>
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-[#ececec]" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#ececec] text-[#050505] text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                  {cartItemCount}
                </span>
              )}
            </div>
          </button>
        </div>

      </div>
    </nav>
  );
}