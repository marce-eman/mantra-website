import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.otpCode !== otp) {
      return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
    }

    if (user.otpExpires && user.otpExpires < new Date()) {
      return NextResponse.json({ error: "Verification code has expired. Please try again." }, { status: 400 });
    }

    // Bersihkan OTP setelah sukses dipakai
    await prisma.user.update({
      where: { email },
      data: { otpCode: null, otpExpires: null } as any,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}