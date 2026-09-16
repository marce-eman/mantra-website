"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export interface SaveSettingsResponse {
  success: boolean;
  error?: string;
  data?: Record<string, string>;
}

export async function saveSiteSettingsAction(
  settings: Record<string, string>
): Promise<SaveSettingsResponse> {
  try {
    // 1. Authorization check: must be logged in as ADMIN
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized. Please log in first." };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return { success: false, error: "Forbidden. Admin privileges required." };
    }

    if (!settings || typeof settings !== "object") {
      return { success: false, error: "Invalid settings payload." };
    }

    // 2. Iterate and upsert each key
    for (const [key, rawValue] of Object.entries(settings)) {
      if (!key) continue;
      const value = String(rawValue ?? "").trim();

      if ((prisma as any)?.siteSetting) {
        await (prisma as any).siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      } else {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "SiteSetting" ("id", "key", "value", "createdAt", "updatedAt") 
           VALUES (gen_random_uuid()::text, $1, $2, NOW(), NOW()) 
           ON CONFLICT ("key") DO UPDATE SET "value" = $2, "updatedAt" = NOW()`,
          key,
          value
        );
      }
    }

    // 3. Revalidate affected paths across the site
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/settings");
    revalidatePath("/checkout");
    revalidatePath("/order-success");
    revalidatePath("/return-policy");
    revalidatePath("/shipping-policy");
    revalidatePath("/faq");

    return { success: true, data: settings };
  } catch (error: any) {
    console.error("Failed to save site settings:", error);
    return {
      success: false,
      error: error?.message || "Server error while saving site settings.",
    };
  }
}
