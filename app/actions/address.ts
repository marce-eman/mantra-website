"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveUserAddressAction(fullAddressString: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Kamu harus login terlebih dahulu." };
  }

  try {
    // Update kolom address pada tabel User di Supabase
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        address: fullAddressString,
      },
    });

    revalidatePath("/account/addresses");
    return { success: true };
  } catch (error) {
    console.error("Failed to update address:", error);
    return { success: false, error: "Gagal menyimpan alamat ke database." };
  }
}