import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import FloatingChat from "@/components/FloatingChat";
import { Providers } from "@/components/Providers";
import { StoreNavbarWrapper, StoreBottomWrapper } from "@/components/StoreUIWrapper"; // <--- Import file baru
import "./globals.css";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  let isAdmin = false;
  let hasOrders = false;

  if (session?.user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        _count: { select: { orders: true } },
      },
    });

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
            <FloatingChat />
            <Footer />
          </StoreBottomWrapper>

        </Providers>
      </body>
    </html>
  );
}