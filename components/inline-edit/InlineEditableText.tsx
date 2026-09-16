"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, X, Loader2, Sparkles } from "lucide-react";
import { useInlineEdit } from "./InlineEditContext";
import { updateInlineContentAction } from "@/app/actions/inlineEdit";

interface InlineEditableTextProps {
  type: "article" | "episode" | "setting";
  id: string;
  field: string;
  label: string;
  value: string;
  multiline?: boolean;
  rows?: number;
  className?: string;
  as?: "span" | "div" | "p" | "h1" | "h2" | "h3";
  children: React.ReactNode;
  onSaveSuccess?: (newValue: string) => void;
}

export function InlineEditableText({
  type,
  id,
  field,
  label,
  value,
  multiline = false,
  rows = 4,
  className = "",
  as = "span",
  children,
  onSaveSuccess,
}: InlineEditableTextProps) {
  const router = useRouter();
  const { isEditMode, showToast } = useInlineEdit();

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentText, setCurrentText] = useState(value || "");
  const [tempText, setTempText] = useState(value || "");
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentText(value || "");
  }, [value]);

  useEffect(() => {
    if (isOpen) {
      setTempText(currentText);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, currentText]);

  // If edit mode is disabled or user is not admin, render pure children
  if (!isEditMode) {
    return <>{children}</>;
  }

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleClose = () => {
    if (isSaving) return;
    setIsOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSaving) return;
    setIsSaving(true);

    try {
      const res = await updateInlineContentAction({
        type,
        id,
        field,
        value: tempText,
      });

      if (res.success) {
        setCurrentText(tempText);
        showToast(`${label} updated successfully.`, "success");
        if (onSaveSuccess) {
          onSaveSuccess(tempText);
        }
        setIsOpen(false);
        router.refresh();
      } else {
        showToast(res.error || "Failed to save changes.", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "An error occurred while saving.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const Tag = as as keyof React.JSX.IntrinsicElements;

  return (
    <>
      <Tag
        onClick={handleOpen}
        className={`${
          as === "span" ? "inline-block" : "block"
        } relative group/inline-edit transition-all duration-200 cursor-pointer rounded-lg hover:outline-dashed hover:outline-2 hover:outline-pink-500 hover:outline-offset-4 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)] ${className}`}
        title={`Click to edit ${label}`}
      >
        {/* Rendered Children Content */}
        {children}

        {/* Brutalist Pink Edit Badge with Mantra Icon */}
        <span className="absolute -top-3 right-2 opacity-0 group-hover/inline-edit:opacity-100 transition-all duration-200 pointer-events-none z-30 inline-flex items-center gap-1.5 bg-black/95 text-pink-400 border border-pink-500/80 px-2 py-0.5 rounded shadow-[0_0_12px_rgba(236,72,153,0.4)] backdrop-blur-md">
          <Image
            src="/images/ICON CHROME 1.png"
            alt="Mantra"
            width={11}
            height={11}
            className="object-contain opacity-90 animate-pulse"
          />
          <span className="text-[9px] font-mono font-bold tracking-widest uppercase">
            [ EDIT // {label.toUpperCase()} ]
          </span>
        </span>
      </Tag>

      {/* Editor Modal Portal */}
      {mounted && isOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 pointer-events-auto"
              onClick={handleClose}
            >
              <div
                className="relative w-full max-w-2xl bg-[#090909] border border-pink-500/40 rounded-2xl p-6 shadow-[0_0_60px_rgba(236,72,153,0.2)] font-mono text-[#ececec] animate-in zoom-in-95 duration-200 pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-4 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center">
                      <Image
                        src="/images/ICON CHROME 1.png"
                        alt="Mantra"
                        width={18}
                        height={18}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <div className="text-[10px] text-pink-400 uppercase tracking-widest font-bold">
                        CMS LIVE EDIT
                      </div>
                      <h3 className="text-base font-semibold text-white tracking-wide uppercase">
                        EDIT // [ {label} ]
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSaving}
                    className="p-1.5 rounded-lg bg-[#141414] hover:bg-[#222] border border-[#262626] text-[#888] hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#ececec]/60 mb-2 font-medium">
                      CONTENT ({multiline ? "PARAGRAPH / MULTILINE" : "SINGLE LINE TEXT"}):
                    </label>

                    {multiline ? (
                      <textarea
                        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                        rows={rows}
                        value={tempText}
                        onChange={(e) => setTempText(e.target.value)}
                        disabled={isSaving}
                        placeholder={`Enter ${label}...`}
                        className="w-full bg-[#111111] border border-[#2a2a2a] focus:border-pink-500 rounded-xl p-4 text-sm text-[#ececec] font-sans leading-relaxed focus:outline-none focus:ring-1 focus:ring-pink-500 transition-all resize-y"
                      />
                    ) : (
                      <input
                        ref={inputRef as React.RefObject<HTMLInputElement>}
                        type="text"
                        value={tempText}
                        onChange={(e) => setTempText(e.target.value)}
                        disabled={isSaving}
                        placeholder={`Enter ${label}...`}
                        className="w-full bg-[#111111] border border-[#2a2a2a] focus:border-pink-500 rounded-xl p-3.5 text-sm text-[#ececec] font-sans focus:outline-none focus:ring-1 focus:ring-pink-500 transition-all"
                      />
                    )}

                    <div className="flex justify-between items-center text-[10px] text-[#666] mt-2 font-mono">
                      <span>TARGET: {type.toUpperCase()} &rarr; {field}</span>
                      <span>{tempText.length} CHARACTERS</span>
                    </div>
                  </div>

                  {/* Modal Actions */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1f1f1f]">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSaving}
                      className="px-4 py-2.5 rounded-xl border border-[#262626] bg-[#141414] hover:bg-[#1f1f1f] text-[#aaa] hover:text-white text-xs uppercase tracking-widest transition-all cursor-pointer font-bold"
                    >
                      [ CANCEL ]
                    </button>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>[ SAVING... ]</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>[ SAVE CHANGES ]</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
