"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function addToCartAction(productId: string, quantity: number) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Kamu harus login terlebih dahulu." };
  }

  try {
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: session.user.id,
        productId: productId,
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          productId: productId,
          quantity: quantity,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to sync cart:", error);
    return { success: false, error: "Gagal menyimpan keranjang ke database." };
  }
}

export async function removeFromCartAction(productId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Kamu harus login terlebih dahulu." };
  }

  try {
    // Hapus record produk ini dari tabel CartItem user di Supabase
    await prisma.cartItem.deleteMany({
      where: {
        userId: session.user.id,
        productId: productId,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to remove cart item:", error);
    return { success: false, error: "Gagal menghapus barang dari database." };
  }
}

export async function updateCartQuantityAction(productId: string, quantity: number) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Kamu harus login terlebih dahulu." };
  }

  try {
    if (quantity <= 0) {
      await prisma.cartItem.deleteMany({
        where: {
          userId: session.user.id,
          productId: productId,
        },
      });
    } else {
      const item = await prisma.cartItem.findFirst({
        where: {
          userId: session.user.id,
          productId: productId,
        },
      });

      if (item) {
        await prisma.cartItem.update({
          where: { id: item.id },
          data: { quantity },
        });
      }
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to update cart quantity:", error);
    return { success: false, error: "Gagal mengupdate jumlah barang di database." };
  }
}