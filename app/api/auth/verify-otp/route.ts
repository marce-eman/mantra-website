import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/app/api/auth/_rateLimit";

export async function POST(req: Request) {
  try {
    // Batasi maks 5 percobaan per IP+email per 5 menit
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
               ?? req.headers.get("x-real-ip") 
               ?? "unknown";
    const body = await req.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required." }, { status: 400 });
    }

    const { allowed, retryAfterSeconds } = checkRateLimit(`verify-otp:${ip}:${email}`, 5, 5 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: `Too many attempts. Please try again in ${retryAfterSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
      );
    }

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
    console.error("[VERIFY OTP ERROR]:", error);
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
  }
}