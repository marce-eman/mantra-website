"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface OrderItemInput {
  productId: string;
  quantity: number;
  price: number;
}

interface CreateOrderParams {
  items: OrderItemInput[];
  totalAmount: number;
  shippingAddress: string;
}

export async function createOrderAction({
  items,
  totalAmount,
  shippingAddress,
}: CreateOrderParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Kamu harus login terlebih dahulu." };
  }

  try {
    const order = await prisma.order.create({
    data: {
        userId: session.user.id,
        totalAmount: Math.round(totalAmount),
        address: shippingAddress, // Mengisi kolom address di database
        status: "PENDING",
        items: {
        create: items.map((item) => ({
            productId: item.productId,
            quantity: Number(item.quantity),
            price: Math.round(item.price),
        })),
        },
    },
    });

    // Bersihkan keranjang belanja di database setelah order berhasil
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id },
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