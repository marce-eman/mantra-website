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
    const {
      destination_country = "ID",
      destination_postal_code,
      destination_area_id,
      destination_area_name,
      destination_city,
      destination_state,
      address,
      items,
    } = body;

    const isInternational = Boolean(
      destination_country &&
      destination_country !== "ID" &&
      destination_country !== "IDN" &&
      destination_country.toLowerCase() !== "indonesia"
    );

    if (!destination_postal_code && !destination_area_id && !address && !destination_city && !isInternational) {
      return NextResponse.json(
        { success: false, message: "Destination postal code, area, city, or address is required." },
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
    const originPostalCode = process.env.BITESHIP_ORIGIN_POSTAL_CODE
      ? Number(process.env.BITESHIP_ORIGIN_POSTAL_CODE)
      : 40191;

    if (!apiKey) {
      console.warn("[BITESHIP]: BITESHIP_API_KEY is not configured in environment variables.");
    }

    const biteshipPayload: Record<string, any> = {
      couriers: isInternational
        ? "dhl,fedex,aramex,pos"
        : "jne,sicepat,jnt,anteraja,tiki,pos,gojek,grab",
      items: biteshipItems,
    };

    if (originLocationId) {
      biteshipPayload.origin_location_id = originLocationId;
    } else {
      biteshipPayload.origin_postal_code = originPostalCode;
    }

    if (isInternational) {
      biteshipPayload.destination_country = destination_country;
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

    // Fallback calculation (International & Domestic)
    if (rates.length === 0) {
      const totalWeightGrams = biteshipItems.reduce(
        (sum, item) => sum + item.weight * item.quantity,
        0
      );
      const weightMultiplier = Math.max(1, Math.ceil(totalWeightGrams / 1000));

      if (isInternational) {
        const countryCode = destination_country.toUpperCase().trim();
        const countryText = `${destination_country} ${destination_city || ""} ${destination_area_name || ""} ${address || ""}`.toLowerCase();

        // 1. Southeast Asia (SG, MY, TH, PH, VN, BN, etc.)
        if (
          ["SG", "MY", "TH", "PH", "VN", "BN", "KH", "LA", "MM"].includes(countryCode) ||
          countryText.includes("singapore") ||
          countryText.includes("malaysia") ||
          countryText.includes("thailand") ||
          countryText.includes("philippines")
        ) {
          rates = [
            {
              courier_name: "DHL",
              courier_code: "dhl",
              courier_service_name: "Express Worldwide",
              courier_service_code: "express",
              duration: "2 - 4 days",
              price: 350000 * weightMultiplier,
              description: "DHL Express Southeast Asia (Tracked)",
            },
            {
              courier_name: "FEDEX",
              courier_code: "fedex",
              courier_service_name: "International Priority",
              courier_service_code: "priority",
              duration: "2 - 3 days",
              price: 380000 * weightMultiplier,
              description: "FedEx International Priority (Tracked)",
            },
            {
              courier_name: "POS",
              courier_code: "pos",
              courier_service_name: "EMS International",
              courier_service_code: "ems",
              duration: "4 - 8 days",
              price: 230000 * weightMultiplier,
              description: "Pos Indonesia International EMS",
            },
          ];
        }
        // 2. East Asia & Oceania (JP, KR, CN, HK, TW, AU, NZ)
        else if (
          ["JP", "KR", "CN", "HK", "TW", "AU", "NZ"].includes(countryCode) ||
          countryText.includes("japan") ||
          countryText.includes("korea") ||
          countryText.includes("australia") ||
          countryText.includes("hong kong") ||
          countryText.includes("china")
        ) {
          rates = [
            {
              courier_name: "DHL",
              courier_code: "dhl",
              courier_service_name: "Express Worldwide",
              courier_service_code: "express",
              duration: "3 - 5 days",
              price: 450000 * weightMultiplier,
              description: "DHL Express Asia-Pacific (Tracked)",
            },
            {
              courier_name: "FEDEX",
              courier_code: "fedex",
              courier_service_name: "International Priority",
              courier_service_code: "priority",
              duration: "3 - 5 days",
              price: 490000 * weightMultiplier,
              description: "FedEx International Priority (Tracked)",
            },
            {
              courier_name: "ARAMEX",
              courier_code: "aramex",
              courier_service_name: "Global Express",
              courier_service_code: "express",
              duration: "4 - 7 days",
              price: 390000 * weightMultiplier,
              description: "Aramex Global Express Delivery",
            },
          ];
        }
        // 3. Americas & Europe (US, CA, GB, DE, FR, IT, NL, ES, CH, etc.)
        else if (
          ["US", "USA", "CA", "GB", "UK", "DE", "FR", "IT", "NL", "ES", "CH", "SE", "NO", "DK"].includes(countryCode) ||
          countryText.includes("united states") ||
          countryText.includes("america") ||
          countryText.includes("united kingdom") ||
          countryText.includes("germany") ||
          countryText.includes("france") ||
          countryText.includes("canada")
        ) {
          rates = [
            {
              courier_name: "DHL",
              courier_code: "dhl",
              courier_service_name: "Express Worldwide",
              courier_service_code: "express",
              duration: "3 - 6 days",
              price: 550000 * weightMultiplier,
              description: "DHL Express Worldwide (Air Courier)",
            },
            {
              courier_name: "FEDEX",
              courier_code: "fedex",
              courier_service_name: "International Priority",
              courier_service_code: "priority",
              duration: "3 - 5 days",
              price: 580000 * weightMultiplier,
              description: "FedEx International Priority Door-to-Door",
            },
            {
              courier_name: "ARAMEX",
              courier_code: "aramex",
              courier_service_name: "Global Express",
              courier_service_code: "express",
              duration: "5 - 8 days",
              price: 480000 * weightMultiplier,
              description: "Aramex Global Courier Network",
            },
          ];
        }
        // 4. Rest of the World (Middle East, Africa, South America, etc.)
        else {
          rates = [
            {
              courier_name: "DHL",
              courier_code: "dhl",
              courier_service_name: "Express Worldwide",
              courier_service_code: "express",
              duration: "4 - 7 days",
              price: 650000 * weightMultiplier,
              description: "DHL Express Global Service",
            },
            {
              courier_name: "FEDEX",
              courier_code: "fedex",
              courier_service_name: "International Priority",
              courier_service_code: "priority",
              duration: "4 - 7 days",
              price: 690000 * weightMultiplier,
              description: "FedEx International Priority Global",
            },
            {
              courier_name: "ARAMEX",
              courier_code: "aramex",
              courier_service_name: "Global Express",
              courier_service_code: "express",
              duration: "6 - 10 days",
              price: 550000 * weightMultiplier,
              description: "Aramex Global Delivery",
            },
          ];
        }
      } else {
        const combinedText = `${destination_postal_code || ""} ${destination_area_name || ""} ${address || ""}`.toLowerCase();
        const postalString = destination_postal_code ? String(destination_postal_code).trim() : "";
        const prefix2 = postalString.length >= 2 ? parseInt(postalString.slice(0, 2), 10) : -1;

        let zoneConfig: {
          region: string;
          jne: { price: number; duration: string };
          sicepat: { price: number; duration: string };
          jnt: { price: number; duration: string };
          anteraja: { price: number; duration: string };
        };

        // Check Kalimantan Barat (Pontianak, Singkawang, etc.)
        if (
          (prefix2 >= 78 && prefix2 <= 79) ||
          combinedText.includes("pontianak") ||
          combinedText.includes("kalbar") ||
          combinedText.includes("kalimantan barat") ||
          combinedText.includes("singkawang") ||
          combinedText.includes("ketapang") ||
          combinedText.includes("sambas") ||
          combinedText.includes("sintang")
        ) {
          zoneConfig = {
            region: "Kalimantan Barat (Pontianak)",
            jne: { price: 38000, duration: "3 - 5 days" },
            sicepat: { price: 52000, duration: "2 - 3 days" },
            jnt: { price: 39000, duration: "3 - 5 days" },
            anteraja: { price: 36000, duration: "3 - 5 days" },
          };
        }
        // Check Kalimantan Lainnya (Banjarmasin, Samarinda, Balikpapan, dsb)
        else if (
          (prefix2 >= 70 && prefix2 <= 77) ||
          combinedText.includes("banjarmasin") ||
          combinedText.includes("samarinda") ||
          combinedText.includes("balikpapan") ||
          combinedText.includes("palangkaraya") ||
          combinedText.includes("tarakan") ||
          combinedText.includes("kalimantan")
        ) {
          zoneConfig = {
            region: "Kalimantan",
            jne: { price: 40000, duration: "3 - 5 days" },
            sicepat: { price: 55000, duration: "2 - 3 days" },
            jnt: { price: 41000, duration: "3 - 5 days" },
            anteraja: { price: 38000, duration: "3 - 5 days" },
          };
        }
        // Check Papua (Jayapura, Sorong, Merauke, dsb)
        else if (
          (prefix2 >= 98 && prefix2 <= 99) ||
          combinedText.includes("papua") ||
          combinedText.includes("jayapura") ||
          combinedText.includes("sorong") ||
          combinedText.includes("merauke") ||
          combinedText.includes("manokwari") ||
          combinedText.includes("timika")
        ) {
          zoneConfig = {
            region: "Papua",
            jne: { price: 85000, duration: "4 - 7 days" },
            sicepat: { price: 115000, duration: "3 - 4 days" },
            jnt: { price: 88000, duration: "4 - 7 days" },
            anteraja: { price: 82000, duration: "4 - 7 days" },
          };
        }
        // Check Sulawesi & Maluku (Makassar, Manado, Ambon, dsb)
        else if (
          (prefix2 >= 90 && prefix2 <= 97) ||
          combinedText.includes("makassar") ||
          combinedText.includes("manado") ||
          combinedText.includes("palu") ||
          combinedText.includes("kendari") ||
          combinedText.includes("gorontalo") ||
          combinedText.includes("ambon") ||
          combinedText.includes("ternate") ||
          combinedText.includes("sulawesi") ||
          combinedText.includes("maluku")
        ) {
          zoneConfig = {
            region: "Sulawesi & Maluku",
            jne: { price: 45000, duration: "3 - 5 days" },
            sicepat: { price: 62000, duration: "2 - 4 days" },
            jnt: { price: 46000, duration: "3 - 5 days" },
            anteraja: { price: 43000, duration: "3 - 5 days" },
          };
        }
        // Check Bali, NTB, NTT (Denpasar, Mataram, Kupang)
        else if (
          (prefix2 >= 80 && prefix2 <= 87) ||
          combinedText.includes("bali") ||
          combinedText.includes("denpasar") ||
          combinedText.includes("badung") ||
          combinedText.includes("lombok") ||
          combinedText.includes("mataram") ||
          combinedText.includes("kupang") ||
          combinedText.includes("ntb") ||
          combinedText.includes("ntt")
        ) {
          zoneConfig = {
            region: "Bali & Nusa Tenggara",
            jne: { price: 24000, duration: "2 - 3 days" },
            sicepat: { price: 34000, duration: "1 - 2 days" },
            jnt: { price: 25000, duration: "2 - 3 days" },
            anteraja: { price: 23000, duration: "2 - 3 days" },
          };
        }
        // Check Sumatera (Medan, Palembang, Padang, Lampung, Batam, dsb)
        else if (
          (prefix2 >= 20 && prefix2 <= 39) ||
          combinedText.includes("medan") ||
          combinedText.includes("palembang") ||
          combinedText.includes("padang") ||
          combinedText.includes("pekanbaru") ||
          combinedText.includes("lampung") ||
          combinedText.includes("batam") ||
          combinedText.includes("jambi") ||
          combinedText.includes("bengkulu") ||
          combinedText.includes("aceh") ||
          combinedText.includes("sumatera")
        ) {
          zoneConfig = {
            region: "Sumatera",
            jne: { price: 28000, duration: "2 - 4 days" },
            sicepat: { price: 42000, duration: "1 - 2 days" },
            jnt: { price: 29000, duration: "2 - 4 days" },
            anteraja: { price: 27000, duration: "2 - 4 days" },
          };
        }
        // Check Jawa Barat / Lokal Bandung (40 - 46)
        else if (
          (prefix2 >= 40 && prefix2 <= 46) ||
          combinedText.includes("bandung") ||
          combinedText.includes("cimahi") ||
          combinedText.includes("cirebon") ||
          combinedText.includes("sukabumi") ||
          combinedText.includes("garut") ||
          combinedText.includes("tasikmalaya") ||
          combinedText.includes("sumedang") ||
          combinedText.includes("jawa barat")
        ) {
          zoneConfig = {
            region: "Jawa Barat (Lokal/Bandung)",
            jne: { price: 10000, duration: "1 - 2 days" },
            sicepat: { price: 15000, duration: "1 day" },
            jnt: { price: 11000, duration: "1 - 2 days" },
            anteraja: { price: 10000, duration: "1 - 2 days" },
          };
        }
        // Check Jabodetabek & Banten (10 - 17)
        else if (
          (prefix2 >= 10 && prefix2 <= 17) ||
          combinedText.includes("jakarta") ||
          combinedText.includes("jaksel") ||
          combinedText.includes("jakbar") ||
          combinedText.includes("jakpus") ||
          combinedText.includes("jaktim") ||
          combinedText.includes("jakut") ||
          combinedText.includes("bogor") ||
          combinedText.includes("depok") ||
          combinedText.includes("tangerang") ||
          combinedText.includes("bekasi") ||
          combinedText.includes("jabodetabek")
        ) {
          zoneConfig = {
            region: "Jabodetabek",
            jne: { price: 12000, duration: "1 - 2 days" },
            sicepat: { price: 18000, duration: "1 day" },
            jnt: { price: 13000, duration: "1 - 2 days" },
            anteraja: { price: 11000, duration: "1 - 2 days" },
          };
        }
        // Check Jawa Timur (60 - 69)
        else if (
          (prefix2 >= 60 && prefix2 <= 69) ||
          combinedText.includes("surabaya") ||
          combinedText.includes("malang") ||
          combinedText.includes("sidoarjo") ||
          combinedText.includes("gresik") ||
          combinedText.includes("jawa timur") ||
          combinedText.includes("jatim")
        ) {
          zoneConfig = {
            region: "Jawa Timur",
            jne: { price: 19000, duration: "2 - 3 days" },
            sicepat: { price: 26000, duration: "1 - 2 days" },
            jnt: { price: 20000, duration: "2 - 3 days" },
            anteraja: { price: 18000, duration: "2 - 3 days" },
          };
        }
        // Check Jawa Tengah & DI Yogyakarta (50 - 59)
        else if (
          (prefix2 >= 50 && prefix2 <= 59) ||
          combinedText.includes("semarang") ||
          combinedText.includes("solo") ||
          combinedText.includes("surakarta") ||
          combinedText.includes("jogja") ||
          combinedText.includes("yogyakarta") ||
          combinedText.includes("jawa tengah") ||
          combinedText.includes("jateng")
        ) {
          zoneConfig = {
            region: "Jawa Tengah & DIY",
            jne: { price: 17000, duration: "2 - 3 days" },
            sicepat: { price: 24000, duration: "1 - 2 days" },
            jnt: { price: 18000, duration: "2 - 3 days" },
            anteraja: { price: 16000, duration: "2 - 3 days" },
          };
        }
        // Default Domestik Standar
        else {
          zoneConfig = {
            region: "Domestik Standar",
            jne: { price: 26000, duration: "2 - 4 days" },
            sicepat: { price: 36000, duration: "1 - 2 days" },
            jnt: { price: 27000, duration: "2 - 4 days" },
            anteraja: { price: 25000, duration: "2 - 4 days" },
          };
        }

        rates = [
          {
            courier_name: "JNE",
            courier_code: "jne",
            courier_service_name: "Reguler (REG)",
            courier_service_code: "reg",
            duration: zoneConfig.jne.duration,
            price: zoneConfig.jne.price * weightMultiplier,
            description: `JNE Regular Service (${zoneConfig.region})`,
          },
          {
            courier_name: "SICEPAT",
            courier_code: "sicepat",
            courier_service_name: "BEST (Next Day)",
            courier_service_code: "best",
            duration: zoneConfig.sicepat.duration,
            price: zoneConfig.sicepat.price * weightMultiplier,
            description: `SiCepat Besok Sampai Tujuan (${zoneConfig.region})`,
          },
          {
            courier_name: "J&T",
            courier_code: "jnt",
            courier_service_name: "EZ (Standard)",
            courier_service_code: "ez",
            duration: zoneConfig.jnt.duration,
            price: zoneConfig.jnt.price * weightMultiplier,
            description: `J&T Express Standard (${zoneConfig.region})`,
          },
          {
            courier_name: "ANTERAJA",
            courier_code: "anteraja",
            courier_service_name: "Regular",
            courier_service_code: "reg",
            duration: zoneConfig.anteraja.duration,
            price: zoneConfig.anteraja.price * weightMultiplier,
            description: `AnterAja Regular Delivery (${zoneConfig.region})`,
          },
        ];
      }
    }

    return NextResponse.json({
      success: true,
      isLive,
      destinationCountry: destination_country,
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
