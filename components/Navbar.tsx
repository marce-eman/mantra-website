"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isManualScrolling = useRef(false);
  
  const { items, openDrawer } = useCartStore();
  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleCartClick = () => {
    if (!session?.user) {
      router.push("/login?redirect=/shop");
    } else {
      openDrawer();
    }
  };

  useEffect(() => {
    if (pathname !== "/") return;

    const handleScroll = () => {
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
  }, [pathname]);

  // Mengunci layar agar tidak bisa di-scroll saat Menu Samping terbuka
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false); // Otomatis menutup menu
    isManualScrolling.current = true;

    setTimeout(() => {
      isManualScrolling.current = false;
    }, 1000);
  };

  // --- STYLE UNTUK DESKTOP ---
  const activeStyle = "px-5 py-1.5 border border-[#1f1f1f] rounded-full text-xs uppercase tracking-widest text-[#ececec] bg-[#111111] transition-all shrink-0";
  const inactiveStyle = "px-5 py-1.5 text-xs uppercase tracking-widest text-[#ececec]/60 hover:text-white transition-colors cursor-pointer shrink-0";

  // --- STYLE UNTUK SIDEBAR MOBILE ---
  const mobileActiveStyle = "text-lg uppercase tracking-[0.2em] text-[#ececec] font-light";
  const mobileInactiveStyle = "text-lg uppercase tracking-[0.2em] text-[#ececec]/40 hover:text-white transition-colors font-light";

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#050505]/60 backdrop-blur-xl border-b border-[#1f1f1f] transition-all duration-300">
        <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* LEFT SIDE: Hamburger Menu (Mobile) + Links (Desktop) */}
          <div className="flex-1 flex items-center justify-start md:justify-end md:space-x-8 md:pr-12">
            
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-[#ececec]/80 hover:text-white p-1"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" onClick={() => handleNavClick("home")} className={pathname === "/" && activeTab === "home" ? activeStyle : inactiveStyle}>
                Home
              </Link>
              <Link href="/#collection" onClick={() => handleNavClick("collection")} className={pathname === "/" && activeTab === "collection" ? activeStyle : inactiveStyle}>
                Episodes
              </Link>
            </div>
          </div>

          {/* CENTER: Logo Mantra */}
          <div className="flex-shrink-0 flex justify-center px-2">
            <Link href="/" onClick={() => handleNavClick("home")} className="flex items-center">
              <Image src="/images/ICON CHROME 1.png" alt="Mantra Icon" width={32} height={32} className="object-contain w-7 h-7 md:w-8 md:h-8" />
            </Link>
          </div>

          {/* RIGHT SIDE: Catalogue (Desktop) + Cart (All) */}
          <div className="flex-1 flex items-center justify-end md:justify-start md:space-x-8 md:pl-12">
            
            <div className="hidden md:block">
              <Link href="/shop" onClick={() => handleNavClick("shop")} className={pathname === "/shop" ? activeStyle : inactiveStyle}>
                Catalogue
              </Link>
            </div>

            <button
              onClick={handleCartClick}
              className="flex items-center space-x-1.5 md:px-5 md:py-1.5 text-xs uppercase tracking-widest text-[#ececec]/60 hover:text-white transition-colors cursor-pointer shrink-0 p-1 md:p-0"
            >
              <span className="hidden md:inline">Cart</span>
              <div className="relative">
                <ShoppingBag className="w-5 h-5 md:w-4 md:h-4 text-[#ececec]" />
                {session?.user && cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 md:-top-1 md:-right-2 bg-[#ececec] text-[#050505] text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                    {cartItemCount}
                  </span>
                )}
              </div>
            </button>
          </div>

        </div>
      </nav>

      {/* =========================================================================
          SIDEBAR DRAWER UNTUK MOBILE (MELUNCUR DARI KIRI)
          ========================================================================= */}
      
      {/* 1. OVERLAY GELAP (Area kanan yang kosong, jika diklik akan menutup menu) */}
      <div 
        className={`fixed inset-0 z-[90] bg-[#050505]/70 backdrop-blur-sm transition-opacity duration-500 md:hidden ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* 2. KOTAK MENU (Lebar 75% layar, meluncur dari kiri) */}
      <div 
        className={`fixed top-0 left-0 h-full w-[75vw] max-w-[300px] bg-[#050505] border-r border-[#1f1f1f] z-[100] transform transition-transform duration-500 ease-in-out md:hidden flex flex-col shadow-2xl ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header Sidebar (Logo kecil & Tombol Close) */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#1f1f1f]">
          <Image src="/images/ICON CHROME 1.png" alt="Mantra Icon" width={24} height={24} className="object-contain w-6 h-6 opacity-80" />
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-[#ececec]/60 hover:text-white transition-colors p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Daftar Menu (Rata kiri agar estetik) */}
        <div className="flex flex-col px-8 py-10 space-y-8">
          <Link 
            href="/" 
            onClick={() => handleNavClick("home")} 
            className={pathname === "/" && activeTab === "home" ? mobileActiveStyle : mobileInactiveStyle}
          >
            Home
          </Link>
          <Link 
            href="/#collection" 
            onClick={() => handleNavClick("collection")} 
            className={pathname === "/" && activeTab === "collection" ? mobileActiveStyle : mobileInactiveStyle}
          >
            Episodes
          </Link>
          <Link 
            href="/shop" 
            onClick={() => handleNavClick("shop")} 
            className={pathname === "/shop" ? mobileActiveStyle : mobileInactiveStyle}
          >
            Catalogue
          </Link>
        </div>
        
        {/* Hiasan Teks Bawah */}
        <div className="mt-auto px-8 pb-10 flex flex-col opacity-30 pointer-events-none">
           <span className="text-[9px] uppercase tracking-[0.3em] font-mono leading-relaxed">
             Walk through<br/>the void
           </span>
        </div>
      </div>
    </>
  );
}