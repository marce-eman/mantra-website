"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, Check, Loader2, DollarSign, Layers } from "lucide-react";
import { useInlineEdit } from "./InlineEditContext";
import { supabase } from "@/lib/supabaseClient";
import { updateInlineProductAction } from "@/app/actions/inlineEdit";

interface InlineEditableProductProps {
  product: {
    id: string;
    name?: string;
    price: number;
    stock?: number;
    images?: string[] | string;
    sizes?: string[] | string;
    description?: string;
  };
  children?: React.ReactNode;
  className?: string;
  buttonOnly?: boolean;
}

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Oversized", "One Size"];

export function InlineEditableProduct({
  product,
  children,
  className = "",
  buttonOnly = false,
}: InlineEditableProductProps) {
  const router = useRouter();
  const { isEditMode, showToast } = useInlineEdit();

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [price, setPrice] = useState<number>(product.price || 0);
  const [stock, setStock] = useState<number>(product.stock || 0);
  const [images, setImages] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const parseToArray = (input: any): string[] => {
    if (Array.isArray(input)) return input.filter(Boolean);
    if (typeof input === "string" && input.trim() !== "") {
      return input.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  useEffect(() => {
    setPrice(product.price || 0);
    setStock(product.stock || 0);
    setImages(parseToArray(product.images));
    setSizes(parseToArray(product.sizes));
  }, [product]);

  useEffect(() => {
    if (isOpen) {
      setPrice(product.price || 0);
      setStock(product.stock || 0);
      setImages(parseToArray(product.images));
      setSizes(parseToArray(product.sizes));
    }
  }, [isOpen, product]);

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
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newUploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop() || "jpg";
        const fileName = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("site-assets")
          .upload(filePath, file, { cacheControl: "3600", upsert: true });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        const { data: publicData } = supabase.storage
          .from("site-assets")
          .getPublicUrl(filePath);

        if (publicData?.publicUrl) {
          newUploadedUrls.push(publicData.publicUrl);
        }
      }

      if (newUploadedUrls.length > 0) {
        setImages((prev) => [...prev, ...newUploadedUrls]);
        showToast(`${newUploadedUrls.length} image(s) uploaded successfully.`, "info");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      showToast(`Upload failed: ${err?.message || "Unknown error"}`, "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const toggleSize = (size: string) => {
    if (sizes.includes(size)) {
      setSizes((prev) => prev.filter((s) => s !== size));
    } else {
      setSizes((prev) => [...prev, size]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSaving || isUploading) return;
    setIsSaving(true);

    try {
      const res = await updateInlineProductAction({
        id: product.id,
        price: Number(price) || 0,
        stock: Number(stock) || 0,
        images,
        sizes,
      });

      if (res.success) {
        showToast(`Product updated successfully.`, "success");
        setIsOpen(false);
        router.refresh();
      } else {
        showToast(res.error || "Failed to update product.", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "An error occurred while saving.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {buttonOnly ? (
        <button
          type="button"
          onClick={handleOpen}
          className={`inline-flex items-center gap-1.5 bg-black/90 hover:bg-pink-600/20 text-pink-400 border border-pink-500/80 px-3 py-1.5 rounded-xl shadow-[0_0_15px_rgba(236,72,153,0.3)] backdrop-blur-md text-[10px] font-mono font-bold tracking-widest uppercase transition-all cursor-pointer ${className}`}
          title="Edit Product (Photos, Price, Sizes)"
        >
          <Image
            src="/images/ICON CHROME 1.png"
            alt="Mantra"
            width={12}
            height={12}
            className="object-contain animate-pulse"
          />
          <span>[ EDIT PRODUCT ]</span>
        </button>
      ) : (
        <div
          className={`relative group/product-edit rounded-2xl ${className}`}
        >
          {children}

          {/* Brutalist Pink Badge in Top Right Corner */}
          <button
            type="button"
            onClick={handleOpen}
            className="absolute top-3 right-3 z-30 opacity-0 group-hover/product-edit:opacity-100 transition-all duration-200 inline-flex items-center gap-1.5 bg-black/95 hover:bg-pink-600/20 text-pink-400 border border-pink-500/80 px-2.5 py-1 rounded-xl shadow-[0_0_15px_rgba(236,72,153,0.4)] backdrop-blur-md text-[9px] font-mono font-bold tracking-widest uppercase cursor-pointer"
          >
            <Image
              src="/images/ICON CHROME 1.png"
              alt="Mantra"
              width={12}
              height={12}
              className="object-contain animate-pulse"
            />
            <span>[ EDIT PRODUCT ]</span>
          </button>
        </div>
      )}

      {/* Product Edit Modal Portal */}
      {mounted && isOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 pointer-events-auto"
              onClick={handleClose}
            >
              <div
                className="relative w-full max-w-2xl bg-[#090909] border border-pink-500/40 rounded-2xl p-6 md:p-8 shadow-[0_0_60px_rgba(236,72,153,0.25)] font-mono text-[#ececec] max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-200 pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-4 mb-6">
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
                        EDIT // [ {product.name || "PRODUCT"} ]
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

                {/* Form */}
                <form onSubmit={handleSave} className="space-y-6 text-xs">
                  {/* 1. Photos Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] uppercase tracking-wider text-[#ececec]/80 font-bold">
                        PRODUCT PHOTOS ({images.length} ACTIVE)
                      </label>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || isSaving}
                        className="inline-flex items-center gap-1.5 text-[10px] bg-pink-500/10 border border-pink-500/30 text-pink-400 hover:bg-pink-500/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Upload className="w-3 h-3" /> ADD PHOTO
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      disabled={isUploading || isSaving}
                      className="hidden"
                    />

                    {isUploading && (
                      <div className="flex items-center justify-center gap-2 p-4 bg-pink-500/10 border border-pink-500/30 rounded-xl text-pink-300">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading images to Supabase Storage...</span>
                      </div>
                    )}

                    {images.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {images.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className="relative group aspect-square rounded-xl overflow-hidden border border-[#262626] bg-[#050505]"
                          >
                            <Image
                              src={imgUrl}
                              alt={`Product image ${idx + 1}`}
                              fill
                              className="object-cover"
                              unoptimized={imgUrl.startsWith("http")}
                            />
                            {idx === 0 && (
                              <span className="absolute bottom-1 left-1 bg-black/80 text-[8px] text-pink-400 font-bold px-1.5 py-0.5 rounded border border-pink-500/40">
                                MAIN
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="absolute top-1 right-1 p-1 bg-black/90 hover:bg-red-900 border border-red-500/40 text-red-400 hover:text-white rounded-lg transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                              title="Delete photo"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border border-dashed border-[#333] hover:border-pink-500 p-6 rounded-xl flex flex-col items-center justify-center text-center text-[#666] hover:text-[#888] cursor-pointer transition-colors"
                      >
                        <Upload className="w-6 h-6 mb-2 text-pink-400 opacity-60" />
                        <span className="font-bold uppercase text-[10px]">Click to upload product photos</span>
                        <span className="text-[9px] text-[#555] mt-0.5">Supports multi-file upload</span>
                      </div>
                    )}
                  </div>

                  {/* 2. Pricing & Stock Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#1f1f1f] pt-4">
                    <div className="space-y-2">
                      <label className="block text-[11px] uppercase tracking-wider text-[#ececec]/80 font-bold">
                        PRICE (USD $)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400 font-bold">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={price}
                          onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                          disabled={isSaving}
                          className="w-full bg-[#111111] border border-[#2a2a2a] focus:border-emerald-500 rounded-xl pl-9 pr-4 py-3 text-sm text-[#ececec] font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[11px] uppercase tracking-wider text-[#ececec]/80 font-bold">
                        TOTAL INVENTORY STOCK
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400 font-bold">
                          <Layers className="w-4 h-4" />
                        </div>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={stock}
                          onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
                          disabled={isSaving}
                          className="w-full bg-[#111111] border border-[#2a2a2a] focus:border-purple-500 rounded-xl pl-9 pr-4 py-3 text-sm text-[#ececec] font-mono focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Available Sizes */}
                  <div className="space-y-3 border-t border-[#1f1f1f] pt-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] uppercase tracking-wider text-[#ececec]/80 font-bold">
                        AVAILABLE SIZES
                      </label>
                      <span className="text-[10px] text-[#666] font-mono">
                        {sizes.length} selected
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_SIZES.map((size) => {
                        const isSelected = sizes.includes(size);
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => toggleSize(size)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                              isSelected
                                ? "bg-pink-600 text-white border border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                                : "bg-[#141414] text-[#888] border border-[#262626] hover:text-white hover:border-[#444]"
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1f1f1f]">
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
                      disabled={isSaving || isUploading}
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
