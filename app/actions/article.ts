"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function saveArticleAction(formData: any) {
  try {
    // --- CEK OTORISASI ADMIN ---
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized. Please log in." };
    }
    const user = await prisma.user.findUnique({ 
      where: { id: session.user.id }, 
      select: { role: true } 
    });
    if (user?.role !== "ADMIN") {
      return { success: false, error: "Forbidden. Admin access required." };
    }

    const { id, images, galleryImages, sizes, price, stock, episodeId, ...rest } = formData;

    const parseToArray = (input: any) => {
      if (Array.isArray(input)) return input;
      if (typeof input === "string" && input.trim() !== "") {
        return input.split(",").map((item) => item.trim()).filter(Boolean);
      }
      return [];
    };

    const parsedImages = parseToArray(images);
    const parsedGalleryImages = parseToArray(galleryImages);
    const parsedSizes = parseToArray(sizes);

    const dataToSave = {
      ...rest,
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      images: parsedImages,
      galleryImages: parsedGalleryImages,
      sizes: parsedSizes,
      episodeId: episodeId && episodeId.trim() !== "" ? episodeId : null,
    };

    if (id) {
      await prisma.product.update({
        where: { id },
        data: dataToSave,
      });
    } else {
      await prisma.product.create({
        data: dataToSave,
      });
    }

    revalidatePath("/", "layout");
    revalidatePath("/shop");
    revalidatePath("/articles/[slug]", "page");
    revalidatePath("/admin/articles");

    return { success: true };
  } catch (error: any) {
    console.error("Save article error:", error);
    return { success: false, error: "Gagal menyimpan artikel. Silakan coba lagi." };
  }
}

export async function deleteArticleAction(id: string) {
  try {
    // --- CEK OTORISASI ADMIN ---
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized. Please log in." };
    }
    const user = await prisma.user.findUnique({ 
      where: { id: session.user.id }, 
      select: { role: true } 
    });
    if (user?.role !== "ADMIN") {
      return { success: false, error: "Forbidden. Admin access required." };
    }

    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/", "layout");
    revalidatePath("/shop");
    revalidatePath("/articles/[slug]", "page");
    revalidatePath("/admin/articles");

    return { success: true };
  } catch (error: any) {
    console.error("Delete article error:", error);
    return { success: false, error: "Gagal menghapus artikel." };
  }
}