"use client";

import React, { createContext, useContext, useState } from "react";
import { useSession } from "next-auth/react";
import { Eye, Edit3, CheckCircle2, AlertCircle, X, Sparkles, ChevronRight, ChevronLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface InlineEditContextType {
  isAdmin: boolean;
  isEditMode: boolean;
  toggleEditMode: () => void;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const InlineEditContext = createContext<InlineEditContextType>({
  isAdmin: false,
  isEditMode: false,
  toggleEditMode: () => {},
  showToast: () => {},
});

export const useInlineEdit = () => useContext(InlineEditContext);

export function InlineEditProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const isAdmin = status === "authenticated" && session?.user?.role?.toUpperCase() === "ADMIN";

  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pathname = usePathname();
  const isInsideAdmin = pathname?.startsWith("/admin");

  const toggleEditMode = () => {
    setIsEditMode((prev) => !prev);
  };

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <InlineEditContext.Provider
      value={{
        isAdmin,
        isEditMode: isAdmin && isEditMode,
        toggleEditMode,
        showToast,
      }}
    >
      {children}

      {/* Floating Admin Live CMS Indicator Bar (Positioned above floating chat on mobile) */}
      {isAdmin && !isInsideAdmin && (
        <div className="fixed bottom-24 left-4 md:bottom-6 md:left-6 z-40 flex flex-col items-start gap-2 pointer-events-auto select-none max-w-[calc(100vw-2rem)]">
          {isMinimized ? (
            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="flex items-center gap-1.5 bg-[#0a0a0a]/95 backdrop-blur-xl border border-pink-500/50 px-3.5 py-2.5 sm:py-1.5 min-h-[44px] sm:min-h-0 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.3)] text-pink-400 font-mono text-[10px] font-bold tracking-wider hover:bg-[#151515] transition-all cursor-pointer"
              title="Expand Live CMS Controls"
            >
              <Image
                src="/images/ICON CHROME 1.png"
                alt="Mantra"
                width={12}
                height={12}
                className="object-contain animate-pulse"
              />
              <span>CMS</span>
              <ChevronRight className="w-3.5 h-3.5 text-pink-300" />
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-[#0a0a0a]/95 backdrop-blur-xl border border-pink-500/40 px-3 md:px-4 py-2 md:py-2 min-h-[44px] sm:min-h-0 rounded-full shadow-[0_0_25px_rgba(236,72,153,0.25)] text-xs font-mono transition-all">
              <div className="flex items-center gap-1.5 text-pink-400 font-bold tracking-widest text-[10px]">
                <Image
                  src="/images/ICON CHROME 1.png"
                  alt="Mantra"
                  width={13}
                  height={13}
                  className="object-contain animate-pulse"
                />
                <span className="hidden xs:inline">LIVE CMS</span>
              </div>

              <div className="h-3 w-[1px] bg-[#333]" />

              <button
                type="button"
                onClick={toggleEditMode}
                className={`flex items-center gap-1.5 px-3 md:px-3 py-1.5 md:py-1 rounded-full text-[9px] uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                  isEditMode
                    ? "bg-pink-500/20 text-pink-300 border border-pink-500/60 hover:bg-pink-500/30"
                    : "bg-[#1a1a1a] text-[#888] border border-[#333] hover:text-white"
                }`}
                title="Toggle Live Visual Editing Markers"
              >
                {isEditMode ? (
                  <>
                    <Edit3 className="w-3 h-3 text-pink-400" /> <span className="hidden sm:inline">EDIT MODE:</span> ON
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3 text-gray-400" /> PREVIEW
                  </>
                )}
              </button>

              <div className="h-3 w-[1px] bg-[#333]" />

              <Link
                href="/admin"
                className="text-[#ececec]/60 hover:text-pink-400 text-[9px] uppercase tracking-wider transition-colors px-1 py-1 whitespace-nowrap"
              >
                DASHBOARD &rarr;
              </Link>

              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="text-[#666] hover:text-white p-1 ml-0.5 cursor-pointer transition-colors"
                title="Minimize Live CMS bar"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed top-6 right-6 z-[10000] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl text-xs font-mono transition-all animate-in slide-in-from-top-3 ${
              toast.type === "success"
                ? "bg-[#0a0a0a]/95 border-emerald-500/50 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                : toast.type === "error"
                ? "bg-[#0a0a0a]/95 border-red-500/50 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                : "bg-[#0a0a0a]/95 border-pink-500/50 text-pink-300 shadow-[0_0_20px_rgba(236,72,153,0.2)]"
            }`}
          >
            {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === "error" && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
            {toast.type === "info" && <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />}
            <span className="leading-snug">{toast.message}</span>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-[#666] hover:text-white ml-2 cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </InlineEditContext.Provider>
  );
}
