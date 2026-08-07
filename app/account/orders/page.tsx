import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";

export default function OrdersPage() {
  // Mock data
  const orders = [
    { id: "MNTR-728192", date: "2024-10-12", total: 450000, status: "Shipped", items: 1 },
    { id: "MNTR-631024", date: "2024-09-05", total: 1400000, status: "Delivered", items: 2 },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#ececec] uppercase tracking-widest mb-8 border-b border-[#1f1f1f] pb-4">
        Order History
      </h2>

      {orders.length === 0 ? (
        <div className="border border-[#1f1f1f] p-12 flex flex-col items-center justify-center text-center">
          <Package className="w-12 h-12 text-[#ececec]/20 mb-4" />
          <p className="text-[#ececec] uppercase tracking-widest mb-2 font-bold">No Orders Found</p>
          <p className="text-[#ececec]/50 text-sm mb-6">You haven't placed any orders yet.</p>
          <Link href="/shop" className="border border-[#1f1f1f] px-6 py-3 text-xs uppercase tracking-widest text-[#ececec] hover:bg-[#ececec] hover:text-[#050505] transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="border border-[#1f1f1f] p-6 bg-[#0a0a0a] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-[#111111]">
              <div className="space-y-1">
                <p className="text-[#ececec] text-sm font-bold tracking-widest">#{order.id}</p>
                <p className="text-[#ececec]/60 text-xs">{new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-[#ececec] font-mono text-sm">Rp {order.total.toLocaleString('id-ID')}</p>
                  <p className="text-[#ececec]/60 text-xs">{order.items} item(s)</p>
                </div>
                <div className="px-3 py-1 text-xs uppercase tracking-widest font-bold border border-[#1f1f1f] text-[#ececec]">
                  {order.status}
                </div>
                <Link href={`/account/orders/${order.id}`} className="text-[#ececec] hover:text-white bg-[#1f1f1f] p-2 rounded-full">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
