import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  async function updateWhatsApp(formData: FormData) {
    "use server";
    const newWhatsapp = formData.get("whatsapp") as string;

    if (session?.user?.email) {
      await prisma.user.update({
        where: { email: session.user.email },
        data: { whatsapp: newWhatsapp },
      });
      revalidatePath("/account");
    }
  }

  return (
    <div className="bg-[#111111] border border-[#1f1f1f] p-6 md:p-8 rounded-2xl space-y-6">
      <h2 className="text-xl uppercase tracking-widest font-light text-[#ececec]">
        PROFILE DETAILS
      </h2>

      <div className="space-y-4 text-xs tracking-widest uppercase">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#181818] p-4 rounded-xl border border-[#2a2a2a]">
            <span className="text-[#ececec]/40 block mb-1">Full Name</span>
            <span className="text-[#ececec] font-medium text-sm">
              {user?.name || "Not Set"}
            </span>
          </div>

          <div className="bg-[#181818] p-4 rounded-xl border border-[#2a2a2a]">
            <span className="text-[#ececec]/40 block mb-1">Email Address</span>
            <span className="text-[#ececec] font-medium text-sm">
              {user?.email || "Not Set"}
            </span>
          </div>
        </div>

        {/* WhatsApp Update Form */}
        <form action={updateWhatsApp} className="bg-[#181818] p-4 rounded-xl border border-[#2a2a2a]">
          <label className="text-[#ececec]/40 block mb-2">WhatsApp Number</label>
          <div className="flex gap-3">
            <input
              type="tel"
              name="whatsapp"
              defaultValue={user?.whatsapp || ""}
              placeholder="+62 812..."
              required
              className="w-full bg-[#111111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#ececec] focus:outline-none focus:border-[#ececec] transition-colors"
            />
            <button
              type="submit"
              className="bg-[#ececec] text-black px-4 py-2 rounded-lg font-bold hover:bg-white transition-colors cursor-pointer shrink-0"
            >
              SAVE WA
            </button>
          </div>
        </form>

        <div className="bg-[#181818] p-4 rounded-xl border border-[#2a2a2a]">
          <span className="text-[#ececec]/40 block mb-1">Account Role</span>
          <span className="text-emerald-400 font-medium text-sm">
            {user?.role || "CUSTOMER"}
          </span>
        </div>
      </div>
    </div>
  );
}