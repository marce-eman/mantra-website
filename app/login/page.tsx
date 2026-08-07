"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account/orders";
  const { login } = useUserStore();

  const [whatsapp, setWhatsapp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMockLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsapp && !e.currentTarget.classList.contains('google-btn')) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      login({ id: "user_1", name: "Guest User", email: "guest@example.com" });
      router.push(redirectUrl);
    }, 1000);
  };

  return (
    <>
        <form onSubmit={handleMockLogin} className="space-y-6">
          <div>
            <label className="block text-[#ececec] text-xs uppercase tracking-widest mb-2">
              WhatsApp Number
            </label>
            <input 
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+62 812..."
              className="w-full bg-[#111111] border border-[#1f1f1f] text-[#ececec] p-4 text-sm focus:outline-none focus:border-[#ececec] transition-colors"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#ececec] text-[#050505] py-4 uppercase tracking-widest font-bold hover:bg-white transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Authenticating..." : "Continue with WhatsApp"}
          </button>
        </form>

        <div className="my-8 flex items-center">
          <div className="flex-1 border-t border-[#1f1f1f]"></div>
          <span className="px-4 text-[#ececec]/40 text-xs uppercase tracking-widest">Or</span>
          <div className="flex-1 border-t border-[#1f1f1f]"></div>
        </div>

        <button 
          onClick={handleMockLogin}
          className="google-btn w-full border border-[#1f1f1f] bg-transparent text-[#ececec] py-4 uppercase tracking-widest font-bold hover:bg-[#1f1f1f] transition-colors flex justify-center items-center space-x-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z" />
          </svg>
          <span>Continue with Google</span>
        </button>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#050505] px-4">
      <div className="w-full max-w-md border border-[#1f1f1f] bg-[#050505] p-8 md:p-12">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-black text-[#ececec] uppercase tracking-widest mb-2">
            Enter the Void
          </h1>
          <p className="text-[#ececec]/60 text-xs uppercase tracking-widest">
            Identify yourself to proceed.
          </p>
        </div>

        <Suspense fallback={<div className="text-[#ececec] text-center text-xs uppercase tracking-widest">Loading...</div>}>
          <LoginContent />
        </Suspense>
        
        <p className="mt-8 text-center text-[#ececec]/40 text-[10px] uppercase tracking-widest leading-loose">
          By continuing, you agree to MANTRA's <br />
          <a href="/terms" className="underline hover:text-white">Terms of Service</a> & <a href="/faq" className="underline hover:text-white">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

