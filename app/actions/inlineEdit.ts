"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export interface UpdateInlinePayload {
  type: "article" | "episode" | "setting";
  id: string;
  field: string;
  value: any;
}

export async function updateInlineContentAction({
  type,
  id,
  field,
  value,
}: UpdateInlinePayload) {
  try {
    // 1. Server-Side Security Authorization (Admin Only)
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

    if (!id || !field) {
      return { success: false, error: "Target ID and field name are required." };
    }

    // 2. Setting Update (Site Settings / Hero Manifesto)
    if (type === "setting") {
      if ((prisma as any)?.siteSetting) {
        const setting = await (prisma as any).siteSetting.upsert({
          where: { key: field },
          update: { value: String(value) },
          create: { key: field, value: String(value) },
        });

        revalidatePath("/", "layout");
        revalidatePath("/shop");
        return { success: true, data: setting };
      } else {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "SiteSetting" ("id", "key", "value", "createdAt", "updatedAt") 
           VALUES (gen_random_uuid()::text, $1, $2, NOW(), NOW()) 
           ON CONFLICT ("key") DO UPDATE SET "value" = $2, "updatedAt" = NOW()`,
          field,
          String(value)
        );

        revalidatePath("/", "layout");
        revalidatePath("/shop");
        return { success: true, data: { key: field, value } };
      }
    }

    // 3. Field Whitelist Validation
    const allowedArticleFields = [
      "name",
      "articleTitle",
      "articleSubtitle",
      "articleNo",
      "heroImage",
      "storyIntro",
      "storyLeft",
      "storyRight",
      "galleryImages",
      "editorialCaption",
      "editorialBody",
      "editorialBodyRight",
      "editorialImage",
      "editorialImageRight",
      "videoThumb",
      "videoUrl",
      "description",
      "price",
      "stock",
    ];

    const allowedEpisodeFields = [
      "episodeNo",
      "title",
      "descriptionLeft",
      "descriptionRight",
      "heroImage",
      "videoUrl",
      "isActive",
    ];

    if (type === "article") {
      if (!allowedArticleFields.includes(field)) {
        return { success: false, error: `Invalid field '${field}' for article.` };
      }

      let parsedValue = value;
      // Handle array format for galleryImages, images, sizes
      if (field === "galleryImages" || field === "images" || field === "sizes") {
        if (typeof value === "string") {
          parsedValue = value.split(",").map((s) => s.trim()).filter(Boolean);
        } else if (!Array.isArray(value)) {
          parsedValue = [];
        }
      }

      const updatedArticle = await prisma.product.update({
        where: { id },
        data: {
          [field]: parsedValue,
        },
      });

      // Revalidate Pages
      revalidatePath("/", "layout");
      revalidatePath("/shop");
      revalidatePath("/admin/articles");
      if (updatedArticle.slug) {
        revalidatePath(`/articles/${updatedArticle.slug}`);
        revalidatePath(`/shop/${updatedArticle.slug}`);
      }
      revalidatePath("/articles/[slug]", "page");
      revalidatePath("/shop/[slug]", "page");

      return { success: true, data: updatedArticle };
    } else if (type === "episode") {
      if (!allowedEpisodeFields.includes(field)) {
        return { success: false, error: `Invalid field '${field}' for episode.` };
      }

      const updatedEpisode = await prisma.episode.update({
        where: { id },
        data: {
          [field]: value,
        },
      });

      // Revalidate Pages
      revalidatePath("/", "layout");
      revalidatePath("/admin/episodes");
      revalidatePath("/articles/[slug]", "page");
      revalidatePath("/shop");

      return { success: true, data: updatedEpisode };
    }

    return { success: false, error: "Unrecognized entity type." };
  } catch (error: any) {
    console.error("Failed to perform inline update:", error);
    return {
      success: false,
      error: error?.message || "Server error while updating content.",
    };
  }
}

export interface UpdateProductPayload {
  id: string;
  name?: string;
  price: number;
  stock?: number;
  images: string[];
  sizes: string[];
  description?: string;
}

export async function updateInlineProductAction(payload: UpdateProductPayload) {
  try {
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

    const { id, name, price, stock, images, sizes, description } = payload;
    if (!id) {
      return { success: false, error: "Product ID is required." };
    }

    const updateData: any = {
      price: Number(price) || 0,
      images: Array.isArray(images) ? images : [],
      sizes: Array.isArray(sizes) ? sizes : [],
    };

    if (stock !== undefined) {
      updateData.stock = Number(stock) || 0;
    }
    if (name) {
      updateData.name = name;
    }
    if (description !== undefined) {
      updateData.description = description;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/", "layout");
    revalidatePath("/shop");
    revalidatePath("/admin/articles");
    if (updated.slug) {
      revalidatePath(`/shop/${updated.slug}`);
      revalidatePath(`/articles/${updated.slug}`);
    }
    revalidatePath("/shop/[slug]", "page");
    revalidatePath("/articles/[slug]", "page");

    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Failed to update product:", error);
    return {
      success: false,
      error: error?.message || "Server error while updating product.",
    };
  }
}
