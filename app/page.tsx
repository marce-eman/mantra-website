import { prisma } from "@/lib/prisma";
import HomeClient from "./HomeClient";
export const revalidate = 60;

export default async function Home() {
  // Fetch all active episodes
  const episodes = await prisma.episode.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    include: {
      articles: {
        orderBy: [{ articleNo: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  let heroManifesto =
    "A manifestation born from the shadows. Where silence meets brutalist form, and identity transcends time. Crafted for those who walk through the void and seek truth within the dark.";

  try {
    if ((prisma as any)?.siteSetting) {
      const setting = await (prisma as any).siteSetting.findUnique({
        where: { key: "hero_manifesto" },
      });
      if (setting?.value) {
        heroManifesto = setting.value;
      }
    } else {
      // Fallback query if client instance has not reloaded
      const rows: any = await prisma.$queryRawUnsafe(
        `SELECT "value" FROM "SiteSetting" WHERE "key" = 'hero_manifesto' LIMIT 1`
      );
      if (rows && rows.length > 0 && rows[0]?.value) {
        heroManifesto = rows[0].value;
      }
    }
  } catch (error) {
    console.error("Could not fetch hero_manifesto from db:", error);
  }

  return <HomeClient episodes={episodes} heroManifesto={heroManifesto} />;
}