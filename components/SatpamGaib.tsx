"use client";

import { usePathname, useRouter } from "next/navigation";
import NotFound from "@/app/not-found";
import { useEffect, ReactNode } from "react";
import { signOut } from "next-auth/react";
import { ShieldAlert, LogOut } from "lucide-react";

interface SatpamProps {
  isFriday: boolean;
  isAdmin: boolean;
  hasOrders: boolean;
  children: ReactNode;
}

export default function SatpamGaib({ isFriday, isAdmin, hasOrders, children }: SatpamProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPath = pathname.startsWith("/login");
  const isApiPath = pathname.startsWith("/api");
  const isTrackPath = pathname.startsWith("/track");
  const isOrdersPath = pathname.startsWith("/account/orders");
  const isAccountBase = pathname === "/account";

  // 1. SEMUA HOOKS DI ATAS SEBELUM KONDISI APAPUN
  useEffect(() => {
    if (hasOrders && isAccountBase) {
      router.replace("/account/orders");
    }
  }, [hasOrders, isAccountBase, router]);

  // 2. JIKA ADMIN ATAU HARI JUMAT: Buka semua pintu, render website normal! 🫡
  if (isAdmin || isFriday) {
    return <>{children}</>;
  }

  // 3. JALUR PUBLIK (Login, Track, API)
  if (isLoginPath || isApiPath || isTrackPath) {
    return <>{children}</>;
  }

  // 4. PEMILIK PESANAN YANG SAH
  if (hasOrders && (isOrdersPath || isAccountBase)) {
    return <>{children}</>;
  }

  // 5. PENOLAKAN AKSES KHUSUS (USER LOGIN TAPI 0 ORDER)
  if (!hasOrders && (isOrdersPath || isAccountBase)) {
    return (
      <div className="fixed inset-0 z-[99999] bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-6 animate-pulse" />
        <h1 className="text-2xl font-bold uppercase tracking-widest text-[#ececec] mb-2">
          Access Denied
        </h1>
        <p className="text-xs text-[#ececec]/50 uppercase tracking-widest mb-8 max-w-sm leading-relaxed">
          You do not have any active orders. The void remains closed for you.
        </p>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center justify-center gap-2 border border-[#1f1f1f] bg-[#0a0a0a] hover:bg-[#111111] text-[#ececec] px-8 py-4 rounded-xl text-xs uppercase tracking-widest transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-red-400" /> Sign Out
        </button>
      </div>
    );
  }

  // 6. JIKA TOKO TUTUP & TAMU / USER TANPA PESANAN NYASAR KE HALAMAN LAIN:
  // KONTEN WEBSITE (Navbar, Cart, Chat, Footer, dll) DI-BLOCK TOTAL DAN TIDAK DIRENDER SAMA SEKALI!
  return <NotFound />;
}