"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function createOrderAction(cartItems: any[]) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Kamu harus login terlebih dahulu." };
  }

  if (!cartItems || cartItems.length === 0) {
    return { success: false, error: "Keranjang belanja masih kosong." };
  }

  try {
    // Hitung total harga dari item di keranjang
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 1. Buat data Order di Supabase
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        totalAmount: totalAmount,
        status: "PENDING",
        // 2. Buat data OrderItem untuk setiap produk
        items: {
          create: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
            size: item.selectedSize || "M",
            color: item.selectedColor || "BLACK",
          })),
        },
      },
    });

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Failed to create order:", error);
    return { success: false, error: "Gagal membuat pesanan ke database." };
  }
}