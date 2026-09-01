import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs"; // Tetap pakai bcryptjs sesuai aslinya

export async function POST(req: Request) {
  try {
    const { token, email, password } = await req.json();

    // 1. Pastikan semua data dikirim
    if (!token || !email || !password) {
      return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
    }
    
    // 2. Validasi panjang password
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    // 3. Cari user berdasarkan email
    const user = await prisma.user.findUnique({ where: { email } });
    
    // 4. Pastikan user ada dan sedang dalam proses reset password
    if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
      return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
    }

    // 5. PENGECEKAN KRUSIAL (CRIT-3 FIX): Cocokkan token dari email dengan database
    if (user.resetPasswordToken !== token) {
      return NextResponse.json({ error: "Invalid reset token." }, { status: 400 });
    }
    
    // 6. PENGECEKAN KRUSIAL: Pastikan token belum kedaluwarsa
    if (new Date(user.resetPasswordExpires) < new Date()) {
      return NextResponse.json({ error: "Reset link has expired." }, { status: 400 });
    }

    // 7. Hash password baru
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 8. Update password dan bersihkan token dari database
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      } as any,
    });

    return NextResponse.json({ success: true, message: "Password updated successfully." });
    
  } catch (error: any) {
    // FIX MED-4: Jangan bocorkan detail error ke frontend
    console.error("[RESET PASSWORD ERROR]:", error);
    return NextResponse.json({ error: "An error occurred during password reset. Please try again." }, { status: 500 });
  }
}