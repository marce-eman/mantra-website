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
    redirect("/login?redirect=/account/orders");
  }

  // Ambil data user sekaligus menghitung total pesanannya di database
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: { orders: true }
      }
    }
  });

  const isAdmin = dbUser?.role === "ADMIN";
  const hasOrders = (dbUser?._count?.orders ?? 0) > 0;

  // Cek Hari (0 = Minggu, 5 = Jumat)
  const today = new Date().getDay();
  const isFriday = today === 5;

  // ---------------------------------------------------------
  // LOGIKA AKSES HARI NON-JUMAT
  // ---------------------------------------------------------
  // Jika ini bukan hari Jumat, bukan Admin, dan TIDAK punya pesanan:
  // Tolak akses dan kembalikan ke halaman depan (Home)
  if (!isFriday && !isAdmin && !hasOrders) {
    redirect("/?error=closed_no_orders"); 
  }

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
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#ececec]/60 hover:text-white transition-colors font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>

        {/* Layout Grid: Sidebar Navigation + Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Sidebar Nav */}
          <aside className="md:col-span-3 space-y-2">
            
            {/* Tampilkan Profile & Address HANYA jika hari Jumat atau Admin */}
            {(isFriday || isAdmin) && (
              <Link
                href="/account"
                className="flex items-center gap-3 px-4 py-3 bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[#ececec]/40 rounded-xl text-xs uppercase tracking-widest transition-colors"
              >
                <User className="w-4 h-4 text-emerald-400" />
                <span>Profile Details</span>
              </Link>
            )}

            {/* Menu Orders (Selalu tampil untuk yang lolos filter) */}
            <Link
              href="/account/orders"
              className="flex items-center gap-3 px-4 py-3 bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[#ececec]/40 rounded-xl text-xs uppercase tracking-widest transition-colors"
            >
              <Package className="w-4 h-4 text-emerald-400" />
              <span>My Orders</span>
            </Link>

            {/* Tampilkan Address HANYA jika hari Jumat atau Admin */}
            {(isFriday || isAdmin) && (
              <Link
                href="/account/addresses"
                className="flex items-center gap-3 px-4 py-3 bg-[#0a0a0a] border border-[#1f1f1f] hover:border-[#ececec]/40 rounded-xl text-xs uppercase tracking-widest transition-colors"
              >
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Shipping Address</span>
              </Link>
            )}

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