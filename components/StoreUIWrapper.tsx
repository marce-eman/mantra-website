"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export function StoreNavbarWrapper({ children, show }: { children: ReactNode, show: boolean }) {
  // Sekarang Navbar akan selalu muncul selama status 'show' bernilai true (termasuk di Admin)
  if (!show) return null;
  return <>{children}</>;
}

export function StoreBottomWrapper({ children, show }: { children: ReactNode, show: boolean }) {
  const pathname = usePathname();
  
  // Cart dan Chat tetap muncul, tapi Footer kita sembunyikan khusus di Admin 
  // biar layar Admin kamu tidak terlalu penuh di bagian bawah
  if (!show || (pathname.startsWith("/admin") && children?.toString().includes("Footer"))) {
      return null;
  }
  
  return <>{children}</>;
}