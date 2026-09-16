"use client";

import React, { useState } from "react";
import {
  Phone,
  Globe,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileText,
  RotateCcw
} from "lucide-react";
import { saveSiteSettingsAction } from "@/app/actions/settings";
import { DEFAULT_SITE_SETTINGS } from "@/lib/siteSettings";

interface SettingsClientProps {
  initialSettings: Record<string, string>;
}

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [settings, setSettings] = useState<Record<string, string>>({
    ...DEFAULT_SITE_SETTINGS,
    ...initialSettings,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    if (feedback) setFeedback(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const result = await saveSiteSettingsAction(settings);
      if (result.success) {
        setFeedback({
          type: "success",
          message: "Site settings updated successfully. Changes applied across all website components.",
        });
      } else {
        setFeedback({
          type: "error",
          message: result.error || "Failed to update settings.",
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.message || "An unexpected error occurred while saving.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm("Reset all settings to default values? You will still need to click Save.")) {
      setSettings(DEFAULT_SITE_SETTINGS);
    }
  };

  const cleanWaNumber = settings.admin_whatsapp?.replace(/[^0-9]/g, "") || "6281234567890";

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1f1f1f] pb-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-pink-400 block mb-1">
            // ADMIN CONFIGURATION
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-widest uppercase font-serif text-[#ececec]">
            GLOBAL SITE SETTINGS
          </h1>
          <p className="text-xs text-[#ececec]/60 uppercase tracking-widest mt-1">
            Manage WhatsApp contact numbers, social media channels, and brand copy.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="flex items-center gap-2 border border-[#2a2a2a] hover:border-[#444] text-[#ececec]/70 hover:text-white px-4 py-2 rounded-xl text-xs uppercase tracking-widest transition-colors font-mono cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-mono uppercase tracking-wider animate-in slide-in-from-top-2 ${feedback.type === "success"
            ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
            : "bg-red-950/40 border-red-500/50 text-red-300"
            }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">

        {/* Section 1: WhatsApp Support & Checkout */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-[#1f1f1f] pb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#ececec]">
                WHATSAPP SUPPORT & DIRECT CHECKOUT
              </h2>
              <p className="text-[11px] text-[#ececec]/50 font-light">
                Configure the destination WhatsApp number for all customer service and order calculations.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-[#ececec]/70 mb-2">
                ADMIN WHATSAPP NUMBER (INTERNATIONAL FORMAT)
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={settings.admin_whatsapp || ""}
                  onChange={(e) => handleChange("admin_whatsapp", e.target.value)}
                  placeholder="e.g. 6281234567890"
                  required
                  className="flex-1 bg-[#111111] border border-[#2a2a2a] focus:border-emerald-500 text-[#ececec] px-4 py-3 rounded-xl text-sm font-mono focus:outline-none transition-colors"
                />
                <a
                  href={`https://wa.me/${cleanWaNumber}?text=${encodeURIComponent("Test WhatsApp connection from MANTRA Admin Panel.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#181818] hover:bg-[#222] border border-[#333] text-emerald-400 px-5 py-3 rounded-xl text-xs uppercase tracking-widest font-mono transition-colors shrink-0 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Test Link
                </a>
              </div>
              <p className="text-[10px] text-[#ececec]/40 mt-2 font-mono">
                Tip: Enter numbers only with country code (e.g. 62812... for Indonesia). Do not include '+' or '-'.
              </p>
            </div>

            <div className="p-4 bg-[#111111]/60 border border-[#1f1f1f] rounded-xl space-y-2">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">
                Automated Dynamic Integration Locations:
              </span>
              <ul className="text-[11px] text-[#ececec]/60 space-y-1 list-disc pl-4 font-light">
                <li>Floating Customer Support Chat widget in bottom-right corner.</li>
                <li>Direct order placement redirection at Checkout.</li>
                <li>Order confirmation payment link on Order Success page.</li>
                <li>Support contact CTAs on Return Policy and Shipping Policy pages.</li>
                <li>Support question CTA on FAQ page.</li>
                <li>Customer Order Detail page in user account area.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: Social Media Links */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-[#1f1f1f] pb-4">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#ececec]">
                SOCIAL MEDIA CHANNELS
              </h2>
              <p className="text-[11px] text-[#ececec]/50 font-light">
                URLs for brand profiles displayed in the website Footer and social sections.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Instagram */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-widest text-[#ececec]/70">
                INSTAGRAM URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={settings.social_instagram || ""}
                  onChange={(e) => handleChange("social_instagram", e.target.value)}
                  placeholder="https://instagram.com/mantra"
                  className="flex-1 bg-[#111111] border border-[#2a2a2a] focus:border-pink-500 text-[#ececec] px-4 py-2.5 rounded-xl text-xs font-mono focus:outline-none transition-colors"
                />
                {settings.social_instagram && (
                  <a
                    href={settings.social_instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-[#181818] hover:bg-[#222] border border-[#333] text-[#ececec] rounded-xl flex items-center justify-center transition-colors"
                    title="Open Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* TikTok */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-widest text-[#ececec]/70">
                TIKTOK URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={settings.social_tiktok || ""}
                  onChange={(e) => handleChange("social_tiktok", e.target.value)}
                  placeholder="https://tiktok.com/@mantra"
                  className="flex-1 bg-[#111111] border border-[#2a2a2a] focus:border-pink-500 text-[#ececec] px-4 py-2.5 rounded-xl text-xs font-mono focus:outline-none transition-colors"
                />
                {settings.social_tiktok && (
                  <a
                    href={settings.social_tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-[#181818] hover:bg-[#222] border border-[#333] text-[#ececec] rounded-xl flex items-center justify-center transition-colors"
                    title="Open Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* YouTube */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-widest text-[#ececec]/70">
                YOUTUBE URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={settings.social_youtube || ""}
                  onChange={(e) => handleChange("social_youtube", e.target.value)}
                  placeholder="https://youtube.com/@mantra"
                  className="flex-1 bg-[#111111] border border-[#2a2a2a] focus:border-pink-500 text-[#ececec] px-4 py-2.5 rounded-xl text-xs font-mono focus:outline-none transition-colors"
                />
                {settings.social_youtube && (
                  <a
                    href={settings.social_youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-[#181818] hover:bg-[#222] border border-[#333] text-[#ececec] rounded-xl flex items-center justify-center transition-colors"
                    title="Open Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* X / Twitter */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-widest text-[#ececec]/70">
                X / TWITTER URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={settings.social_twitter || ""}
                  onChange={(e) => handleChange("social_twitter", e.target.value)}
                  placeholder="https://twitter.com/mantra"
                  className="flex-1 bg-[#111111] border border-[#2a2a2a] focus:border-pink-500 text-[#ececec] px-4 py-2.5 rounded-xl text-xs font-mono focus:outline-none transition-colors"
                />
                {settings.social_twitter && (
                  <a
                    href={settings.social_twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-[#181818] hover:bg-[#222] border border-[#333] text-[#ececec] rounded-xl flex items-center justify-center transition-colors"
                    title="Open Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Facebook */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-mono uppercase tracking-widest text-[#ececec]/70">
                FACEBOOK URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={settings.social_facebook || ""}
                  onChange={(e) => handleChange("social_facebook", e.target.value)}
                  placeholder="https://facebook.com/mantra"
                  className="flex-1 bg-[#111111] border border-[#2a2a2a] focus:border-pink-500 text-[#ececec] px-4 py-2.5 rounded-xl text-xs font-mono focus:outline-none transition-colors"
                />
                {settings.social_facebook && (
                  <a
                    href={settings.social_facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-[#181818] hover:bg-[#222] border border-[#333] text-[#ececec] rounded-xl flex items-center justify-center transition-colors"
                    title="Open Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t border-[#1f1f1f]">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center gap-2 bg-[#ececec] hover:bg-white text-[#050505] px-8 py-4 rounded-xl text-xs uppercase tracking-widest font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-black" />
                SAVING SETTINGS...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                SAVE SITE SETTINGS
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
