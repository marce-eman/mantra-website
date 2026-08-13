import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CheckCircle2, ArrowRight, CreditCard, ShoppingBag, Truck } from "lucide-react";

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

  const waText = encodeURIComponent(
    `Halo Admin MANTRA, saya sudah melakukan pembayaran untuk Order ID: #${order.id.toUpperCase()} sejumlah Rp ${order.totalAmount.toLocaleString("id-ID")}.`
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

          <div className="pt-2">
            <span className="text-[10px] font-mono text-[#ececec]/40 uppercase tracking-widest block">ORDER REFERENCE</span>
            <span className="text-base md:text-lg font-mono font-bold text-[#ececec] tracking-wider select-all">
              #{order.id.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Instruksi Pembayaran Transfer Bank */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-4">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-widest">PAYMENT INSTRUCTIONS</h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              ACTION REQUIRED
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#ececec]/60 uppercase tracking-widest">Total Payment</span>
              <span className="text-lg font-mono font-bold text-emerald-400">
                Rp {order.totalAmount.toLocaleString("id-ID")}
              </span>
            </div>

            <div className="bg-[#111111] border border-[#1f1f1f] p-4 rounded-xl space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#ececec]/50 uppercase">Bank Destination</span>
                <span className="font-bold">BCA (Bank Central Asia)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#ececec]/50 uppercase">Account Number</span>
                <span className="font-mono font-bold text-[#ececec] tracking-wider">123-456-7890</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#ececec]/50 uppercase">Account Name</span>
                <span className="font-bold">MANTRA OFFICIAL</span>
              </div>
            </div>

            <p className="text-[11px] text-[#ececec]/50 font-light leading-relaxed">
              Silakan transfer tepat sesuai nominal di atas dalam kurun waktu 24 jam. Setelah melakukan transfer, harap lakukan konfirmasi pembayaran via WhatsApp.
            </p>

            <a
              href={`https://wa.me/6281234567890?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-emerald-500 hover:bg-emerald-400 text-[#050505] text-center py-3 rounded-xl text-xs uppercase tracking-widest font-bold transition-colors cursor-pointer"
            >
              Confirm Payment via WhatsApp
            </a>
          </div>
        </div>

        {/* Ringkasan Item & Alamat Pengiriman */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Purchased Items */}
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
                      <Image
                        src={productImage}
                        alt={(product?.name as string) || "Product"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium uppercase line-clamp-1">
                        {(product?.name as string) || "Item"}
                      </p>
                      <p className="text-[10px] text-[#ececec]/50 font-mono">
                        {item.quantity} x Rp {item.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipping Address */}
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
            href="/account/orders"
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