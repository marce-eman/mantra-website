import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// --- FUNGSI SATPAM PENJAGA ---
async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ 
    where: { id: session.user.id }, 
    select: { role: true } 
  });
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden. Admin access required." }, { status: 403 });
  }
  return null; // Kalau aman, lanjut!
}

// GET: Ambil semua data user
export async function GET() {
  try {
    const authError = await requireAdmin();
    if (authError) return authError; // Cegat di sini

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("[GET USERS ERROR]:", error);
    return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 });
  }
}

// PATCH: Update Role (Admin / Customer)
export async function PATCH(req: Request) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError; // Cegat di sini

    const { id, role } = await req.json();

    if (!id || !role) {
      return NextResponse.json({ message: "ID and Role are required" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[UPDATE USER ROLE ERROR]:", error);
    return NextResponse.json({ message: "Failed to update user role" }, { status: 500 });
  }
}

// DELETE: Hapus User
export async function DELETE(req: Request) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError; // Cegat di sini

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("[DELETE USER ERROR]:", error);
    return NextResponse.json({ message: "Failed to delete user" }, { status: 500 });
  }
}