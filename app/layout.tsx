import React from "react";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/siteSettings";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import FloatingChat from "@/components/FloatingChat";
import { Providers } from "@/components/Providers";
import { StoreNavbarWrapper, StoreBottomWrapper } from "@/components/StoreUIWrapper";
import { getCachedUserProfile } from "@/lib/userProfile";
import "./globals.css";

export const preferredRegion = "sin1";

export const metadata: Metadata = {
  title: "MANTRA — A Manifestation Born From The Shadows",
  description: "Crafted for those who walk through the void and seek truth within the dark.",
  icons: {
    icon: "/images/ICON CHROME 1.png",
    shortcut: "/images/ICON CHROME 1.png",
    apple: "/images/ICON CHROME 1.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const siteSettings = await getSiteSettings();
  
  let isAdmin = false;
  let hasOrders = false;

  if (session?.user?.id) {
    const dbUser = await getCachedUserProfile(session.user.id);
    isAdmin = dbUser?.role?.toUpperCase() === "ADMIN";
    hasOrders = (dbUser?._count?.orders ?? 0) > 0;
  }

  const today = new Date().getDay();
  const isFriday = today === 5;

  // Syarat dasar toko buka (Jumat atau Admin)
  const isStoreOpen = isFriday || isAdmin;

  return (
    <html lang="en">
      <body>
        <Providers isFriday={isFriday} isAdmin={isAdmin} hasOrders={hasOrders}>
          
          {/* BUNGKUS NAVBAR DENGAN WRAPPER */}
          <StoreNavbarWrapper show={isStoreOpen}>
            <Navbar />
          </StoreNavbarWrapper>

          {/* KONTEN HALAMAN (Home, Shop, Admin, dll) */}
          {children}

          {/* BUNGKUS ELEMEN BAWAH DENGAN WRAPPER */}
          <StoreBottomWrapper show={isStoreOpen}>
            <CartDrawer />
            <FloatingChat whatsappNumber={siteSettings.admin_whatsapp} />
            <Footer settings={siteSettings} />
          </StoreBottomWrapper>

        </Providers>
      </body>
    </html>
  );
}