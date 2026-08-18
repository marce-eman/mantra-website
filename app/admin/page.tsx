import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  // Ambil total data dari database
  const totalArticles = await prisma.product.count();
  const totalEpisodes = await prisma.episode.count();
  const totalOrders = await prisma.order.count();
  
  // Hitung total pendapatan dari order yang sudah DIBAYAR/SELESAI (Contoh status: PAID)
  const orders = await prisma.order.findMany({
    where: { status: "PAID" },
  });
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="p-6 md:p-12">
      <div className="mb-12">
        <h1 className="text-3xl font-light tracking-widest uppercase mb-2 font-serif">
          Dashboard Overview
        </h1>
        <p className="text-xs text-[#ececec]/50 uppercase tracking-widest">
          Welcome back, Admin. Here is your current data.
        </p>
      </div>

      {/* Statistik Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        
      <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-6 rounded-2xl flex flex-col justify-between"> 
        <h3 className="text-[10px] text-[#ececec]/60 uppercase tracking-widest mb-4">Total Revenue</h3> 
        <p className="text-2xl font-mono text-emerald-400">
          ${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p> 
      </div>
        
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-6 rounded-2xl flex flex-col justify-between">
          <h3 className="text-[10px] text-[#ececec]/60 uppercase tracking-widest mb-4">Total Orders</h3>
          <p className="text-2xl font-mono">{totalOrders}</p>
        </div>
        
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-6 rounded-2xl flex flex-col justify-between">
          <h3 className="text-[10px] text-[#ececec]/60 uppercase tracking-widest mb-4">Total Articles</h3>
          <p className="text-2xl font-mono">{totalArticles}</p>
        </div>
        
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-6 rounded-2xl flex flex-col justify-between">
          <h3 className="text-[10px] text-[#ececec]/60 uppercase tracking-widest mb-4">Episodes</h3>
          <p className="text-2xl font-mono">{totalEpisodes}</p>
        </div>

      </div>
    </div>
  );
}