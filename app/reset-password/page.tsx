"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Image from "next/image";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return setPopupMessage("All fields are required.");
    if (password !== confirmPassword) return setPopupMessage("Passwords do not match.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed.");

      setIsSuccess(true);
      setPopupMessage("Password updated successfully! Please sign in.");
    } catch (err: any) {
      setPopupMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-[440px] bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl shadow-2xl p-8 md:p-10">
      {popupMessage && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-12 h-12 border border-[#1f1f1f] bg-[#111111] rounded-full flex items-center justify-center mx-auto mb-4">
              {isSuccess ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
            </div>
            <p className="text-[10px] text-[#ececec]/70 uppercase tracking-wider font-mono mb-6 leading-relaxed">
              {popupMessage}
            </p>
            <button
              type="button"
              onClick={() => {
                setPopupMessage(null);
                if (isSuccess) router.push("/login");
              }}
              className="w-full bg-[#111111] hover:bg-[#1a1a1a] text-[#ececec] border border-[#1f1f1f] py-3.5 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-colors"
            >
              {isSuccess ? "Proceed to Login" : "OK"}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 border border-[#1f1f1f] bg-[#111111] rounded-full flex items-center justify-center mb-4 overflow-hidden relative p-2 shadow-inner">
          <Image src="/images/ICON CHROME 1.png" alt="Mantra Icon" fill className="object-contain p-2 opacity-85" />
        </div>
        <h1 className="text-2xl text-[#ececec] font-light tracking-[0.25em] font-serif uppercase mb-1">MANTRA</h1>
        <p className="text-[#ececec]/40 text-[9px] uppercase tracking-[0.25em] font-mono">Create New Password</p>
      </div>

      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label className="block text-[9px] uppercase tracking-widest text-[#ececec]/50 mb-2 font-mono">New Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ececec]/30" />
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#111111] border border-[#1f1f1f] text-[#ececec] pl-11 pr-4 py-3.5 rounded-xl text-xs focus:outline-none font-mono" />
          </div>
        </div>

        <div>
          <label className="block text-[9px] uppercase tracking-widest text-[#ececec]/50 mb-2 font-mono">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ececec]/30" />
            <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#111111] border border-[#1f1f1f] text-[#ececec] pl-11 pr-4 py-3.5 rounded-xl text-xs focus:outline-none font-mono" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-[#ececec] hover:bg-white text-black font-bold py-4 px-6 rounded-xl transition-all text-[10px] uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      <Suspense fallback={<div className="text-xs font-mono text-white/40">Loading security parameters...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}