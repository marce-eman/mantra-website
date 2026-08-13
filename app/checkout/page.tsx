import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CheckoutClient from "./CheckoutClient";

export default async function CheckoutPage() {
  const session = await auth();

  // 1. Redirect instan di Server jika belum login
  if (!session?.user?.id) {
    redirect("/login?redirect=/checkout");
  }

  // 2. Ambil data user & alamat tersimpan dari Supabase
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
    },
  });

  return <CheckoutClient user={user} />;
}