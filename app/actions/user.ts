"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function updateUserAddressAction(address: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Kamu harus login terlebih dahulu." };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { address },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to update address:", error);
    return { success: false, error: "Gagal menyimpan alamat ke database." };
  }
}