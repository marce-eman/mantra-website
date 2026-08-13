import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Package, MapPin, ArrowLeft, Shield } from "lucide-react";
import SignOutButton from "./SignOutButton";
import { prisma } from "@/lib/prisma";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?redirect=/account");
  }

  // Cek secara aman ke database apakah user ini adalah ADMIN
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  const isAdmin = dbUser?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-[#050505] text-[#ececec] pt-24 pb-20 px-6 md:px-12 border-t border-[#1f1f1f]">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Dashboard */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1f1f1f] pb-6 gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#ececec]/50 block mb-1">
              // DASHBOARD
            </span>
            <h1 className="text-2xl md:text-4xl font-light tracking-widest uppercase">
              MY ACCOUNT
            </h1>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#ececec]/60 hover:text-white transition-colors font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Shop
          </Link>
        </div>

        {/* Layout Grid: Sidebar Navigation + Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Sidebar Nav */}
          <aside className="md:col-span-3 space-y-2">
            <Link
              href="/account"
              className="flex items-center gap-3 px-4 py-3 bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[#ececec]/40 rounded-xl text-xs uppercase tracking-widest transition-colors"
            >
              <User className="w-4 h-4 text-emerald-400" />
              <span>Profile Details</span>
            </Link>

            <Link
              href="/account/orders"
              className="flex items-center gap-3 px-4 py-3 bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[#ececec]/40 rounded-xl text-xs uppercase tracking-widest transition-colors"
            >
              <Package className="w-4 h-4 text-emerald-400" />
              <span>My Orders</span>
            </Link>

            <Link
              href="/account/addresses"
              className="flex items-center gap-3 px-4 py-3 bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[#ececec]/40 rounded-xl text-xs uppercase tracking-widest transition-colors"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Shipping Address</span>
            </Link>

            {/* --- TOMBOL KHUSUS ADMIN --- */}
            {isAdmin && (
              <div className="pt-4 pb-2">
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-3 bg-emerald-950/20 border border-emerald-900/30 hover:border-emerald-500/50 rounded-xl text-xs uppercase tracking-widest transition-colors text-emerald-400"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Panel</span>
                </Link>
              </div>
            )}

            {/* Client Component Logout */}
            <div className="pt-2">
              <SignOutButton />
            </div>
          </aside>

          {/* Main Content View */}
          <main className="md:col-span-9">{children}</main>
        </div>

      </div>
    </div>
  );
}