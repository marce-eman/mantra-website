import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // 1. Jika email benar-benar tidak ada di DB
    if (!user) {
      return NextResponse.json({ error: "Account not found. Please register." }, { status: 404 });
    }

    // 2. Jika email ada tapi terdaftar via Google (password masih NULL)
    if (!user.password) {
      return NextResponse.json(
        { error: "This account was registered using Google. Please sign in with Google or set a password via Forgot Password." },
        { status: 400 }
      );
    }

    // 3. Verifikasi Password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    return NextResponse.json({ status: "SUCCESS", userId: user.id, userName: user.name });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}