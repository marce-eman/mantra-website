"use client";

import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  multiple?: boolean;
}

export default function ImageUpload({ value, onChange, multiple = false }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const images = value ? value.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error } = await supabase.storage.from("mantra-images").upload(filePath, file);

      if (error) {
        alert(`Gagal upload ${file.name}: ${error.message}`);
        continue;
      }

      const { data } = supabase.storage.from("mantra-images").getPublicUrl(filePath);
      uploadedUrls.push(data.publicUrl);
    }

    if (uploadedUrls.length > 0) {
      if (multiple) {
        onChange([...images, ...uploadedUrls].join(", "));
      } else {
        onChange(uploadedUrls[0]);
      }
    }

    setLoading(false);
  };

  const handleRemove = (urlToRemove: string) => {
    if (multiple) {
      onChange(images.filter((img) => img !== urlToRemove).join(", "));
    } else {
      onChange("");
    }
  };

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-3">
          {images.map((imgUrl, index) => (
            <div key={index} className="relative w-24 h-24 rounded-xl overflow-hidden border border-[#1f1f1f] bg-[#111]">
              <Image src={imgUrl} alt="Uploaded" fill className="object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(imgUrl)}
                className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white p-1 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-[#1f1f1f] hover:border-[#ececec]/40 rounded-xl cursor-pointer bg-[#111111]/50 hover:bg-[#111111] transition-colors">
        {loading ? (
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#ececec]/60">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Uploading to Supabase...
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-xs uppercase tracking-widest text-[#ececec]/60">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Click to upload image {multiple ? "(Multiple)" : ""}</span>
          </div>
        )}
        <input type="file" accept="image/*" multiple={multiple} onChange={handleUpload} disabled={loading} className="hidden" />
      </label>
    </div>
  );
}