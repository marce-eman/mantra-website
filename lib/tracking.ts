/**
 * Helper utility to map courier name to the official tracking portal landing page (No deep linking).
 */
export function getTrackingUrl(courierName?: string | null, _waybillNumber?: string | null): string {
  const courier = (courierName || "").toUpperCase().trim();

  if (courier.includes("SICEPAT")) {
    return "https://www.sicepat.com/checkAwb";
  }

  if (courier.includes("JNE")) {
    return "https://www.jne.co.id/";
  }

  if (courier.includes("J&T") || courier.includes("JNT") || courier.includes("JET")) {
    return "https://jet.co.id/";
  }

  if (courier.includes("ANTERAJA")) {
    return "https://anteraja.id/tracking";
  }

  if (courier.includes("POS")) {
    return "https://www.posindonesia.co.id/";
  }

  if (courier.includes("TIKI")) {
    return "https://www.tiki.id/";
  }

  if (courier.includes("DHL")) {
    return "https://www.dhl.com/id-en/home/tracking.html";
  }

  if (courier.includes("FEDEX")) {
    return "https://www.fedex.com/en-id/tracking.html";
  }

  if (courier.includes("ARAMEX")) {
    return "https://www.aramex.com/track/results";
  }

  // Fallback to Biteship universal tracking portal
  return "https://biteship.com/tracking";
}
