import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, Clock, Package, Truck, CheckCircle2, XCircle } from "lucide-react";
import CopyOrderButton from "@/components/CopyOrderButton";

export default async function AccountOrdersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-400 bg-amber-950/50 border border-amber-800/50 px-3 py-1 rounded-full uppercase">
            <Clock className="w-3 h-3" /> Awaiting Payment
          </span>
        );
      case "PROCESSING":
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-blue-400 bg-blue-950/50 border border-blue-800/50 px-3 py-1 rounded-full uppercase">
            <Package className="w-3 h-3" /> Processing
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-3 py-1 rounded-full uppercase">
            <Truck className="w-3 h-3" /> Shipped
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-3 py-1 rounded-full uppercase">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-red-400 bg-red-950/50 border border-red-800/50 px-3 py-1 rounded-full uppercase">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#ececec]/60 bg-[#111111] border border-[#1f1f1f] px-3 py-1 rounded-full uppercase">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-[#111111] border border-[#1f1f1f] p-6 md:p-8 rounded-2xl">
      <h2 className="text-xl uppercase tracking-widest font-light mb-2 text-[#ececec]">
        ORDER HISTORY
      </h2>
      <p className="text-xs uppercase tracking-widest text-[#ececec]/50 mb-8">
        Track the status and history of all your transactions on MANTRA.
      </p>

      {orders.length === 0 ? (
        <div className="text-center py-12 border border-[#1f1f1f] rounded-xl bg-[#0a0a0a]">
          <p className="text-xs uppercase tracking-widest text-[#ececec]/40 mb-4">
            You do not have an order history yet.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-[#ececec] text-black px-6 py-2.5 rounded-lg text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const finalOrderId = order.orderNumber || order.id.toUpperCase();

            return (
              <div
                key={order.id}
                className="border border-[#1f1f1f] bg-[#0a0a0a] rounded-xl p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1f1f1f] pb-4 gap-4">
                  
                  {/* Bagian Order ID dan Tombol Copy yang Dijejerkan */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div>
                      <span className="text-[10px] text-[#ececec]/40 uppercase tracking-widest block mb-1">
                        Order ID
                      </span>
                      <span className="text-xs font-mono font-bold text-[#ececec] uppercase">
                        #{finalOrderId}
                      </span>
                    </div>
                    
                    {/* Tombol Copy dibungkus agar lebarnya pas */}
                    <div className="w-fit sm:-mt-2">
                      <CopyOrderButton textToCopy={finalOrderId} />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[10px] text-[#ececec]/40 uppercase tracking-widest">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                <div className="space-y-3">
                  {order.items.map((item: any) => {
                    const productImage =
                      item.product?.images?.[0] ||
                      item.product?.image ||
                      "/images/placeholder.jpg";

                    return (
                      <div key={item.id} className="flex gap-4 items-center">
                        <div className="relative aspect-square w-12 bg-[#181818] rounded-lg overflow-hidden flex-shrink-0 border border-[#1f1f1f]">
                          <Image
                            src={productImage}
                            alt={item.product?.name || "Product"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-xs font-medium uppercase tracking-wider text-[#ececec]">
                            {item.product?.name || "Product"}
                          </h4>
                          <p className="text-[10px] text-[#ececec]/40 uppercase tracking-widest">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <span className="text-xs font-mono text-[#ececec]">
                          ${(item.price * item.quantity).toFixed(2)} USD
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-[#1f1f1f] pt-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs tracking-widest uppercase">
                  <div className="flex items-center gap-2">
                    <span className="text-[#ececec]/50">Items Amount:</span>
                    <span className="text-emerald-400 font-mono font-bold text-sm">
                      ${order.totalAmount.toFixed(2)} USD
                    </span>
                  </div>

                  <Link
                    href={`/account/orders/${order.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-[#ececec]/70 hover:text-white transition-colors underline underline-offset-4"
                  >
                    View Order Details <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}