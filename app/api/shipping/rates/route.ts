import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface CartItemInput {
  productId?: string;
  id?: string;
  name?: string;
  price?: number;
  quantity: number;
  weight?: number;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { destination_postal_code, destination_area_id, items } = body;

    if (!destination_postal_code && !destination_area_id) {
      return NextResponse.json(
        { success: false, message: "Destination postal code or area ID is required." },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart items are required to calculate shipping." },
        { status: 400 }
      );
    }

    // Collect product IDs to retrieve accurate weights from DB if not provided
    const productIds = items
      .map((i: CartItemInput) => i.productId || i.id)
      .filter((id): id is string => Boolean(id));

    const dbProducts = productIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true, price: true, weight: true },
        })
      : [];

    const dbProductMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Format items for Biteship
    const biteshipItems = items.map((item: CartItemInput, idx: number) => {
      const pId = item.productId || item.id;
      const dbProduct = pId ? dbProductMap.get(pId) : null;
      const itemName = item.name || dbProduct?.name || `Item ${idx + 1}`;
      const itemWeight = item.weight || dbProduct?.weight || 500;
      const itemPrice = item.price || dbProduct?.price || 100000;
      const quantity = Math.max(1, Number(item.quantity) || 1);

      return {
        name: itemName.slice(0, 50),
        description: itemName.slice(0, 50),
        value: Math.round(Number(itemPrice)),
        length: 15,
        width: 15,
        height: 5,
        weight: Number(itemWeight),
        quantity: quantity,
      };
    });

    const apiKey = process.env.BITESHIP_API_KEY;
    const originLocationId = process.env.BITESHIP_ORIGIN_LOCATION_ID;
    const originPostalCode = process.env.BITESHIP_ORIGIN_POSTAL_CODE ? Number(process.env.BITESHIP_ORIGIN_POSTAL_CODE) : 12930;

    if (!apiKey) {
      console.warn("[BITESHIP]: BITESHIP_API_KEY is not configured in environment variables.");
    }

    const biteshipPayload: Record<string, any> = {
      couriers: "jne,sicepat,jnt,anteraja,tiki,pos,gojek,grab",
      items: biteshipItems,
    };

    if (originLocationId) {
      biteshipPayload.origin_location_id = originLocationId;
    } else {
      biteshipPayload.origin_postal_code = originPostalCode;
    }

    // Dynamic destination from user request body
    const postalCodeClean = destination_postal_code
      ? Number(String(destination_postal_code).replace(/\D/g, ""))
      : null;

    if (destination_area_id) {
      biteshipPayload.destination_area_id = destination_area_id;
    } else if (postalCodeClean) {
      biteshipPayload.destination_postal_code = postalCodeClean;
    }

    console.log("[BITESHIP RATE REQUEST PAYLOAD]:", JSON.stringify(biteshipPayload, null, 2));

    let rates: any[] = [];
    let isLive = false;

    try {
      const biteshipRes = await fetch("https://api.biteship.com/v1/rates/couriers", {
        method: "POST",
        headers: {
          Authorization: apiKey || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(biteshipPayload),
        cache: "no-store",
      });

      const biteshipData = await biteshipRes.json();
      console.log(`[BITESHIP RATE RESPONSE STATUS]: ${biteshipRes.status}`);
      console.log("[BITESHIP RATE RESPONSE DATA]:", JSON.stringify(biteshipData, null, 2));

      if (biteshipRes.ok && biteshipData?.pricing && Array.isArray(biteshipData.pricing) && biteshipData.pricing.length > 0) {
        rates = biteshipData.pricing.map((rate: any) => ({
          courier_name: (rate.courier_name || rate.courier_code || "").toUpperCase(),
          courier_code: rate.courier_code,
          courier_service_name: rate.courier_service_name || rate.service_type || "Standard",
          courier_service_code: rate.courier_service_code || "reg",
          duration: rate.duration || `${rate.shipment_duration_range || "1-3"} ${rate.shipment_duration_unit || "days"}`,
          price: Number(rate.price) || 0,
          description: rate.description || `${rate.courier_name} ${rate.courier_service_name}`,
        }));
        isLive = true;
      } else {
        console.warn("[BITESHIP API WARNING / NO PRICING]:", biteshipData?.message || biteshipData);
      }
    } catch (fetchErr) {
      console.error("[BITESHIP FETCH ERROR]:", fetchErr);
    }

    // Graceful fallback rates if live API returned empty or during testing without valid courier coverage
    if (rates.length === 0) {
      const totalWeightGrams = biteshipItems.reduce(
        (sum, item) => sum + item.weight * item.quantity,
        0
      );
      const weightMultiplier = Math.max(1, Math.ceil(totalWeightGrams / 1000));

      rates = [
        {
          courier_name: "JNE",
          courier_code: "jne",
          courier_service_name: "Reguler (REG)",
          courier_service_code: "reg",
          duration: "2 - 3 days",
          price: 18000 * weightMultiplier,
          description: "JNE Regular Service",
        },
        {
          courier_name: "SICEPAT",
          courier_code: "sicepat",
          courier_service_name: "BEST (Next Day)",
          courier_service_code: "best",
          duration: "1 day",
          price: 24000 * weightMultiplier,
          description: "SiCepat Besok Sampai Tujuan",
        },
        {
          courier_name: "J&T",
          courier_code: "jnt",
          courier_service_name: "EZ (Standard)",
          courier_service_code: "ez",
          duration: "1 - 2 days",
          price: 19000 * weightMultiplier,
          description: "J&T Express Standard",
        },
        {
          courier_name: "ANTERAJA",
          courier_code: "anteraja",
          courier_service_name: "Regular",
          courier_service_code: "reg",
          duration: "2 - 3 days",
          price: 17000 * weightMultiplier,
          description: "AnterAja Regular Delivery",
        },
      ];
    }

    return NextResponse.json({
      success: true,
      isLive,
      destinationPostalCode: destination_postal_code || null,
      destinationAreaId: destination_area_id || null,
      rates,
    });
  } catch (error: any) {
    console.error("[SHIPPING RATES ERROR]:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
