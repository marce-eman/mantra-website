"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveArticleAction(formData: any) {
  try {
    const { id, images, galleryImages, sizes, price, stock, episodeId, ...rest } = formData;

    // Helper untuk mengubah string koma ("a, b, c") menjadi Array String (["a", "b", "c"])
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

    // MEMAKSA NEXT.JS MEMBERSIHKAN CACHE DI SEMUA RUTE Halaman
    revalidatePath("/", "layout");
    revalidatePath("/shop");
    revalidatePath("/articles/[slug]", "page");
    revalidatePath("/admin/articles");

    return { success: true };
  } catch (error: any) {
    console.error("Save article error:", error);
    return { success: false, error: error.message || "Gagal menyimpan artikel" };
  }
}

export async function deleteArticleAction(id: string) {
  try {
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
    return { success: false, error: error.message || "Gagal menghapus artikel" };
  }
}