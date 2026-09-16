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
        { success: false, message: "Unauthorized. Please log in to complete checkout." },
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
        { success: false, message: "Your cart is empty." },
        { status: 400 }
      );
    }

    if (!recipientName || !phone || !shippingAddress) {
      return NextResponse.json(
        { success: false, message: "Name, phone number, and address are required." },
        { status: 400 }
      );
    }

    // Calculate item subtotal
    const itemsSubtotal = items.reduce(
      (sum: number, item: OrderItemInput) => sum + Number(item.price) * Number(item.quantity),
      0
    );
    const parsedShippingCost = Math.max(0, Math.round(Number(shippingCost) || 0));
    const grandTotal = itemsSubtotal + parsedShippingCost;

    // Generate Order Number: MTR-YYYYMMDD-XXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const orderNumber = `MTR-${dateStr}-${randomSuffix}`;

    // Perform DB transaction: create order, decrement stocks, clear cart
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          recipientName: recipientName.trim(),
          email: email?.trim() || session.user.email || "no-email@mantra.com",
          phone: phone.trim(),
          address: shippingAddress.trim(),
          totalAmount: grandTotal,
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
              quantity: Number(item.quantity) || 1,
              price: Number(item.price),
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
                decrement: Number(item.quantity) || 1,
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

    // Prepare Midtrans Snap Request
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error("[MIDTRANS]: MIDTRANS_SERVER_KEY is not configured.");
      return NextResponse.json(
        { success: false, message: "Payment gateway configuration error." },
        { status: 500 }
      );
    }
    const authHeader = `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`;

    // Item details for Midtrans (must sum to gross_amount)
    const midtransItemDetails = [
      ...items.map((item: OrderItemInput, idx: number) => ({
        id: (item.productId || `item-${idx + 1}`).slice(0, 50),
        price: Math.round(Number(item.price)),
        quantity: Math.max(1, Number(item.quantity) || 1),
        name: (item.name || `Item ${idx + 1}`).slice(0, 50),
      })),
    ];

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
        order_id: order.orderNumber,
        gross_amount: Math.round(grandTotal),
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

    let snapToken = "";
    let redirectUrl = "";

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

      if (snapRes.ok && snapData?.token) {
        snapToken = snapData.token;
        redirectUrl = snapData.redirect_url;

        // Save snapToken to order
        await prisma.order.update({
          where: { id: order.id },
          data: { snapToken },
        });
      } else {
        console.error("[MIDTRANS SNAP ERROR]:", snapData);
      }
    } catch (midtransErr) {
      console.error("[MIDTRANS FETCH ERROR]:", midtransErr);
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      snapToken,
      redirectUrl,
    });
  } catch (error: any) {
    console.error("[CHECKOUT ERROR]:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to process checkout" },
      { status: 500 }
    );
  }
}
