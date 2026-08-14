"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface OrderItemInput {
  productId: string;
  name?: string;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
}

interface CreateOrderParams {
  items: OrderItemInput[];
  totalAmount: number;
  shippingAddress: string;
  recipientName?: string;
  email?: string;
  phone?: string;
}

export async function createOrderAction({
  items,
  totalAmount,
  shippingAddress,
  recipientName,
  email,
  phone
}: CreateOrderParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Kamu harus login terlebih dahulu." };
  }

  try {
    // Generate Order Number unik (MTR-YYYYMMDD-XXX)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomNum = Math.floor(100 + Math.random() * 900);
    const orderNumber = `MTR-${dateStr}-${randomNum}`;

    // --- GUNAKAN $TRANSACTION AGAR AMAN ---
    const order = await prisma.$transaction(async (tx) => {
      
      // 1. Buat pesanan baru
      const newOrder = await tx.order.create({
        data: {
          orderNumber: orderNumber,
          userId: session.user.id,
          recipientName: recipientName || session.user.name || "Customer",
          email: email || session.user.email || "no-email",
          phone: phone || "-", 
          address: shippingAddress || "-", 
          totalAmount: totalAmount, 
          status: "PENDING",
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              name: item.name || "Produk MANTRA",
              size: item.size || "ALL SIZE",
              color: item.color || "BLACK",
              quantity: Number(item.quantity),
              price: item.price,
            })),
          },
        },
      });

      // 2. POTONG STOK PRODUK OTOMATIS!
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: Number(item.quantity) // <--- Stok langsung berkurang
            }
          }
        });
      }

      // 3. Bersihkan keranjang belanja
      await tx.cartItem.deleteMany({
        where: { userId: session.user.id },
      });

      return newOrder;
    });

    return { success: true, orderId: order.id };
  } catch (error: any) {
    console.error("=== PRISMA CREATE ORDER ERROR ===", error);
    return {
      success: false,
      error: `Gagal membuat pesanan: ${error?.message || "Database error"}`,
    };
  }
}