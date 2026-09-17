"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, Check, X, Loader2, Link as LinkIcon } from "lucide-react";
import { useInlineEdit } from "./InlineEditContext";
import { supabase } from "@/lib/supabaseClient";
import { updateInlineContentAction } from "@/app/actions/inlineEdit";

interface InlineEditableImageProps {
  type: "article" | "episode" | "setting";
  id: string;
  field: string;
  label: string;
  value: string;
  className?: string;
  as?: "span" | "div";
  buttonOnly?: boolean;
  children?: React.ReactNode;
  onSaveSuccess?: (newUrl: string) => void;
  isFocused?: boolean;
}

export function InlineEditableImage({
  type,
  id,
  field,
  label,
  value,
  className = "",
  as = "div",
  buttonOnly = false,
  children,
  onSaveSuccess,
  isFocused,
}: InlineEditableImageProps) {
  const router = useRouter();
  const { isEditMode, showToast } = useInlineEdit();

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(value || "");
  const [newUrl, setNewUrl] = useState(value || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [inputMode, setInputMode] = useState<"upload" | "url">("upload");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentUrl(value || "");
  }, [value]);

  useEffect(() => {
    if (isOpen) {
      setNewUrl(currentUrl);
    }
  }, [isOpen, currentUrl]);

  if (!isEditMode) {
    return buttonOnly ? null : <>{children}</>;
  }

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleClose = () => {
    if (isSaving || isUploading) return;
    setIsOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data: publicData } = supabase.storage
        .from("site-assets")
        .getPublicUrl(filePath);

      if (publicData?.publicUrl) {
        setNewUrl(publicData.publicUrl);
        showToast("Image uploaded to Supabase Storage successfully.", "info");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      showToast(`Upload failed: ${err?.message || "Unknown error"}`, "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSaving || isUploading) return;
    if (!newUrl) {
      showToast("Please choose an image file or provide an image URL.", "error");
      return;
    }

    setIsSaving(true);

    try {
      const res = await updateInlineContentAction({
        type,
        id,
        field,
        value: newUrl,
      });

      if (res.success) {
        setCurrentUrl(newUrl);
        showToast(`${label} updated successfully.`, "success");
        if (onSaveSuccess) {
          onSaveSuccess(newUrl);
        }
        setIsOpen(false);
        router.refresh();
      } else {
        showToast(res.error || "Failed to save image changes.", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "An error occurred while saving the image.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const Tag = as as keyof React.JSX.IntrinsicElements;

  const showMobileBadge = isFocused !== false;

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
          } relative group/inline-edit transition-all duration-200 cursor-pointer rounded-xl ${
            showMobileBadge ? "outline-dashed outline-1 outline-pink-500/40" : "outline-none"
          } sm:outline-none hover:outline-dashed hover:outline-2 hover:outline-pink-500 hover:outline-offset-4 hover:shadow-[0_0_25px_rgba(236,72,153,0.25)] ${className}`}
          title={`Click to edit ${label}`}
        >
          {/* Rendered Children Image */}
          {children}

          {/* Brutalist Pink Badge with Mantra Logo */}
          <span className={`absolute top-2 right-2 sm:top-3 sm:right-3 ${
            showMobileBadge ? "opacity-100" : "opacity-0"
          } sm:opacity-0 sm:group-hover/inline-edit:opacity-100 transition-all duration-200 pointer-events-none z-30 inline-flex items-center gap-1.5 bg-black/95 text-pink-400 border border-pink-500/80 px-2.5 py-1.5 sm:py-1 rounded shadow-[0_0_15px_rgba(236,72,153,0.4)] backdrop-blur-md`}>
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

      {/* Image Editor Modal Portal */}
      {mounted && isOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 pointer-events-auto"
              onClick={handleClose}
            >
              <div
                className="relative w-full max-w-xl bg-[#090909] border border-pink-500/40 rounded-2xl p-6 shadow-[0_0_60px_rgba(236,72,153,0.25)] font-mono text-[#ececec] animate-in zoom-in-95 duration-200 pointer-events-auto"
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
                    disabled={isSaving || isUploading}
                    className="p-1.5 rounded-lg bg-[#141414] hover:bg-[#222] border border-[#262626] text-[#888] hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Mode Selector Tabs */}
                <div className="flex gap-2 p-1 bg-[#111] border border-[#222] rounded-xl mb-4 text-xs">
                  <button
                    type="button"
                    onClick={() => setInputMode("upload")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all cursor-pointer font-bold ${
                      inputMode === "upload"
                        ? "bg-pink-600 text-white shadow-lg"
                        : "text-[#888] hover:text-white"
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" /> UPLOAD NEW IMAGE (SUPABASE)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode("url")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all cursor-pointer font-bold ${
                      inputMode === "url"
                        ? "bg-pink-600 text-white shadow-lg"
                        : "text-[#888] hover:text-white"
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" /> DIRECT IMAGE URL
                  </button>
                </div>

                {/* Upload Area / Input */}
                <form onSubmit={handleSave} className="space-y-4">
                  {inputMode === "upload" ? (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={isUploading || isSaving}
                        className="hidden"
                      />
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                          isUploading
                            ? "border-pink-500 bg-pink-500/5"
                            : "border-[#2a2a2a] hover:border-pink-500 bg-[#111111]/70 hover:bg-[#141414]"
                        }`}
                      >
                        {isUploading ? (
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
                            <span className="text-xs text-pink-300 font-bold uppercase tracking-widest">
                              Uploading to Supabase Storage...
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <div className="p-3 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400">
                              <Upload className="w-6 h-6" />
                            </div>
                            <span className="text-xs text-[#ececec] font-bold uppercase tracking-wider">
                              Click to select an image from your device
                            </span>
                            <span className="text-[10px] text-[#777]">
                              Supported formats: JPG, PNG, WEBP. Automatically uploaded to Supabase Storage bucket &apos;site-assets&apos;.
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#ececec]/60 mb-2 font-medium">
                        DIRECT IMAGE URL:
                      </label>
                      <input
                        type="text"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        placeholder="https://... or /images/..."
                        disabled={isSaving}
                        className="w-full bg-[#111111] border border-[#2a2a2a] focus:border-pink-500 rounded-xl p-3.5 text-xs text-[#ececec] font-mono focus:outline-none focus:ring-1 focus:ring-pink-500 transition-all"
                      />
                    </div>
                  )}

                  {/* Live Preview Box */}
                  {newUrl && (
                    <div className="space-y-2">
                      <div className="text-[10px] text-[#888] uppercase tracking-widest">
                        NEW IMAGE PREVIEW:
                      </div>
                      <div className="relative w-full h-44 bg-[#050505] rounded-xl overflow-hidden border border-[#222]">
                        <Image
                          src={newUrl}
                          alt="Preview"
                          fill
                          className="object-contain p-2"
                          unoptimized={newUrl.startsWith("http")}
                        />
                      </div>
                    </div>
                  )}

                  {/* Modal Actions */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1f1f1f]">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSaving || isUploading}
                      className="px-4 py-2.5 rounded-xl border border-[#262626] bg-[#141414] hover:bg-[#1f1f1f] text-[#aaa] hover:text-white text-xs uppercase tracking-widest transition-all cursor-pointer font-bold"
                    >
                      [ CANCEL ]
                    </button>

                    <button
                      type="submit"
                      disabled={isSaving || isUploading || !newUrl}
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
