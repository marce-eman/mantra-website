"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveEpisodeAction(data: any) {
  try {
    if (data.id) {
      // Jika ada ID, berarti mode EDIT
      await prisma.episode.update({
        where: { id: data.id },
        data: {
          episodeNo: data.episodeNo,
          title: data.title,
          descriptionLeft: data.descriptionLeft,
          descriptionRight: data.descriptionRight,
          heroImage: data.heroImage,
          isActive: data.isActive,
        },
      });
    } else {
      // Jika tidak ada ID, berarti BUAT BARU
      await prisma.episode.create({
        data: {
          episodeNo: data.episodeNo,
          title: data.title,
          descriptionLeft: data.descriptionLeft,
          descriptionRight: data.descriptionRight,
          heroImage: data.heroImage,
          isActive: data.isActive,
        },
      });
    }

    // Refresh halaman otomatis biar datanya langsung update!
    revalidatePath("/admin/episodes");
    revalidatePath("/"); 
    return { success: true };
  } catch (error) {
    console.error("Gagal menyimpan episode:", error);
    return { success: false, error: "Gagal menyimpan data ke database." };
  }
}

export async function deleteEpisodeAction(id: string) {
  try {
    await prisma.episode.delete({
      where: { id },
    });
    revalidatePath("/admin/episodes");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Gagal menghapus episode:", error);
    return { success: false, error: "Gagal menghapus data." };
  }
}