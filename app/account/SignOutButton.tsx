"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="w-full flex items-center gap-3 px-4 py-3 bg-[#0a0a0a] border border-red-900/30 hover:border-red-600/60 rounded-xl text-xs uppercase tracking-widest text-red-400 transition-colors cursor-pointer"
    >
      <LogOut className="w-4 h-4 text-red-400" />
      <span>Sign Out</span>
    </button>
  );
}