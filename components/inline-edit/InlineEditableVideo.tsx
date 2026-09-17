"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Video, Check, X, Loader2, Play } from "lucide-react";
import { useInlineEdit } from "./InlineEditContext";
import { updateInlineContentAction } from "@/app/actions/inlineEdit";

interface InlineEditableVideoProps {
  type: "article" | "episode" | "setting";
  id: string;
  field?: string;
  label: string;
  value: string;
  className?: string;
  as?: "span" | "div";
  buttonOnly?: boolean;
  children?: React.ReactNode;
  onSaveSuccess?: (newUrl: string) => void;
}

export function InlineEditableVideo({
  type,
  id,
  field = "videoUrl",
  label,
  value,
  className = "",
  as = "div",
  buttonOnly = false,
  children,
  onSaveSuccess,
}: InlineEditableVideoProps) {
  const router = useRouter();
  const { isEditMode, showToast } = useInlineEdit();

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(value || "");
  const [tempUrl, setTempUrl] = useState(value || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentUrl(value || "");
  }, [value]);

  useEffect(() => {
    if (isOpen) {
      setTempUrl(currentUrl);
    }
  }, [isOpen, currentUrl]);

  // Convert YouTube URL to Embed URL for live preview
  const getEmbedUrl = (url: string) => {
    if (!url || url === "#") return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  };

  const previewEmbedUrl = getEmbedUrl(tempUrl);

  if (!isEditMode) {
    return buttonOnly ? null : <>{children}</>;
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
        value: tempUrl,
      });

      if (res.success) {
        setCurrentUrl(tempUrl);
        showToast(`${label} updated successfully.`, "success");
        if (onSaveSuccess) {
          onSaveSuccess(tempUrl);
        }
        setIsOpen(false);
        router.refresh();
      } else {
        showToast(res.error || "Failed to save video URL.", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "An error occurred while saving the video.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const Tag = as as keyof React.JSX.IntrinsicElements;

  return (
    <>
      {buttonOnly ? (
        <button
          type="button"
          onClick={handleOpen}
          className={`inline-flex items-center justify-center gap-1.5 bg-black/90 hover:bg-pink-600/20 text-pink-400 border border-pink-500/80 px-3 py-2 sm:px-2.5 sm:py-1 min-h-[44px] sm:min-h-0 rounded-lg shadow-[0_0_15px_rgba(236,72,153,0.3)] backdrop-blur-md text-[9px] font-mono font-bold tracking-widest uppercase transition-all cursor-pointer ${className}`}
          title={`Click to edit ${label}`}
        >
          <Image
            src="/images/ICON CHROME 1.png"
            alt="Mantra"
            width={11}
            height={11}
            className="object-contain animate-pulse"
          />
          <span>[ EDIT // {label.toUpperCase()} ]</span>
        </button>
      ) : (
        <Tag
          onClick={handleOpen}
          className={`${
            as === "span" ? "inline-block" : "block"
          } relative group/inline-edit transition-all duration-200 cursor-pointer rounded-xl outline-dashed outline-1 outline-pink-500/40 sm:outline-none hover:outline-dashed hover:outline-2 hover:outline-pink-500 hover:outline-offset-4 hover:shadow-[0_0_25px_rgba(236,72,153,0.25)] ${className}`}
          title={`Click to edit ${label}`}
        >
          {/* Rendered Children */}
          {children}

          {/* Brutalist Pink Badge with Mantra Logo (Always visible on mobile, hover on desktop) */}
          <span className="absolute top-2 right-2 sm:top-3 sm:right-3 opacity-100 sm:opacity-0 sm:group-hover/inline-edit:opacity-100 transition-all duration-200 pointer-events-none z-30 inline-flex items-center gap-1.5 bg-black/95 text-pink-400 border border-pink-500/80 px-2.5 py-1.5 sm:py-1 rounded shadow-[0_0_15px_rgba(236,72,153,0.4)] backdrop-blur-md">
            <Image
              src="/images/ICON CHROME 1.png"
              alt="Mantra"
              width={12}
              height={12}
              className="object-contain opacity-90 animate-pulse"
            />
            <span className="text-[9px] font-mono font-bold tracking-widest uppercase">
              [ EDIT // {label.toUpperCase()} ]
            </span>
          </span>
        </Tag>
      )}

      {/* Video Editor Modal Portal */}
      {mounted && isOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 pointer-events-auto"
              onClick={handleClose}
            >
              <div
                className="relative w-full max-w-2xl bg-[#090909] border border-pink-500/40 rounded-2xl p-6 shadow-[0_0_60px_rgba(236,72,153,0.25)] font-mono text-[#ececec] animate-in zoom-in-95 duration-200 pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
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

                {/* Form & Preview */}
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#ececec]/60 mb-2 font-medium">
                      YOUTUBE VIDEO URL (WATCH, SHARE, OR SHORTS):
                    </label>
                    <input
                      type="text"
                      value={tempUrl}
                      onChange={(e) => setTempUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                      disabled={isSaving}
                      className="w-full bg-[#111111] border border-[#2a2a2a] focus:border-pink-500 rounded-xl p-3.5 text-xs text-[#ececec] font-mono focus:outline-none focus:ring-1 focus:ring-pink-500 transition-all"
                    />
                    <p className="text-[10px] text-[#666] mt-1.5">
                      Supported formats: youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/...
                    </p>
                  </div>

                  {/* Live Embed Preview */}
                  <div className="space-y-2">
                    <div className="text-[10px] text-[#888] uppercase tracking-widest flex items-center gap-1.5">
                      <Play className="w-3 h-3 text-pink-400" /> LIVE PLAYER PREVIEW:
                    </div>
                    {previewEmbedUrl ? (
                      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-[#222] shadow-xl">
                        <iframe
                          src={previewEmbedUrl}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-video bg-[#111] rounded-xl border border-dashed border-[#222] flex flex-col items-center justify-center text-center p-6 text-[#555]">
                        <Video className="w-8 h-8 mb-2 opacity-40" />
                        <span className="text-xs font-mono">
                          Enter a valid YouTube URL above to view the live video player preview here.
                        </span>
                      </div>
                    )}
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
