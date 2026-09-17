import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CheckCircle2, ArrowRight, ShoppingBag, Truck, CreditCard, MessageCircle, Clock } from "lucide-react";
import CopyOrderButton from "@/components/CopyOrderButton";
import { getSiteSetting } from "@/lib/siteSettings";
import { getAssetUrl } from "@/lib/assetUrls";
import { formatRupiah } from "@/lib/utils";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; order_id?: string }>;
}) {
  const session = await auth();
  const search = await searchParams;
  const targetOrderId = search?.order_id || search?.orderId;

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (!targetOrderId) {
    redirect("/shop");
  }

  const order = await prisma.order.findFirst({
    where: {
      userId: session.user.id,
      OR: [
        { id: targetOrderId },
        { orderNumber: targetOrderId },
      ],
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
    redirect("/shop");
  }

  const whatsappNumber = await getSiteSetting("admin_whatsapp");
  const finalOrderId = order.orderNumber || order.id.toUpperCase();
  const isPaid = order.paymentStatus === "PAID" || order.status === "PAID";

  const waText = encodeURIComponent(
    `Hello Admin MANTRA, I have placed an order #${finalOrderId}.\nTotal: ${formatRupiah(order.totalAmount)}\nPayment Status: ${order.paymentStatus}\nCourier: ${order.shippingCourier || order.courier || "Courier"}`
  );

  return (
    <div className="min-h-screen bg-[#050505] text-[#ececec] pt-24 pb-20 px-6 md:px-12 border-t border-[#1f1f1f]">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Banner Success */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-8 text-center relative overflow-hidden space-y-4">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-60" />
          
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400">
            {isPaid ? <CheckCircle2 className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
          </div>

          <div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#ececec]/50">
                PAYMENT:
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                isPaid ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-amber-950 text-amber-400 border border-amber-800"
              }`}>
                {order.paymentStatus}
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-light tracking-widest uppercase">
              {isPaid ? "ORDER CONFIRMED" : "ORDER RECEIVED"}
            </h1>
            <p className="text-xs text-[#ececec]/60 uppercase tracking-widest mt-1">
              {isPaid ? "Your payment was successfully verified by Midtrans." : "Awaiting payment settlement from Midtrans."}
            </p>
          </div>

          <div className="pt-2 border-t border-[#1f1f1f] mt-4 max-w-sm mx-auto">
            <span className="text-[10px] font-mono text-[#ececec]/40 uppercase tracking-widest block mt-4 mb-2">
              ORDER REFERENCE
            </span>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-base md:text-xl font-mono font-bold text-emerald-400 tracking-wider">
                #{finalOrderId}
              </span>
              <CopyOrderButton textToCopy={finalOrderId} />
            </div>
          </div>
        </div>

        {/* Shipping & Payment Summary Card */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-6 md:p-8 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#ececec]/60 border-b border-[#1f1f1f] pb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" /> Transaction Summary
          </h2>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between text-[#ececec]/70">
              <span>Courier (Biteship):</span>
              <span className="text-white font-bold uppercase">{order.shippingCourier || order.courier || "Standard Courier"}</span>
            </div>
            {order.shippingService && (
              <div className="flex justify-between text-[#ececec]/50">
                <span>Service:</span>
                <span>{order.shippingService}</span>
              </div>
            )}
            <div className="flex justify-between text-[#ececec]/70">
              <span>Shipping Fee:</span>
              <span>{formatRupiah(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between text-[#ececec] border-t border-[#1f1f1f] pt-2 text-sm font-bold">
              <span>Grand Total:</span>
              <span className="text-emerald-400">{formatRupiah(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Ordered Items & Destination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#ececec]/50 border-b border-[#1f1f1f] pb-3">
              <ShoppingBag className="w-4 h-4" /> Ordered Items ({order.items.length})
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {order.items.map((item) => {
                const product = item.product as Record<string, unknown>;
                const rawImage =
                  (product?.image as string) ||
                  ((product?.images as string[])?.[0]) ||
                  (product?.imageUrl as string) ||
                  "/images/placeholder.jpg";
                const productImage = getAssetUrl(rawImage);

                return (
                  <div key={item.id} className="flex items-center gap-3 text-xs">
                    <div className="relative w-12 h-12 bg-[#181818] rounded-lg overflow-hidden shrink-0 border border-[#1f1f1f]">
                      <Image src={productImage} alt={(product?.name as string) || "Product"} fill className="object-cover" />
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium uppercase line-clamp-1">{(product?.name as string) || item.name}</p>
                      <p className="text-[10px] text-[#ececec]/50 font-mono">
                        {item.quantity} x {formatRupiah(item.price)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#ececec]/50 border-b border-[#1f1f1f] pb-3">
              <Truck className="w-4 h-4" /> Destination Address
            </div>
            <p className="text-xs text-[#ececec]/70 leading-relaxed font-light font-mono">
              {order.address || "No address specified"}
            </p>
            {order.trackingNumber && (
              <div className="mt-3 p-2 bg-[#141414] border border-[#2a2a2a] rounded-lg text-xs font-mono">
                <span className="text-[#ececec]/40 block text-[10px] uppercase">Tracking Number:</span>
                <span className="text-emerald-400 font-bold">{order.trackingNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp Support Option */}
        <div className="text-center pt-2">
          <a
            href={`https://wa.me/${whatsappNumber || "6281234567890"}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-[#ececec]/50 hover:text-white transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" /> Have questions? Contact Admin Support on WhatsApp
          </a>
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between pt-4">
          <Link
            href="/track"
            className="flex-1 border border-[#1f1f1f] bg-[#0a0a0a] hover:bg-[#111111] text-[#ececec] text-center py-3.5 rounded-xl text-xs uppercase tracking-widest font-bold transition-colors cursor-pointer"
          >
            Track Order Status
          </Link>
          <Link
            href="/shop"
            className="flex-1 bg-[#ececec] hover:bg-white text-[#050505] text-center py-3.5 rounded-xl text-xs uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}