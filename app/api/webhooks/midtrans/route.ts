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

    const serverKey = process.env.MIDTRANS_SERVER_KEY?.trim() || "";
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
    let order = await prisma.order.findFirst({
      where: {
        OR: [{ orderNumber: String(order_id) }, { id: String(order_id) }],
      },
      include: { items: true },
    });

    if (!order && String(order_id).startsWith("MANTRA-")) {
      const parts = String(order_id).split("-");
      if (parts[1]) {
        order = await prisma.order.findFirst({
          where: {
            id: { startsWith: parts[1] },
          },
          include: { items: true },
        });
      }
    }

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

    // 1. Handle Expanded Transaction Status
    if (transaction_status === "capture") {
      if (fraud_status === "accept" || !fraud_status) {
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
    } else if (transaction_status === "expire") {
      targetPaymentStatus = "EXPIRED";
      targetOrderStatus = "CANCELED";
    } else if (transaction_status === "cancel" || transaction_status === "deny") {
      targetPaymentStatus = "CANCELLED";
      targetOrderStatus = "CANCELED";
    } else if (transaction_status === "refund" || transaction_status === "partial_refund") {
      targetPaymentStatus = "REFUNDED";
      targetOrderStatus = "CANCELED";
    }

    // 2. Stock / Inventory Restoration on Expired or Cancelled status
    await prisma.$transaction(async (tx) => {
      const isNowCanceled = targetOrderStatus === "CANCELED" || targetPaymentStatus === "EXPIRED" || targetPaymentStatus === "CANCELLED";
      const wasNotCanceled = order.status !== "CANCELED" && order.paymentStatus !== "EXPIRED" && order.paymentStatus !== "CANCELLED";

      if (isNowCanceled && wasNotCanceled) {
        for (const item of order.items) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
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

    console.log(`[MIDTRANS WEBHOOK SUCCESS]: Order ${order.id} (${order.orderNumber}) updated -> paymentStatus=${targetPaymentStatus}, status=${targetOrderStatus}`);

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
