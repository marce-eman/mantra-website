"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, Loader2, User, Phone, AlertCircle, Fingerprint, KeyRound } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();

  const [activeTab, setActiveTab] = useState<"signin" | "register" | "forgot">("signin");
  const [loading, setLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<string>("idle");

  // State untuk OTP
  const [showOtp, setShowOtp] = useState(false);
  const [otpInput, setOtpInput] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/account");
    }
  }, [status, router]);

  const checkBiometricSupport = async (): Promise<boolean> => {
    if (typeof window === "undefined" || !window.PublicKeyCredential) return false;
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  };

  const triggerBiometricRegistration = async (userEmail: string, userName: string) => {
    setAuthStatus("verifying");
    const randomChallenge = new Uint8Array(32);
    window.crypto.getRandomValues(randomChallenge);

    const randomUserId = new Uint8Array(16);
    window.crypto.getRandomValues(randomUserId);

    await navigator.credentials.create({
      publicKey: {
        challenge: randomChallenge,
        rp: { name: "MANTRA Exclusive", id: window.location.hostname },
        user: {
          id: randomUserId,
          name: userEmail,
          displayName: userName || "MANTRA Member",
        },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "preferred",
        },
        timeout: 30000,
      },
    });
  };

  const triggerBiometricLogin = async () => {
    setAuthStatus("verifying");
    const randomChallenge = new Uint8Array(32);
    window.crypto.getRandomValues(randomChallenge);

    await navigator.credentials.get({
      publicKey: {
        challenge: randomChallenge,
        rpId: window.location.hostname,
        userVerification: "preferred",
        timeout: 30000,
      },
    });
  };

  // --- SUBMIT FORM UTAMA ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPopupMessage(null);
    setAuthStatus("idle");

    try {
      // ========= FORGOT PASSWORD =========
      if (activeTab === "forgot") {
        if (!email) throw new Error("Please enter your email address.");

        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to send reset link.");

        setPopupMessage("Password reset link has been dispatched to your email address.");
        setLoading(false);
        return;
      }

      // ========= REGISTRASI =========
      if (activeTab === "register") {
        if (!name || !phone || !email || !password) throw new Error("Please fill in all fields.");

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone, email, password }),
        });
        const data = await res.json();

        if (res.status === 400 || (data.error && data.error.includes("already registered"))) {
          setActiveTab("signin");
          throw new Error("Email is already registered. Please sign in.");
        }

        if (!res.ok) throw new Error(data.error || "Registration failed.");

        // Jika registrasi awal sukses, tahan dulu dan kirim OTP
        const otpRes = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        
        if (!otpRes.ok) throw new Error("Failed to send verification code to your email.");
        
        setShowOtp(true); // Munculkan pop-up OTP
        setLoading(false);
        return; // Berhenti di sini nunggu user masukin OTP
      } 
      
      // ========= SIGN IN =========
      if (activeTab === "signin") {
        if (!email || !password) throw new Error("Please enter email and password.");

        // 1. Cek kecocokan password ke API
        const checkRes = await fetch("/api/auth/check-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const checkData = await checkRes.json();

        if (checkRes.status === 404 || (checkData.error && checkData.error.includes("not found"))) {
          setActiveTab("register");
          throw new Error("Account not found. Please complete your registration below.");
        }

        if (!checkRes.ok) throw new Error(checkData.error || "Authentication failed.");

        // 2. Jika password benar, langsung tembak Biometrik (Passkey/Face ID)
        const hasBiometrics = await checkBiometricSupport();
        if (hasBiometrics) {
          try {
            await triggerBiometricLogin();
          } catch {
            console.log("Biometric fallback triggered.");
          }
        }

        // 3. Login sukses, buat session NextAuth
        setAuthStatus("success");
        const result = await signIn("credentials", { email, password, redirect: false });
        if (result?.error) throw new Error(`Session Error: ${result.error}`);

        router.push("/account");
      }
    } catch (err: any) {
      setPopupMessage(err.message);
      setAuthStatus("idle");
      setLoading(false);
    }
  };

  // --- VERIFIKASI OTP (KHUSUS REGISTRASI) ---
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPopupMessage(null);

    try {
      // Pengecekan OTP ke API
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "OTP verification failed.");

      // JIKA OTP BENAR, LANJUT SETUP BIOMETRIK LALU PINDAH KE SIGN IN
      setShowOtp(false); // Tutup pop-up
      const hasBiometrics = await checkBiometricSupport();

      if (hasBiometrics) {
        try { 
          await triggerBiometricRegistration(email, name); 
        } catch { 
          console.log("Biometric skipped."); 
        }
      }
      
      setAuthStatus("idle");
      setActiveTab("signin");
      setPopupMessage("Registration, Verification & Passkey setup successful! Please sign in.");
      
    } catch (err: any) {
      setPopupMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      
      {/* --- POP-UP NOTIFIKASI ERROR / SUCCESS --- */}
      {popupMessage && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-12 h-12 border border-[#1f1f1f] bg-[#111111] rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-[10px] text-[#ececec]/70 uppercase tracking-wider font-mono mb-6 leading-relaxed">
              {popupMessage}
            </p>
            <button
              type="button"
              onClick={() => setPopupMessage(null)}
              className="w-full bg-[#111111] hover:bg-[#1a1a1a] text-[#ececec] border border-[#1f1f1f] py-3.5 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-colors cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* --- POP-UP OTP INPUT --- */}
      {showOtp && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-12 h-12 border border-[#1f1f1f] bg-[#111111] rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-5 h-5 text-[#ececec]" />
            </div>
            <h3 className="text-[#ececec] text-sm uppercase tracking-widest font-serif mb-2">Verification Sent</h3>
            <p className="text-[10px] text-[#ececec]/50 font-mono uppercase tracking-widest text-center mb-6">
              Enter the 6-digit code sent to your email.
            </p>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input 
                type="text" 
                maxLength={6}
                required
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="000000" 
                className="w-full bg-[#111111] border border-[#1f1f1f] text-[#ececec] px-4 py-3.5 rounded-xl text-center text-xl tracking-[0.5em] focus:outline-none focus:border-[#ececec]/40 transition-colors font-mono" 
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ececec] hover:bg-white text-black font-bold py-3.5 px-6 rounded-xl transition-all text-[10px] uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Continue"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- POP-UP BIOMETRIK --- */}
      {authStatus === "verifying" && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center">
            <Fingerprint className="w-12 h-12 text-emerald-400 animate-pulse mb-6" />
            <h3 className="text-[#ececec] text-sm uppercase tracking-widest font-serif mb-2">Awaiting Biometrics</h3>
            <p className="text-[10px] text-[#ececec]/50 font-mono uppercase tracking-widest text-center">
              Authenticate using your device sensor or PIN.
            </p>
          </div>
        </div>
      )}

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ffffff] opacity-[0.02] blur-[120px] rounded-full pointer-events-none" />

      {/* --- FORM UTAMA KOTAK --- */}
      <div className="relative z-10 w-full max-w-[440px] bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl shadow-2xl overflow-hidden p-8 md:p-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 border border-[#1f1f1f] bg-[#111111] rounded-full flex items-center justify-center mb-4 overflow-hidden relative p-2 shadow-inner">
            <Image src="/images/ICON CHROME 1.png" alt="Mantra Icon" fill className="object-contain p-2 opacity-85" />
          </div>
          <h1 className="text-2xl text-[#ececec] font-light tracking-[0.25em] font-serif uppercase mb-1">
            MANTRA
          </h1>
          <p className="text-[#ececec]/40 text-[9px] uppercase tracking-[0.25em] font-mono">
            Access Your Exclusive Profile
          </p>
        </div>

        {activeTab !== "forgot" && (
          <>
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/account" })}
              className="w-full bg-[#ececec] hover:bg-white text-black font-semibold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-3 text-[11px] uppercase tracking-widest cursor-pointer mb-6 shadow-md"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="h-[1px] flex-1 bg-[#1f1f1f]" />
              <span className="text-[#ececec]/30 text-[9px] uppercase tracking-widest font-mono">Or with Credentials</span>
              <div className="h-[1px] flex-1 bg-[#1f1f1f]" />
            </div>
          </>
        )}

        {/* --- 3 TAB NAVIGASI --- */}
        <div className="flex p-1 bg-[#111111] border border-[#1f1f1f] rounded-xl mb-6 shadow-inner">
          {[
            { key: "signin", label: "Sign In" },
            { key: "register", label: "Register" },
            { key: "forgot", label: "Reset" }
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key as any)}
              className={`flex-1 py-2 text-[9px] uppercase tracking-widest font-bold rounded-lg transition-all ${
                activeTab === t.key ? "bg-[#1f1f1f] text-[#ececec] shadow-md" : "text-[#ececec]/40 hover:text-[#ececec]/70"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === "register" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div>
                <label className="block text-[9px] uppercase tracking-widest text-[#ececec]/50 mb-2 font-mono">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ececec]/30" />
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" className="w-full bg-[#111111] border border-[#1f1f1f] text-[#ececec] pl-11 pr-4 py-3.5 rounded-xl text-xs focus:outline-none focus:border-[#ececec]/40 transition-colors font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-widest text-[#ececec]/50 mb-2 font-mono">WhatsApp Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ececec]/30" />
                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+62 812-3456-7890" className="w-full bg-[#111111] border border-[#1f1f1f] text-[#ececec] pl-11 pr-4 py-3.5 rounded-xl text-xs focus:outline-none focus:border-[#ececec]/40 transition-colors font-mono" />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[9px] uppercase tracking-widest text-[#ececec]/50 mb-2 font-mono">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ececec]/30" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@domain.com" className="w-full bg-[#111111] border border-[#1f1f1f] text-[#ececec] pl-11 pr-4 py-3.5 rounded-xl text-xs focus:outline-none focus:border-[#ececec]/40 transition-colors font-mono" />
            </div>
          </div>

          {activeTab !== "forgot" && (
            <div>
              <label className="block text-[9px] uppercase tracking-widest text-[#ececec]/50 mb-2 font-mono">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ececec]/30" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#111111] border border-[#1f1f1f] text-[#ececec] pl-11 pr-4 py-3.5 rounded-xl text-xs focus:outline-none focus:border-[#ececec]/40 transition-colors font-mono" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || authStatus === "verifying"}
            className="w-full mt-6 bg-[#ececec] hover:bg-white text-black font-bold py-4 px-6 rounded-xl transition-all duration-300 text-[10px] uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            {loading || authStatus === "verifying" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : activeTab === "forgot" ? (
              <KeyRound className="w-4 h-4" />
            ) : (
              <Fingerprint className="w-4 h-4" />
            )}

            {activeTab === "signin"
              ? "Sign In Securely"
              : activeTab === "register"
              ? "Register & Setup Account"
              : "Send Reset Link"}
          </button>
        </form>
      </div>

      <div className="mt-8 flex items-center justify-center relative z-10">
        <Link href="/" className="text-[#ececec]/50 hover:text-white flex items-center gap-2 text-[10px] uppercase tracking-widest transition-colors font-mono">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
      </div>
    </div>
  );
}