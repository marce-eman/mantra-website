import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { checkRateLimit } from "@/app/api/auth/_rateLimit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
               ?? req.headers.get("x-real-ip") 
               ?? "unknown";
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // Rate Limit resend: maks 3 kali per IP+email per 10 menit
    const { allowed, retryAfterSeconds } = checkRateLimit(`send-otp:${ip}:${email}`, 3, 10 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${retryAfterSeconds} seconds before requesting a new code.` },
        { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (!existingUser) {
      return NextResponse.json({ success: true }); // Sukses palsu biar email gak bisa di-scan hacker
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { otpCode, otpExpires } as any,
    });

    const emailUser = process.env.EMAIL_SERVER_USER;
    const emailPass = process.env.EMAIL_SERVER_PASSWORD;

    if (!emailUser || !emailPass) {
      console.log(`\n[DEV MODE] OTP untuk ${email}: ${otpCode}\n`);
      return NextResponse.json({ success: true });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: emailUser, pass: emailPass },
    });

    await transporter.sendMail({
      from: `"MANTRA Security" <${emailUser}>`,
      to: email,
      subject: "Verification Code for MANTRA",
      text: `Your MANTRA verification code is: ${otpCode}\n\nThis code expires in 5 minutes.`,
      html: `
        <div style="background-color:#050505;color:#ececec;padding:40px;text-align:center;font-family:monospace;">
          <div style="max-width:460px;margin:0 auto;background-color:#0a0a0a;border:1px solid #1f1f1f;border-radius:16px;padding:32px;">
            <h2 style="letter-spacing:0.1em;color:#888;font-size:12px;text-transform:uppercase;">Your One-Time Password</h2>
            <h1 style="font-size:36px;letter-spacing:0.25em;color:#ececec;margin:24px 0;">${otpCode}</h1>
            <p style="font-size:10px;color:#555;">This code will expire in 5 minutes. Do not share it with anyone.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[SMTP ERROR OTP]:", error);
    return NextResponse.json({ error: "Failed to send verification code. Please try again." }, { status: 500 });
  }
}