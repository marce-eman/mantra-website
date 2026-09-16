import { getSiteSetting } from "@/lib/siteSettings";
import FaqClient from "./FaqClient";

export default async function FaqPage() {
  const whatsappNumber = await getSiteSetting("admin_whatsapp");
  return <FaqClient whatsappNumber={whatsappNumber} />;
}