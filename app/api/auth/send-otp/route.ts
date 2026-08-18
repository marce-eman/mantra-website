import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6 digit angka
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // Kedaluwarsa dalam 5 menit

    // Update user dengan kode OTP
    await prisma.user.update({
      where: { email },
      data: { otpCode, otpExpires } as any,
    });

    const emailUser = process.env.EMAIL_SERVER_USER;
    const emailPass = process.env.EMAIL_SERVER_PASSWORD;

    // JIKA ENV BELUM TERBACA, PRINT DI TERMINAL
    if (!emailUser || !emailPass) {
      console.log(`\n========================================`);
      console.log(`[DEV MODE] OTP untuk ${email} adalah:`);
      console.log(`>> ${otpCode} <<`);
      console.log(`========================================\n`);
      return NextResponse.json({ success: true });
    }

    // JIKA ENV TERBACA, KIRIM EMAIL VIA NODEMAILER
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: emailUser, pass: emailPass },
    });

    await transporter.sendMail({
      from: `"MANTRA Security" <${emailUser}>`,
      to: email,
      subject: "Verification Code for MANTRA", // Ubah dikit biar gak terlalu kaku
      
      // Tambahkan ini biar Google percaya ini bukan spam
      text: `Hello,\n\nYour MANTRA verification code is: ${otpCode}\n\nThis code expires in 5 minutes. If you didn't request this, please ignore this email.\n\nRegards,\nMANTRA Team`,
      
      html: `
        <div style="background-color: #050505; color: #ececec; padding: 40px; text-align: center; font-family: monospace;">
          <div style="max-width: 460px; margin: 0 auto; background-color: #0a0a0a; border: 1px solid #1f1f1f; border-radius: 16px; padding: 32px;">
            <h2 style="letter-spacing: 0.1em; color: #888; font-size: 12px; text-transform: uppercase;">Your One-Time Password</h2>
            <h1 style="font-size: 36px; letter-spacing: 0.25em; color: #ececec; margin: 24px 0;">${otpCode}</h1>
            <p style="font-size: 10px; color: #555;">This code will expire in 5 minutes. Do not share it with anyone.</p>
          </div>
        </div>
      `,
    });

    console.log(`[SUCCESS] Email OTP berhasil dikirim ke: ${email}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[SMTP ERROR OTP]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}