"use server";

import { prisma } from "@/lib/prisma";

export async function registerOrUpdateUser(formData: {
  fullName: string;
  email: string;
  whatsapp: string;
}) {
  try {
    const { fullName, email, whatsapp } = formData;

    if (!email || !fullName) {
      return { success: false, error: "Name and Email are required." };
    }

    // Simpan atau update data user di Supabase
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: fullName,
        whatsapp: whatsapp,
      },
      create: {
        name: fullName,
        email: email,
        whatsapp: whatsapp,
      },
    });

    return { success: true, user };
  } catch (error) {
    console.error("Error saving user:", error);
    return { success: false, error: "Failed to save user data." };
  }
}