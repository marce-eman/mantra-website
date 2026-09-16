import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * Cached function to fetch user profile & order count per request lifecycle.
 * React cache() eliminates duplicate database queries across layout, page, and nested RSCs.
 */
export const getCachedUserProfile = cache(async (userIdOrEmail: string) => {
  if (!userIdOrEmail) return null;

  return prisma.user.findFirst({
    where: {
      OR: [{ id: userIdOrEmail }, { email: userIdOrEmail }],
    },
    include: {
      _count: {
        select: { orders: true },
      },
    },
  });
});
