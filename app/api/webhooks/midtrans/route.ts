import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { status: "OK", message: "Invalid JSON or empty body received" },
        { status: 200 }
      );
    }

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body;

    // Handle Midtrans Dashboard "Test Notification" or ping payload
    if (!order_id || String(order_id).toLowerCase().includes("test") || !status_code) {
      console.log("[MIDTRANS WEBHOOK]: Test or ping notification received:", body);
      return NextResponse.json(
        { status: "OK", message: "Test notification received successfully" },
        { status: 200 }
      );
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error("[MIDTRANS WEBHOOK]: MIDTRANS_SERVER_KEY is not configured in environment.");
      return NextResponse.json(
        { status: "OK", message: "Server misconfiguration, acknowledged" },
        { status: 200 }
      );
    }

    // Verify SHA-512 signature: SHA512(order_id + status_code + gross_amount + ServerKey)
    if (signature_key && gross_amount) {
      const expectedSignature = crypto
        .createHash("sha512")
        .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
        .digest("hex");

      if (signature_key !== expectedSignature) {
        console.warn("[MIDTRANS WEBHOOK]: Signature mismatch for order:", order_id);
        // Still return 200 OK so Midtrans connection does not fail
        return NextResponse.json(
          { status: "OK", message: "Signature mismatch ignored" },
          { status: 200 }
        );
      }
    }

    // Find the order by orderNumber or id
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ orderNumber: String(order_id) }, { id: String(order_id) }],
      },
      include: { items: true },
    });

    // If order does not exist in DB (e.g. test dummy payload from Midtrans dashboard)
    if (!order) {
      console.log("[MIDTRANS WEBHOOK]: Order not found in database (likely test payload):", order_id);
      return NextResponse.json(
        { status: "OK", message: "Notification received (order not found in database)" },
        { status: 200 }
      );
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
      // If order is canceled and previously wasn't canceled, restore product stock
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
      status: "OK",
      message: `Order ${order_id} updated: paymentStatus=${targetPaymentStatus}, status=${targetOrderStatus}`,
    });
  } catch (error: any) {
    console.error("[MIDTRANS WEBHOOK ERROR]:", error);
    // Always return 200 OK so Midtrans maintains the webhook status
    return NextResponse.json(
      { status: "OK", message: "Webhook processed with fallback" },
      { status: 200 }
    );
  }
}
