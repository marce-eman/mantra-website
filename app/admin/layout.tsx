import Link from "next/link";
import { LayoutDashboard, Film, Shirt, ShoppingCart, LogOut } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Cek apakah user yang login memiliki role ADMIN
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (user?.role !== "ADMIN") {
    redirect("/"); // Tendang ke Home kalau bukan Admin
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#ececec] flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-[#1f1f1f] bg-[#0a0a0a] flex flex-col shrink-0 md:min-h-screen">
        <div className="p-6 border-b border-[#1f1f1f] flex items-center justify-between md:justify-center">
          <h2 className="text-xl font-bold tracking-widest uppercase font-serif">MANTRA ADMIN</h2>
        </div>
        
        <nav className="flex-1 p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#1f1f1f] transition-colors text-xs uppercase tracking-widest whitespace-nowrap">
            <LayoutDashboard className="w-4 h-4" /> Overview
          </Link>
          <Link href="/admin/episodes" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#1f1f1f] transition-colors text-xs uppercase tracking-widest whitespace-nowrap">
            <Film className="w-4 h-4" /> Episodes (Home)
          </Link>
          <Link href="/admin/articles" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#1f1f1f] transition-colors text-xs uppercase tracking-widest whitespace-nowrap">
            <Shirt className="w-4 h-4" /> Articles (Shop)
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#1f1f1f] transition-colors text-xs uppercase tracking-widest whitespace-nowrap">
            <ShoppingCart className="w-4 h-4" /> Orders
          </Link>
        </nav>

        <div className="p-4 border-t border-[#1f1f1f] hidden md:block">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#ececec]/50 hover:text-white hover:bg-[#1f1f1f] transition-colors text-xs uppercase tracking-widest">
            <LogOut className="w-4 h-4" /> Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}