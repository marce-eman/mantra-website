"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function saveEpisodeAction(data: any) {
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

    if (data.id) {
      await prisma.episode.update({
        where: { id: data.id },
        data: {
          episodeNo: data.episodeNo,
          title: data.title,
          descriptionLeft: data.descriptionLeft,
          descriptionRight: data.descriptionRight,
          heroImage: data.heroImage,
          isActive: data.isActive,
          videoUrl: data.videoUrl,
        },
      });
    } else {
      await prisma.episode.create({
        data: {
          episodeNo: data.episodeNo,
          title: data.title,
          descriptionLeft: data.descriptionLeft,
          descriptionRight: data.descriptionRight,
          heroImage: data.heroImage,
          isActive: data.isActive,
          videoUrl: data.videoUrl,
        },
      });
    }

    revalidatePath("/admin/episodes");
    revalidatePath("/");
    revalidatePath("/shop");
    return { success: true };
  } catch (error) {
    console.error("Gagal menyimpan episode:", error);
    return { success: false, error: "Gagal menyimpan data ke database." };
  }
}

export async function deleteEpisodeAction(id: string) {
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

    await prisma.episode.delete({
      where: { id },
    });
    
    revalidatePath("/admin/episodes");
    revalidatePath("/");
    revalidatePath("/shop");
    return { success: true };
  } catch (error) {
    console.error("Gagal menghapus episode:", error);
    return { success: false, error: "Gagal menghapus data." };
  }
}