"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyOrderButtonProps {
  textToCopy: string;
  className?: string;
}

export default function CopyOrderButton({ textToCopy, className }: CopyOrderButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center justify-center p-1.5 hover:bg-[#222222] text-[#ececec]/50 hover:text-white rounded-lg transition-all cursor-pointer border border-transparent hover:border-[#2a2a2a] shrink-0",
        copied && "text-emerald-400 border-emerald-900/40 bg-emerald-950/20",
        className
      )}
      title={copied ? "Copied!" : "Copy Order ID"}
      aria-label="Copy Order ID"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-400 animate-in zoom-in duration-200" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}