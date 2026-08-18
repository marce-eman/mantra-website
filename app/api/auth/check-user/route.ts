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

    // Jika user belum ada di DB, beritahu frontend untuk pindah ke Register
    if (!user || !user.password) {
      return NextResponse.json({ status: "NOT_FOUND" }, { status: 404 });
    }

    // Cek password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "INVALID_PASSWORD" }, { status: 401 });
    }

    return NextResponse.json({ status: "SUCCESS" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}