import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Ambil semua data user
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 });
  }
}

// PATCH: Update Role (Admin / Customer)
export async function PATCH(req: Request) {
  try {
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
    return NextResponse.json({ message: "Failed to update user role" }, { status: 500 });
  }
}

// DELETE: Hapus User
export async function DELETE(req: Request) {
  try {
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
    return NextResponse.json({ message: "Failed to delete user" }, { status: 500 });
  }
}