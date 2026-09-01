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
    // --- PERBAIKAN HIGH-3: AMBIL HARGA ASLI DARI DATABASE ---
    // 1. Ambil semua ID produk dari keranjang
    const productIds = cartItems.map((item) => item.id || item.productId).filter(Boolean);

    if (productIds.length === 0) {
      return { success: false, error: "Data produk tidak valid." };
    }

    // 2. Fetch harga & stok dari DATABASE
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true, stock: true, name: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // 3. Validasi setiap item dan hitung total dari harga server
    let verifiedTotal = 0;
    for (const item of cartItems) {
      const prodId = item.id || item.productId;
      const product = productMap.get(prodId);

      if (!product) {
        return { success: false, error: `Produk tidak ditemukan: ${prodId}` };
      }
      
      // Validasi stok sekalian, biar gak jebol kalau ada yang beli pas stok kosong
      if (product.stock < item.quantity) {
        return { 
          success: false, 
          error: `Stok "${product.name}" tidak mencukupi. Tersedia: ${product.stock}` 
        };
      }
      
      // Gunakan harga dari DB, bukan dari client!
      verifiedTotal += product.price * item.quantity;
    }

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
          totalAmount: verifiedTotal, // <-- Pake total yang udah diverifikasi
          status: "PENDING",
          items: {
            create: cartItems.map((item) => {
              const prodId = item.id || item.productId;
              const product = productMap.get(prodId)!;
              return {
                productId: prodId,
                name: product.name, 
                quantity: item.quantity,
                price: product.price, // <-- Simpan harga asli dari DB
                size: item.selectedSize || item.size || "M", 
                color: item.selectedColor || item.color || "BLACK", 
              };
            }),
          },
        },
      });

      // 2. KUNCI RAHASIA: POTONG STOK PRODUK OTOMATIS
      for (const item of cartItems) {
        const prodId = item.id || item.productId;
        await tx.product.update({
          where: { id: prodId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      return newOrder;
    });

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Failed to create order:", error);
    return { success: false, error: "Gagal membuat pesanan. Silakan coba lagi." };
  }
}