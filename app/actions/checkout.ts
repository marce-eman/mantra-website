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

    // Generate Order Number unik (MTR-YYYYMMDD-XXX)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomNum = Math.floor(100 + Math.random() * 900);
    const orderNumber = `MTR-${dateStr}-${randomNum}`;

    // --- GUNAKAN $TRANSACTION AGAR AMAN ---
    const order = await prisma.$transaction(async (tx) => {
      // 1. Buat data Order di Supabase
      const newOrder = await tx.order.create({
        data: {
          orderNumber: orderNumber,
          userId: session.user.id,
          recipientName: session.user.name || "Customer",
          email: session.user.email || "no-email",
          phone: "-", 
          address: "-", 
          totalAmount: totalAmount,
          status: "PENDING",
          items: {
            create: cartItems.map((item) => ({
              productId: item.id || item.productId,
              name: item.name || "Produk MANTRA", 
              quantity: item.quantity,
              price: item.price,
              size: item.selectedSize || item.size || "M", 
              color: item.selectedColor || item.color || "BLACK", 
            })),
          },
        },
      });

      // 2. KUNCI RAHASIA: POTONG STOK PRODUK OTOMATIS!
      for (const item of cartItems) {
        const prodId = item.id || item.productId;
        await tx.product.update({
          where: { id: prodId },
          data: {
            stock: {
              decrement: item.quantity // <--- Stok langsung berkurang
            }
          }
        });
      }

      return newOrder;
    });

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Failed to create order:", error);
    return { success: false, error: "Gagal membuat pesanan ke database." };
  }
}