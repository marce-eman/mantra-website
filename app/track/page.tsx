"use client";

import { useState } from "react";
import { Search, Clock, Package, Truck, CheckCircle2, XCircle, ExternalLink, MapPin } from "lucide-react";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`/api/track?order=${orderNumber}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Order not found. Please check your Order ID.");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Daftar tahapan status pesanan
  const steps = [
    { key: "PENDING", label: "Pending" },
    { key: "PAID", label: "Paid" },
    { key: "SHIPPED", label: "Shipped" },
    { key: "COMPLETED", label: "Completed" },
  ];

  const statusOrder = ["PENDING", "PAID", "SHIPPED", "COMPLETED"];
  const currentStatus = result?.status?.toUpperCase();
  const currentIndex = statusOrder.indexOf(currentStatus);

  // Fungsi untuk menentukan status visual tiap titik timeline
  const getStepStatus = (stepKey: string) => {
    if (currentStatus === "CANCELED") return "canceled";
    const stepIndex = statusOrder.indexOf(stepKey);

    if (stepIndex < currentIndex) return "completed"; // Sudah terlewati
    if (stepIndex === currentIndex) return "current";   // Posisi saat ini
    return "upcoming";                                  // Belum sampai
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#ececec] flex flex-col items-center justify-center p-6 border-t border-[#1f1f1f]">
      <div className="w-full max-w-xl bg-[#0a0a0a] border border-[#1f1f1f] p-8 md:p-10 rounded-2xl shadow-2xl">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#111111] rounded-full flex items-center justify-center mb-4 border border-[#1f1f1f]">
            <Search className="w-5 h-5 text-[#ececec]/60" />
          </div>
          <h1 className="text-2xl font-light text-center tracking-widest uppercase font-serif">Track Order</h1>
          <p className="text-[#ececec]/50 text-center text-xs uppercase tracking-widest mt-2 font-mono">
            Locate your parcel in the void
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="ENTER ORDER ID (e.g. MTR-...)"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="flex-1 bg-[#111111] border border-[#1f1f1f] rounded-xl px-4 py-3.5 text-[#ececec] focus:outline-none focus:border-[#ececec]/50 uppercase tracking-widest font-mono text-xs transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#ececec] text-[#050505] font-bold px-6 py-3.5 rounded-xl hover:bg-white transition-colors disabled:opacity-50 uppercase tracking-widest text-xs flex justify-center items-center gap-2 cursor-pointer shrink-0"
          >
            {loading ? (
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 animate-spin" /> Searching...</span>
            ) : (
              "Track"
            )}
          </button>
        </form>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mt-6 p-4 bg-red-950/30 border border-red-900/50 text-red-400 text-xs uppercase tracking-widest rounded-xl text-center flex items-center justify-center gap-2 font-mono">
            <XCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {/* TRACKING RESULT SECTION */}
        {result && (
          <div className="mt-8 border-t border-[#1f1f1f] pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* SPECIAL CASE: CANCELED */}
            {currentStatus === "CANCELED" ? (
              <div className="flex items-center gap-4 p-5 rounded-xl border bg-red-950/20 border-red-950 mb-8">
                <div className="p-3 rounded-full bg-black/50 text-red-400 border border-red-900/50">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-red-400/60 font-mono block mb-1">
                    Order Status
                  </span>
                  <h3 className="text-lg font-bold uppercase tracking-widest text-red-400">
                    Canceled
                  </h3>
                </div>
              </div>
            ) : (
              /* TIMELINE PROGRESS BAR */
              <div className="mb-10 px-2">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#ececec]/50 font-mono mb-6">
                  Order Progression
                </div>
                
                <div className="relative flex items-center justify-between w-full">
                  
                  {/* Background Track Line */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-[#1f1f1f] z-0" />
                  
                  {/* Active Progress Line */}
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#ececec] transition-all duration-500 z-0"
                    style={{ 
                      width: `${(Math.max(0, currentIndex) / (steps.length - 1)) * 100}%` 
                    }}
                  />

                  {/* Steps Nodes */}
                  {steps.map((step, idx) => {
                    const stepState = getStepStatus(step.key);
                    const isDone = stepState === "completed" || stepState === "current";

                    return (
                      <div key={step.key} className="relative z-10 flex flex-col items-center">
                        <div 
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono transition-all duration-300 border ${
                            isDone 
                              ? "bg-[#ececec] text-[#050505] border-white shadow-lg shadow-white/10 scale-110" 
                              : "bg-[#111111] text-[#ececec]/40 border-[#2a2a2a]"
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : (idx + 1)}
                        </div>
                        <span className={`absolute -bottom-6 text-[10px] uppercase tracking-widest whitespace-nowrap font-mono ${
                          isDone ? "text-[#ececec] font-bold" : "text-[#ececec]/40"
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-10" /> {/* Spacer buat label bawah */}
              </div>
            )}
            
            {/* Order Details Grid */}
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 space-y-4 text-xs font-mono">
              <div className="flex justify-between items-center border-b border-[#1f1f1f] pb-3">
                <span className="text-[#ececec]/50 uppercase tracking-widest">
                  Order ID
                </span>
                <span className="font-bold text-[#ececec]">{result.orderNumber}</span>
              </div>

              <div className="flex justify-between items-center border-b border-[#1f1f1f] pb-3">
                <span className="text-[#ececec]/50 uppercase tracking-widest">
                   Recipient
                </span>
                <span className="font-bold text-[#ececec]">{result.recipientName}</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-[#1f1f1f] pb-3">
                <span className="text-[#ececec]/50 uppercase tracking-widest flex items-center gap-2">
                  <Package className="w-3.5 h-3.5" /> Courier
                </span>
                <span className="uppercase font-bold text-[#ececec]">{result.courier || "Pending"}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[#ececec]/50 uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" /> Tracking No.
                </span>
                <span className="font-mono font-bold text-emerald-400 bg-emerald-950/30 px-3 py-1 rounded border border-emerald-900/50">
                  {result.trackingNumber || "Awaiting Update"}
                </span>
              </div>
            </div>

            {/* EXTERNAL LIVE TRACKING BUTTON */}
            {result.trackingNumber && result.courier && (
              <a
                href={`https://parcelsapp.com/en/tracking/${result.trackingNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full flex items-center justify-center gap-2 border border-[#2a2a2a] text-[#ececec] py-3.5 rounded-xl hover:bg-[#111111] transition-colors text-xs uppercase tracking-widest font-bold cursor-pointer"
              >
                Live Tracking <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}