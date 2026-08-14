"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyOrderButton({ textToCopy }: { textToCopy: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-[#111111] hover:bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-[10px] uppercase tracking-widest transition-colors mx-auto cursor-pointer"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400 font-bold">ID Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-400 font-bold">Copy Order ID</span>
        </>
      )}
    </button>
  );
}