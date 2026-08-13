"use client";

import { signOut } from "next-auth/react";
import { useCartStore } from "@/store/useCartStore";

export default function LogoutButton() {
  const { clearCart } = useCartStore();

  const handleLogout = () => {
    clearCart(); // Kosongkan penyimpanan lokal browser saat logout
    signOut({ callbackUrl: "/login" });
  };

  return (
    <button
      onClick={handleLogout}
      className="text-xs uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors cursor-pointer"
    >
      Logout
    </button>
  );
}