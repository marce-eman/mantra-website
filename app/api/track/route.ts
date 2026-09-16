import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get("order");

    if (!orderNumber) {
      return NextResponse.json({ message: "Order ID is required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: {
        orderNumber: orderNumber,
      },
      select: {
        orderNumber: true,
        recipientName: true,
        status: true,
        paymentStatus: true,
        courier: true,
        shippingCourier: true,
        shippingService: true,
        shippingCost: true,
        trackingNumber: true,
        totalAmount: true,
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}