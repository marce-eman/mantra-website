// app/api/admin/orders/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Ambil semua daftar pesanan
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: true, 
          }
        },
        user: true, 
      },
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch orders" }, { status: 500 });
  }
}

// PATCH: Update Status, Courier, & Tracking Number + Logika Stok
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, courier, trackingNumber } = body;

    if (!id) {
      return NextResponse.json({ message: "Order ID is required" }, { status: 400 });
    }

    // Gunakan transaksi agar update order dan stok sinkron
    const result = await prisma.$transaction(async (tx) => {
      // Ambil order saat ini untuk mengecek status sebelumnya
      const currentOrder = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!currentOrder) {
        throw new Error("Order not found");
      }

      // --- LOGIKA PENGEMBALIAN STOK (POIN 2) ---
      // Jika status BERUBAH menjadi CANCELED, kembalikan stok
      if (status === "CANCELED" && currentOrder.status !== "CANCELED") {
        for (const item of currentOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      } 
      // Opsi: Jika admin mengubah dari CANCELED kembali ke status lain, kurangi stok lagi
      else if (currentOrder.status === "CANCELED" && status !== "CANCELED") {
         for (const item of currentOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      // Update order dengan data terbaru
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status,
          courier,
          trackingNumber,
        },
      });

      return updatedOrder;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("=== ERROR SAAT UPDATE ORDER ===", error);
    return NextResponse.json(
      { message: "Failed to update order", error: error.message }, 
      { status: 500 }
    );
  }
}

// DELETE: Hapus Order (POIN 3)
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
       return NextResponse.json({ message: "Order ID is required" }, { status: 400 });
    }

    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error: any) {
    console.error("=== ERROR SAAT DELETE ORDER ===", error);
    return NextResponse.json(
      { message: "Failed to delete order", error: error.message }, 
      { status: 500 }
    );
  }
}