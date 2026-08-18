import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";

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

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry,
      } as any,
    });

    const host = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${host}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const emailUser = process.env.EMAIL_SERVER_USER;
    const emailPass = process.env.EMAIL_SERVER_PASSWORD;

    if (!emailUser || !emailPass) {
      console.log(`\n========================================`);
      console.log(`[DEV MODE] Env belum terbaca! Gunakan link manual ini:`);
      console.log(resetUrl);
      console.log(`========================================\n`);
      return NextResponse.json({ success: true, message: "Reset link created (Check Terminal)." });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // SSL
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    await transporter.sendMail({
      from: `"MANTRA Security" <${emailUser}>`,
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

    console.log(`[SUCCESS] Email reset password terkirim ke: ${email}`);
    return NextResponse.json({ success: true, message: "Reset link sent successfully." });
  } catch (error: any) {
    console.error("[SMTP ERROR]:", error);
    return NextResponse.json({ error: error.message || "Failed to send reset email." }, { status: 500 });
  }
}