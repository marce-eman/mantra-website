"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { CreditCard, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    snap: any;
  }
}

interface PayNowButtonProps {
  orderId: string;
  snapToken?: string | null;
  className?: string;
  label?: string;
}

export default function PayNowButton({
  orderId,
  snapToken: initialSnapToken,
  className,
  label = "Bayar Sekarang",
}: PayNowButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const handlePay = async () => {
    setLoading(true);
    setMessage(null);

    try {
      let token = initialSnapToken;

      // If token is not preloaded, fetch/generate it via API
      if (!token) {
        const res = await fetch(`/api/orders/${orderId}/pay`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();

        if (!data.success || !data.snapToken) {
          throw new Error(data.error || "Gagal memuat token pembayaran.");
        }

        token = data.snapToken;
      }

      if (!token) {
        throw new Error("Token pembayaran tidak ditemukan.");
      }

      // Check window.snap
      if (typeof window !== "undefined" && window.snap && typeof window.snap.pay === "function") {
        window.snap.pay(token, {
          onSuccess: (result: any) => {
            console.log("[MIDTRANS SUCCESS]:", result);
            setMessage({ type: "success", text: "Pembayaran berhasil dikonfirmasi!" });
            setLoading(false);
            router.refresh();
          },
          onPending: (result: any) => {
            console.log("[MIDTRANS PENDING]:", result);
            setMessage({ type: "info", text: "Menunggu penyelesaian pembayaran..." });
            setLoading(false);
            router.refresh();
          },
          onError: (result: any) => {
            console.error("[MIDTRANS ERROR]:", result);
            setMessage({ type: "error", text: "Pembayaran gagal atau ditolak. Silakan coba lagi." });
            setLoading(false);
          },
          onClose: () => {
            setMessage({
              type: "info",
              text: "Pembayaran belum diselesaikan. Anda dapat mencoba bayar lagi kapan saja.",
            });
            setLoading(false);
          },
        });
      } else {
        setMessage({
          type: "error",
          text: "Sistem pembayaran Midtrans sedang memuat. Silakan coba beberapa saat lagi.",
        });
        setLoading(false);
      }
    } catch (err: any) {
      console.error("[PAY NOW ERROR]:", err);
      setMessage({
        type: "error",
        text: err?.message || "Terjadi kesalahan saat memulai pembayaran.",
      });
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />

      <div className="flex flex-col gap-2">
        <button
          onClick={handlePay}
          disabled={loading}
          className={cn(
            "inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all shadow-md shadow-emerald-950/30 cursor-pointer disabled:opacity-50",
            className
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Membuka Snap...
            </>
          ) : (
            <>
              <CreditCard className="w-3.5 h-3.5" /> {label}
            </>
          )}
        </button>

        {message && (
          <div
            className={cn(
              "text-[11px] p-2 rounded-lg border font-mono flex items-center gap-1.5",
              message.type === "success" && "bg-emerald-950/50 border-emerald-800/50 text-emerald-400",
              message.type === "error" && "bg-red-950/50 border-red-800/50 text-red-400",
              message.type === "info" && "bg-amber-950/50 border-amber-800/50 text-amber-400"
            )}
          >
            {message.type === "success" && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
            {message.type === "error" && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
            {message.type === "info" && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}
      </div>
    </>
  );
}
