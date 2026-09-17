"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Film,
  Shirt,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  Users,
  Settings,
  Store,
} from "lucide-react";

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const navLinks = [
    { href: "/admin", icon: LayoutDashboard, label: "Overview" },
    { href: "/admin/episodes", icon: Film, label: "Episodes (Home)" },
    { href: "/admin/articles", icon: Shirt, label: "Articles (Shop)" },
    { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/settings", icon: Settings, label: "Site Settings" },
  ];

  return (
    <>
      {/* 1. TOPBAR KHUSUS MOBILE (Sticky below Main Header) */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0a0a0a] border-b border-[#1f1f1f] sticky top-16 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="text-[#ececec]/80 hover:text-white p-1 transition-colors cursor-pointer"
          aria-label="Open Admin Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-sm font-bold tracking-widest uppercase font-serif text-[#ececec]">
          MANTRA ADMIN
        </h2>
        <Link
          href="/"
          className="text-xs uppercase font-mono text-[#ececec]/50 hover:text-white flex items-center gap-1"
          title="Back to Storefront"
        >
          <Store className="w-4 h-4" />
        </Link>
      </div>

      {/* 2. OVERLAY LACI MOBILE */}
      <div
        className={`fixed inset-0 z-[90] bg-[#050505]/80 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* 3. LACI MOBILE */}
      <div
        className={`fixed top-0 left-0 h-full w-[80vw] max-w-[300px] bg-[#0a0a0a] border-r border-[#1f1f1f] z-[100] transform transition-transform duration-300 ease-in-out flex flex-col md:hidden shadow-2xl pt-16 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#1f1f1f]">
          <h2 className="text-sm font-bold tracking-widest uppercase font-serif text-[#ececec]">
            MENU ADMIN
          </h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-[#ececec]/60 hover:text-white transition-colors cursor-pointer p-1"
            aria-label="Close Admin Menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-xs uppercase tracking-widest font-mono ${
                  isActive
                    ? "bg-[#1f1f1f] text-white font-bold shadow-sm"
                    : "text-[#ececec]/70 hover:bg-[#111111] hover:text-white"
                }`}
              >
                <link.icon className="w-4 h-4" /> {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Exit Admin & Storefront Links */}
        <div className="p-4 border-t border-[#1f1f1f] bg-[#0a0a0a] space-y-2 pb-8">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#222222] bg-[#111111] text-[#ececec]/80 hover:text-white hover:bg-[#1f1f1f] transition-all text-xs font-mono uppercase tracking-wider"
          >
            <Store className="w-4 h-4" /> View Storefront
          </Link>
          <Link
            href="/account"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 hover:bg-red-900/50 hover:text-white transition-all text-xs font-mono font-bold uppercase tracking-wider"
          >
            <LogOut className="w-4 h-4" /> Exit Admin
          </Link>
        </div>
      </div>

      {/* 4. SIDEBAR DESKTOP ASLI */}
      <aside className="hidden md:flex w-64 border-r border-[#1f1f1f] bg-[#0a0a0a] flex-col shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
        <div className="p-6 border-b border-[#1f1f1f] flex justify-center">
          <h2 className="text-xl font-bold tracking-widest uppercase font-serif">MANTRA ADMIN</h2>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-xs uppercase tracking-widest font-mono ${
                  isActive
                    ? "bg-[#1f1f1f] text-white font-bold shadow-sm"
                    : "text-[#ececec]/70 hover:bg-[#111111] hover:text-white"
                }`}
              >
                <link.icon className="w-4 h-4" /> {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#1f1f1f] space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-[#222222] bg-[#111111] text-[#ececec]/70 hover:text-white hover:bg-[#1f1f1f] transition-all text-xs font-mono uppercase tracking-wider"
          >
            <Store className="w-4 h-4" /> View Storefront
          </Link>
          <Link
            href="/account"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400/80 hover:text-red-300 hover:bg-red-950/30 border border-transparent hover:border-red-900/40 transition-colors text-xs font-mono uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" /> Exit Admin
          </Link>
        </div>
      </aside>
    </>
  );
}