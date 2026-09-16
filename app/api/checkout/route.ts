import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface OrderItemInput {
  productId: string;
  name?: string;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
  weight?: number;
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in to complete checkout.", message: "Unauthorized. Please log in to complete checkout." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      items,
      recipientName,
      email,
      phone,
      shippingAddress,
      shippingCourier,
      shippingService,
      shippingCost = 0,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Your cart is empty.", message: "Your cart is empty." },
        { status: 400 }
      );
    }

    if (!recipientName || !phone || !shippingAddress) {
      return NextResponse.json(
        { success: false, error: "Name, phone number, and address are required.", message: "Name, phone number, and address are required." },
        { status: 400 }
      );
    }

    // 1. SANITASI & VALIDASI SERVER KEY (Sandbox environment)
    const serverKey = process.env.MIDTRANS_SERVER_KEY?.trim() || "";
    if (!serverKey) {
      console.error("[MIDTRANS CHECKOUT ERROR]: MIDTRANS_SERVER_KEY is not configured or empty.");
      return NextResponse.json(
        { success: false, error: "Payment gateway server key is not configured.", message: "Payment gateway configuration error." },
        { status: 500 }
      );
    }

    // Calculate item subtotal (integer)
    const itemsSubtotal = items.reduce(
      (sum: number, item: OrderItemInput) => sum + Math.round(Number(item.price)) * Math.max(1, Math.round(Number(item.quantity) || 1)),
      0
    );
    const parsedShippingCost = Math.max(0, Math.round(Number(shippingCost) || 0));
    const grossAmount = Math.round(Number(itemsSubtotal + parsedShippingCost));

    // Temporary order number
    const tempOrderNumber = `MTR-${Date.now()}`;

    // Perform DB transaction: create order, decrement stocks, clear cart
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: tempOrderNumber,
          userId: session.user.id,
          recipientName: recipientName.trim(),
          email: email?.trim() || session.user.email || "no-email@mantra.com",
          phone: phone.trim(),
          address: shippingAddress.trim(),
          totalAmount: grossAmount,
          status: "PENDING",
          paymentStatus: "PENDING",
          courier: shippingCourier ? `${shippingCourier} - ${shippingService || "Standard"}` : "PENDING",
          shippingCourier: shippingCourier || null,
          shippingService: shippingService || null,
          shippingCost: parsedShippingCost,
          items: {
            create: items.map((item: OrderItemInput) => ({
              productId: item.productId,
              name: item.name || "Mantra Item",
              size: item.size || "ALL SIZE",
              color: item.color || "BLACK",
              quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
              price: Math.round(Number(item.price)),
            })),
          },
        },
      });

      // Decrement stock for purchased products
      for (const item of items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: Math.max(1, Math.round(Number(item.quantity) || 1)),
              },
            },
          });
        }
      }

      // Clear user's cart in DB
      await tx.cartItem.deleteMany({
        where: { userId: session.user.id },
      });

      return newOrder;
    });

    // 2. ENSURE VALID PAYLOAD & UNIQUE ORDER ID
    const midtransOrderId = `MANTRA-${order.id.slice(0, 8)}-${Date.now()}`;

    // Update orderNumber in DB with the unique Midtrans order id
    await prisma.order.update({
      where: { id: order.id },
      data: { orderNumber: midtransOrderId },
    });

    const authHeader = `Basic ${Buffer.from(serverKey + ":").toString("base64")}`;

    // Item details for Midtrans (must sum to gross_amount)
    const midtransItemDetails = items.map((item: OrderItemInput, idx: number) => ({
      id: (item.productId || `item-${idx + 1}`).slice(0, 50),
      price: Math.round(Number(item.price)),
      quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
      name: (item.name || `Item ${idx + 1}`).slice(0, 50),
    }));

    if (parsedShippingCost > 0) {
      midtransItemDetails.push({
        id: "SHIPPING_FEE",
        price: parsedShippingCost,
        quantity: 1,
        name: `Shipping (${shippingCourier || "Courier"} ${shippingService || ""})`.trim().slice(0, 50),
      });
    }

    const midtransPayload = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: recipientName.trim(),
        email: email?.trim() || session.user.email || "customer@mantra.com",
        phone: phone.trim(),
        billing_address: {
          first_name: recipientName.trim(),
          phone: phone.trim(),
          address: shippingAddress.trim(),
        },
        shipping_address: {
          first_name: recipientName.trim(),
          phone: phone.trim(),
          address: shippingAddress.trim(),
        },
      },
      item_details: midtransItemDetails,
      callbacks: {
        finish: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/order-success?orderId=${order.id}`,
      },
    };

    // 3. IMPROVE ERROR LOGGING & SNAP TOKEN GENERATION
    try {
      const snapRes = await fetch("https://app.sandbox.midtrans.com/snap/v1/transactions", {
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
        console.error("[MIDTRANS SNAP ERROR]:", {
          status: snapRes.status,
          statusText: snapRes.statusText,
          response: snapData,
        });
        return NextResponse.json(
          {
            success: false,
            error: snapData?.error_messages?.[0] || snapData?.message || "Failed to generate Snap token from Midtrans",
            message: snapData?.error_messages?.[0] || snapData?.message || "Failed to generate Snap token from Midtrans",
            details: snapData,
          },
          { status: 500 }
        );
      }

      const snapToken = snapData.token;
      const redirectUrl = snapData.redirect_url;

      // Save snapToken to order
      await prisma.order.update({
        where: { id: order.id },
        data: { snapToken },
      });

      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderNumber: midtransOrderId,
        snapToken,
        token: snapToken,
        redirectUrl,
      });
    } catch (midtransErr: any) {
      console.error("[MIDTRANS SNAP EXCEPTION]:", midtransErr);
      return NextResponse.json(
        {
          success: false,
          error: midtransErr?.message || "Failed to generate Snap token",
          message: midtransErr?.message || "Failed to generate Snap token",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[CHECKOUT ERROR]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to process checkout",
        message: error?.message || "Failed to process checkout",
      },
      { status: 500 }
    );
  }
}
