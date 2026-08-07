"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useUserStore();

  const links = [
    { href: "/account/orders", label: "Orders" },
    { href: "/account/addresses", label: "Addresses" },
  ];

  return (
    <div className="bg-[#050505] min-h-screen border-t border-[#1f1f1f]">
      <div className="max-w-screen-xl mx-auto px-4 py-12 md:py-20 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Sidebar */}
        <div className="col-span-1 space-y-8">
          <div>
            <h1 className="text-xl font-bold text-[#ececec] uppercase tracking-widest mb-1">My Account</h1>
            <p className="text-[#ececec]/60 text-xs uppercase tracking-widest">Welcome back.</p>
          </div>
          
          <nav className="space-y-2 flex flex-col">
            {links.map(link => (
              <Link 
                key={link.href}
                href={link.href}
                className={cn(
                  "p-3 text-sm uppercase tracking-widest transition-colors border-l-2",
                  pathname === link.href 
                    ? "border-[#ececec] text-[#ececec] bg-[#111111]" 
                    : "border-transparent text-[#ececec]/60 hover:text-white hover:bg-[#111111]/50"
                )}
              >
                {link.label}
              </Link>
            ))}
            <button 
              onClick={logout}
              className="p-3 text-sm text-left uppercase tracking-widest text-red-500 hover:bg-[#111111]/50 transition-colors border-l-2 border-transparent"
            >
              Logout
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="col-span-1 md:col-span-3">
          {children}
        </div>
        
      </div>
    </div>
  );
}
