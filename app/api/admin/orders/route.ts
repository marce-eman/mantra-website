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
            product: true, // <--- INI KUNCI RAHASIANYA! Biar nama baju ikut ke-load
          }
        },
        user: true, // (Opsional) Biar data akun pembeli juga ikut terbawa kalau dibutuhkan
      },
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch orders" }, { status: 500 });
  }
}

// PATCH: Update Status, Courier, & Tracking Number
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, courier, trackingNumber } = body;

    if (!id) {
      return NextResponse.json({ message: "Order ID is required" }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        courier,
        trackingNumber,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    // KITA TAMBAHKAN CONSOLE.LOG DI SINI BIAR KETAHUAN ERRORNYA!
    console.error("=== ERROR SAAT UPDATE ORDER ===", error);
    
    return NextResponse.json(
      { message: "Failed to update order", error: error.message }, 
      { status: 500 }
    );
  }
}