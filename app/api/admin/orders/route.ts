import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// --- FUNGSI SATPAM PENJAGA ---
async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ 
    where: { id: session.user.id }, 
    select: { role: true } 
  });
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden. Admin access required." }, { status: 403 });
  }
  return null; // Kalau aman, lanjut!
}

// GET: Ambil semua daftar pesanan
export async function GET() {
  try {
    const authError = await requireAdmin();
    if (authError) return authError; // Cegat di sini

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
    console.error("[GET ORDERS ERROR]:", error);
    return NextResponse.json({ message: "Failed to fetch orders" }, { status: 500 });
  }
}

// PATCH: Update Status, Courier, & Tracking Number + Logika Stok
export async function PATCH(req: Request) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError; // Cegat di sini

    const body = await req.json();
    const {
      id,
      status,
      courier,
      shippingCourier,
      shippingService,
      shippingCost,
      paymentStatus,
      trackingNumber,
    } = body;

    if (!id) {
      return NextResponse.json({ message: "Order ID is required" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const currentOrder = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!currentOrder) {
        throw new Error("Order not found");
      }

      if (status === "CANCELED" && currentOrder.status !== "CANCELED") {
        for (const item of currentOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      } 
      else if (currentOrder.status === "CANCELED" && status && status !== "CANCELED") {
         for (const item of currentOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      const updateData: Record<string, any> = {};
      if (status !== undefined) updateData.status = status;
      if (courier !== undefined) updateData.courier = courier;
      if (shippingCourier !== undefined) updateData.shippingCourier = shippingCourier;
      if (shippingService !== undefined) updateData.shippingService = shippingService;
      if (shippingCost !== undefined) updateData.shippingCost = Number(shippingCost);
      if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
      if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;

      const updatedOrder = await tx.order.update({
        where: { id },
        data: updateData,
      });

      return updatedOrder;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[UPDATE ORDER ERROR]:", error);
    return NextResponse.json({ message: "Failed to update order" }, { status: 500 });
  }
}

// DELETE: Hapus Order
export async function DELETE(req: Request) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError; // Cegat di sini

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
    console.error("[DELETE ORDER ERROR]:", error);
    return NextResponse.json({ message: "Failed to delete order" }, { status: 500 });
  }
}