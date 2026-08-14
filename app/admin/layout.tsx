import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (user?.role !== "ADMIN") {
    redirect("/"); 
  }

  return (
    // PERHATIKAN: Ada tambahan pt-16 di sini agar tidak tertumpuk Navbar
    <div className="min-h-screen pt-16 bg-[#050505] text-[#ececec] flex flex-col md:flex-row">
      
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      
    </div>
  );
}