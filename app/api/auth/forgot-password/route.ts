import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Account with this email does not exist." }, { status: 404 });
    }

    // Generate secure token & expiry (1 jam)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    // Simpan token ke model User / Token di database
    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry,
      } as any,
    });

    const host = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${host}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Kirim email jika RESEND_API_KEY tersedia
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "MANTRA Security <onboarding@resend.dev>",
        to: email,
        subject: "[MANTRA] Password Reset Request",
        html: `
          <div style="background-color: #050505; color: #ececec; padding: 40px 20px; font-family: monospace; text-align: center;">
            <div style="max-width: 460px; margin: 0 auto; background-color: #0a0a0a; border: 1px solid #1f1f1f; border-radius: 16px; padding: 32px;">
              <h1 style="letter-spacing: 0.25em; font-size: 18px; margin: 0 0 16px 0; color: #ffffff;">M A N T R A</h1>
              <p style="font-size: 11px; color: #888; margin-bottom: 24px;">Click the button below to reset your account password. This link is valid for 60 minutes.</p>
              <a href="${resetUrl}" style="background-color: #ececec; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.15em; display: inline-block;">Reset Password</a>
            </div>
          </div>
        `,
      });
    } else {
      console.log(`[DEV MODE] Reset URL for ${email}: ${resetUrl}`);
    }

    return NextResponse.json({ success: true, message: "Reset link sent successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}