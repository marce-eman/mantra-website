import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CreditCard, ShoppingBag, Truck } from "lucide-react";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    redirect("/login");
  }

  const order = await prisma.order.findUnique({
    where: {
      id: id,
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    redirect("/account/orders");
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const waText = encodeURIComponent(
    `Hello Admin MANTRA, I would like to ask about the status and shipping details for my Order ID: #${order.orderNumber || order.id.toUpperCase()}`
  );

  return (
    <div className="bg-[#111111] border border-[#1f1f1f] p-6 md:p-8 rounded-2xl space-y-8">
      <div>
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#ececec]/50 hover:text-white transition-colors font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#1f1f1f] pb-6 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#ececec]/40 font-mono block">
            ORDER REFERENCE
          </span>
          <h1 className="text-lg md:text-2xl font-mono font-bold tracking-wider text-[#ececec] uppercase">
            #{order.orderNumber || order.id.toUpperCase()}
          </h1>
          <p className="text-[11px] text-[#ececec]/50 font-mono mt-1">
            Placed on {formattedDate}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-[#ececec]/50">Status:</span>
          <span
            className={`text-xs uppercase tracking-widest font-bold font-mono px-3 py-1 rounded-full border ${
              order.status === "PAID" || order.status === "COMPLETED" || order.status === "SHIPPED"
                ? "bg-emerald-950/50 text-emerald-400 border-emerald-800/50"
                : order.status === "CANCELED"
                ? "bg-red-950/50 text-red-400 border-red-800/50"
                : "bg-amber-950/50 text-amber-400 border-amber-800/50"
            }`}
          >
            {order.status}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#ececec]/50 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4" /> Purchased Items ({order.items.length})
        </h2>

        <div className="space-y-3">
          {order.items.map((item: any) => {
            const productImage =
              item.product?.images?.[0] ||
              item.product?.image ||
              "/images/placeholder.jpg";

            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 bg-[#0a0a0a] border border-[#1f1f1f] p-4 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="relative aspect-square w-14 bg-[#181818] rounded-lg overflow-hidden shrink-0 border border-[#1f1f1f]">
                    <Image
                      src={productImage}
                      alt={item.product?.name || "Product"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wider text-[#ececec]">
                      {item.product?.name || "Product"}
                    </h3>
                    <p className="text-[10px] text-[#ececec]/40 font-mono mt-1">
                      {item.quantity} x ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-emerald-400">
                  ${(item.price * item.quantity).toFixed(2)} USD
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-5 rounded-xl space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#ececec]/50 flex items-center gap-2">
            <Truck className="w-4 h-4" /> Shipping Destination
          </h2>
          <p className="text-xs text-[#ececec]/70 font-light leading-relaxed">
            {order.address || "No shipping address specified."}
          </p>
        </div>

        <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-5 rounded-xl space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#ececec]/50 flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Payment Summary
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-[#ececec]/60">
              <span>Items Amount</span>
              <span className="font-mono">${order.totalAmount.toFixed(2)} USD</span>
            </div>
            <div className="border-t border-[#1f1f1f] pt-2 flex justify-between font-bold text-[#ececec]">
              <span>TOTAL ITEMS</span>
              <span className="font-mono text-emerald-400">
                ${order.totalAmount.toFixed(2)} USD
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl flex flex-col space-y-4">
        <p className="text-xs text-[#ececec]/60 font-light text-center md:text-left">
          Need help with this order, or want to track its current location?
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/track"
            className="flex-1 border border-[#2a2a2a] bg-[#111111] hover:bg-[#1a1a1a] text-[#ececec] text-center px-5 py-3 rounded-lg text-xs uppercase tracking-widest font-bold transition-colors cursor-pointer"
          >
            Public Tracking Page
          </Link>
          <a
            href={`https://wa.me/6281234567890?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black text-center px-5 py-3 rounded-lg text-xs uppercase tracking-widest font-bold transition-colors cursor-pointer"
          >
            Chat Admin via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}