import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, phone, email, password } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      // Jika user sudah ada DAN sudah punya password -> Tolak (memang duplikat)
      if (existingUser.password) {
        return NextResponse.json({ error: "Email is already registered. Please sign in." }, { status: 400 });
      }

      // Jika user sudah ada dari Google (password masih NULL) -> Hubungkan akun & simpan password baru
      const hashedPassword = await bcrypt.hash(password, 10);
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          name: name || existingUser.name,
          whatsapp: phone || existingUser.whatsapp,
          password: hashedPassword,
        },
      });

      return NextResponse.json({ success: true, userId: updatedUser.id, linked: true });
    }

    // Jika akun baru murni
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        whatsapp: phone,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ success: true, userId: newUser.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}