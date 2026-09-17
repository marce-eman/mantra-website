import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: orderId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found." },
        { status: 404 }
      );
    }

    if (order.status === "PAID" || order.paymentStatus === "PAID") {
      return NextResponse.json(
        { success: false, error: "Order is already paid." },
        { status: 400 }
      );
    }

    // If order already has a snapToken, return it
    if (order.snapToken) {
      return NextResponse.json({
        success: true,
        snapToken: order.snapToken,
        orderId: order.id,
        orderNumber: order.orderNumber,
      });
    }

    // Otherwise, generate a new Snap Token from Midtrans
    const serverKey = process.env.MIDTRANS_SERVER_KEY?.trim() || "";
    if (!serverKey) {
      return NextResponse.json(
        { success: false, error: "Payment gateway configuration error." },
        { status: 500 }
      );
    }

    const authHeader = `Basic ${Buffer.from(serverKey + ":").toString("base64")}`;
    const midtransOrderId = `MANTRA-${order.id.slice(0, 8)}-${Date.now()}`;

    // Item details
    const midtransItemDetails = order.items.map((item, idx) => ({
      id: (item.productId || `item-${idx + 1}`).slice(0, 50),
      price: Math.round(Number(item.price)),
      quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
      name: (item.name || `Item ${idx + 1}`).slice(0, 50),
    }));

    if (order.shippingCost > 0) {
      midtransItemDetails.push({
        id: "SHIPPING_FEE",
        price: Math.round(order.shippingCost),
        quantity: 1,
        name: `Shipping (${order.shippingCourier || "Courier"} ${order.shippingService || ""})`.trim().slice(0, 50),
      });
    }

    const midtransPayload = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: Math.round(order.totalAmount),
      },
      customer_details: {
        first_name: order.recipientName,
        email: order.email || session.user.email || "customer@mantra.com",
        phone: order.phone,
        billing_address: {
          first_name: order.recipientName,
          phone: order.phone,
          address: order.address,
        },
        shipping_address: {
          first_name: order.recipientName,
          phone: order.phone,
          address: order.address,
        },
      },
      item_details: midtransItemDetails,
      callbacks: {
        finish: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/order-received?order_id=${order.id}`,
      },
    };

    const snapApiUrl = "https://app.sandbox.midtrans.com/snap/v1/transactions";
    console.log("[MIDTRANS TARGET URL]:", snapApiUrl, `(Repay Order: ${midtransOrderId})`);

    const snapRes = await fetch(snapApiUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(midtransPayload),
    });

    const snapData = await snapRes.json();

    if (!snapRes.ok || !snapData?.token) {
      console.error("[MIDTRANS REPAY SNAP ERROR]:", snapData);
      const rawError = snapData?.error_messages?.[0] || snapData?.message || "Failed to generate Snap token";
      return NextResponse.json(
        {
          success: false,
          error: rawError,
        },
        { status: 500 }
      );
    }

    const snapToken = snapData.token;

    await prisma.order.update({
      where: { id: order.id },
      data: {
        snapToken,
        orderNumber: midtransOrderId,
      },
    });

    return NextResponse.json({
      success: true,
      snapToken,
      orderId: order.id,
      orderNumber: midtransOrderId,
    });
  } catch (error: any) {
    console.error("[ORDER REPAY ERROR]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process payment retry" },
      { status: 500 }
    );
  }
}
