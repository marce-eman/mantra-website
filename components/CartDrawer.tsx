"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { removeFromCartAction, updateCartQuantityAction } from "@/app/actions/cart";

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, removeItem, updateQuantity, getSubtotal } =
    useCartStore();

  if (!isDrawerOpen) return null;

  const subtotal = getSubtotal();

  const handleRemoveItem = async (productId: string, itemKey: string) => {
    // 1. Hapus langsung dari tampilan UI
    removeItem(itemKey);
    // 2. Hapus dari Supabase DB
    await removeFromCartAction(productId);
  };

  const handleUpdateQuantity = async (
    productId: string,
    itemKey: string,
    newQuantity: number
  ) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId, itemKey);
      return;
    }
    // 1. Update tampilan UI
    updateQuantity(itemKey, newQuantity);
    // 2. Update jumlah di Supabase DB
    await updateCartQuantityAction(productId, newQuantity);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
      {/* Background Overlay */}
      <div className="fixed inset-0" onClick={closeDrawer} />

      {/* Drawer Panel */}
      <div className="relative z-10 w-full max-w-md bg-[#0a0a0a] border-l border-[#1f1f1f] h-full flex flex-col p-6 text-[#ececec]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest">Your Cart</h2>
          <button
            onClick={closeDrawer}
            className="p-1 text-[#ececec]/50 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Produk / Tampilan Kosong */}
        <div className="flex-1 overflow-y-auto py-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <ShoppingBag className="w-12 h-12 text-[#ececec]/20 mb-4" />
              <p className="text-xs uppercase tracking-widest text-[#ececec]/40 mb-6">
                Your cart is currently empty
              </p>
              <Link
                href="/shop"
                onClick={closeDrawer}
                className="bg-[#ececec] text-[#050505] px-6 py-3 rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, idx) => {
                const itemKey =
                  item.cartItemId || `${item.id}-${item.selectedColor}-${item.selectedSize}`;
                return (
                  <div
                    key={itemKey || idx}
                    className="flex gap-4 p-3 bg-[#111111] border border-[#1f1f1f] rounded-xl items-center"
                  >
                    <div className="relative aspect-square w-16 bg-[#181818] rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image || "/images/placeholder.jpg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xs font-medium uppercase tracking-wider">
                        {item.name}
                      </h3>
                      <p className="text-[10px] text-[#ececec]/50 uppercase tracking-widest mt-0.5">
                        {item.selectedSize} / {item.selectedColor}
                      </p>
                      <p className="text-xs font-mono font-bold text-emerald-400 mt-1">
                        Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                      </p>
                      {/* Tambah/Kurang Quantity */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, itemKey, item.quantity - 1)}
                          className="px-2 py-0.5 border border-[#2a2a2a] text-[10px] rounded hover:bg-[#222] cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-mono">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, itemKey, item.quantity + 1)}
                          className="px-2 py-0.5 border border-[#2a2a2a] text-[10px] rounded hover:bg-[#222] cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    {/* Tombol Hapus Barang */}
                    <button
                      onClick={() => handleRemoveItem(item.id, itemKey)}
                      className="text-red-400/70 hover:text-red-400 p-2 cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Checkout */}
        {items.length > 0 && (
          <div className="border-t border-[#1f1f1f] pt-4 space-y-4">
            <div className="flex justify-between text-xs uppercase tracking-widest">
              <span className="text-[#ececec]/60">Subtotal</span>
              <span className="font-mono font-bold text-emerald-400">
                Rp {subtotal.toLocaleString("id-ID")}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="block w-full bg-[#ececec] text-[#050505] text-center py-3 rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}