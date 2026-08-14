import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CheckCircle2, ArrowRight, ShoppingBag, Truck, MessageCircle } from "lucide-react";
import CopyOrderButton from "@/components/CopyOrderButton"; // <--- Import tombol Copy kita

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const session = await auth();
  const { orderId } = await searchParams;

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (!orderId) {
    redirect("/shop");
  }

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
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
    redirect("/shop");
  }

  const finalOrderId = order.orderNumber || order.id.toUpperCase();

  const waText = encodeURIComponent(
    `Hello Admin MANTRA, I have placed an order.\n\nOrder ID: #${finalOrderId}\nTotal Items Amount: $${order.totalAmount.toFixed(2)} USD.\n\nI am awaiting the final shipping calculation and payment instructions.`
  );

  return (
    <div className="min-h-screen bg-[#050505] text-[#ececec] pt-24 pb-20 px-6 md:px-12 border-t border-[#1f1f1f]">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Banner Success */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-8 text-center relative overflow-hidden space-y-4">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-60" />
          
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#ececec]/50 block mb-1">
              STATUS: {order.status}
            </span>
            <h1 className="text-2xl md:text-4xl font-light tracking-widest uppercase">
              ORDER SECURED
            </h1>
            <p className="text-xs text-[#ececec]/60 uppercase tracking-widest mt-1">
              Your journey into the void has begun.
            </p>
          </div>

          <div className="pt-2 border-t border-[#1f1f1f] mt-4 max-w-sm mx-auto">
            <span className="text-[10px] font-mono text-[#ececec]/40 uppercase tracking-widest block mt-4 mb-2">ORDER REFERENCE</span>
            <span className="text-base md:text-xl font-mono font-bold text-emerald-400 tracking-wider">
              #{finalOrderId}
            </span>
            
            {/* TOMBOL COPY MUNCUL DI SINI */}
            <CopyOrderButton textToCopy={finalOrderId} />
            
          </div>
        </div>

        {/* Instruksi Lanjutan via WhatsApp */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-6 md:p-8 space-y-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-zinc-900 rounded-full mb-2">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-lg font-bold uppercase tracking-widest">NEXT STEP: CONFIRM VIA WHATSAPP</h2>
          
          <div className="flex justify-between items-center max-w-sm mx-auto text-sm border-b border-[#1f1f1f] pb-4">
            <span className="text-[#ececec]/60 uppercase tracking-widest">Items Subtotal</span>
            <span className="font-mono font-bold text-emerald-400">
              ${order.totalAmount.toFixed(2)} USD
            </span>
          </div>

          <p className="text-xs text-[#ececec]/50 font-light leading-relaxed max-w-lg mx-auto">
            Your order has been recorded in our system. Please contact our Admin via WhatsApp to get the exact shipping cost to your location and the final payment instructions.
          </p>

          <a
            href={`https://wa.me/6281234567890?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full max-w-sm mx-auto bg-emerald-500 hover:bg-emerald-400 text-[#050505] text-center py-4 rounded-xl text-xs uppercase tracking-widest font-bold transition-colors cursor-pointer"
          >
            Chat Admin for Payment
          </a>
        </div>

        {/* Ringkasan Item & Alamat Pengiriman */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#ececec]/50 border-b border-[#1f1f1f] pb-3">
              <ShoppingBag className="w-4 h-4" /> Ordered Items ({order.items.length})
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {order.items.map((item) => {
                const product = item.product as Record<string, unknown>;
                const productImage =
                  (product?.image as string) ||
                  ((product?.images as string[])?.[0]) ||
                  (product?.imageUrl as string) ||
                  "/images/placeholder.jpg";

                return (
                  <div key={item.id} className="flex items-center gap-3 text-xs">
                    <div className="relative w-12 h-12 bg-[#181818] rounded-lg overflow-hidden shrink-0 border border-[#1f1f1f]">
                      <Image src={productImage} alt={(product?.name as string) || "Product"} fill className="object-cover" />
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium uppercase line-clamp-1">{(product?.name as string) || "Item"}</p>
                      <p className="text-[10px] text-[#ececec]/50 font-mono">
                        {item.quantity} x ${item.price.toFixed(2)}
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
            <p className="text-xs text-[#ececec]/70 leading-relaxed font-light">
              {order.address || "No address specified"}
            </p>
          </div>
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