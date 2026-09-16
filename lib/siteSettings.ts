import { prisma } from "@/lib/prisma";

export const DEFAULT_SITE_SETTINGS: Record<string, string> = {
  admin_whatsapp: "6281234567890",
  social_instagram: "https://instagram.com",
  social_tiktok: "https://tiktok.com",
  social_youtube: "https://youtube.com",
  social_twitter: "https://twitter.com",
  social_facebook: "https://facebook.com",
  hero_manifesto:
    "A manifestation born from the shadows. Where silence meets brutalist form, and identity transcends time. Crafted for those who walk through the void and seek truth within the dark.",
};

export async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    let rows: any[] = [];
    if ((prisma as any)?.siteSetting) {
      rows = await (prisma as any).siteSetting.findMany();
    } else {
      rows = await prisma.$queryRawUnsafe(`SELECT "key", "value" FROM "SiteSetting"`);
    }

    const settings = { ...DEFAULT_SITE_SETTINGS };
    if (Array.isArray(rows)) {
      for (const row of rows) {
        if (row?.key && row?.value !== undefined) {
          settings[row.key] = row.value;
        }
      }
    }
    return settings;
  } catch (error) {
    console.error("Failed to fetch site settings, using defaults:", error);
    return { ...DEFAULT_SITE_SETTINGS };
  }
}

export async function getSiteSetting(key: string): Promise<string> {
  const settings = await getSiteSettings();
  return settings[key] || DEFAULT_SITE_SETTINGS[key] || "";
}
