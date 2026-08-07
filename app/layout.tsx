import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import FloatingChat from "@/components/FloatingChat";

export const metadata: Metadata = {
  title: "MANTRA | Opus Arcanum",
  description: "A manifestation of shadows. Crafted for the modern brutalist.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-16">
          {children}
        </main>
        <Footer />
        <CartDrawer />
        <FloatingChat />
      </body>
    </html>
  );
}
