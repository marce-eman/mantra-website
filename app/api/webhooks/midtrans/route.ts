import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
    } = body;

    if (!order_id || !status_code || !gross_amount || !signature_key) {
      return NextResponse.json(
        { message: "Missing required notification fields" },
        { status: 400 }
      );
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error("[MIDTRANS WEBHOOK]: MIDTRANS_SERVER_KEY is not configured.");
      return NextResponse.json({ message: "Server misconfiguration" }, { status: 500 });
    }

    // Verify SHA-512 signature: SHA512(order_id + status_code + gross_amount + ServerKey)
    const expectedSignature = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest("hex");

    if (signature_key !== expectedSignature) {
      console.warn("[MIDTRANS WEBHOOK]: Invalid signature mismatch for order", order_id);
      return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
    }

    // Find the order by orderNumber or id
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ orderNumber: order_id }, { id: order_id }],
      },
      include: { items: true },
    });

    if (!order) {
      console.warn("[MIDTRANS WEBHOOK]: Order not found:", order_id);
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    let targetPaymentStatus = order.paymentStatus;
    let targetOrderStatus = order.status;

    if (transaction_status === "capture") {
      if (fraud_status === "accept") {
        targetPaymentStatus = "PAID";
        targetOrderStatus = "PAID";
      } else if (fraud_status === "challenge") {
        targetPaymentStatus = "CHALLENGE";
        targetOrderStatus = "PENDING";
      }
    } else if (transaction_status === "settlement") {
      targetPaymentStatus = "PAID";
      targetOrderStatus = "PAID";
    } else if (transaction_status === "pending") {
      targetPaymentStatus = "PENDING";
      targetOrderStatus = "PENDING";
    } else if (
      transaction_status === "deny" ||
      transaction_status === "cancel" ||
      transaction_status === "expire"
    ) {
      targetPaymentStatus = transaction_status === "expire" ? "EXPIRED" : "CANCELLED";
      targetOrderStatus = "CANCELED";
    } else if (transaction_status === "refund") {
      targetPaymentStatus = "REFUNDED";
      targetOrderStatus = "CANCELED";
    }

    // Update database in transaction
    await prisma.$transaction(async (tx) => {
      // If order is canceled and previously wasn't canceled, restore stocks
      if (targetOrderStatus === "CANCELED" && order.status !== "CANCELED") {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: targetPaymentStatus,
          status: targetOrderStatus,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Order ${order_id} updated: paymentStatus=${targetPaymentStatus}, status=${targetOrderStatus}`,
    });
  } catch (error: any) {
    console.error("[MIDTRANS WEBHOOK ERROR]:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
