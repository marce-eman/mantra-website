"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";

export default function CartDrawer() {
  const { items, isOpen, closeDrawer, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const { isGuest } = useUserStore();
  const router = useRouter();

  const handleCheckout = () => {
    closeDrawer();
    if (isGuest) {
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#050505]/80 backdrop-blur-sm z-50 transition-opacity"
          onClick={closeDrawer}
        />
      )}

      {/* Drawer */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#050505] border-l border-[#1f1f1f] z-50 transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#1f1f1f]">
          <h2 className="text-[#ececec] uppercase tracking-widest font-bold flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5" />
            <span>Your Cart</span>
          </h2>
          <button onClick={closeDrawer} className="text-[#ececec]/60 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col space-y-6">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 border border-[#1f1f1f] rounded-full flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-[#ececec]/20" />
              </div>
              <div>
                <p className="text-[#ececec] uppercase tracking-widest font-bold mb-2">The cart is empty</p>
                <p className="text-[#ececec]/50 text-sm">Your selections will appear here.</p>
              </div>
              <button 
                onClick={closeDrawer}
                className="px-6 py-3 border border-[#1f1f1f] text-[#ececec] uppercase tracking-widest text-xs hover:bg-[#ececec] hover:text-[#050505] transition-colors"
              >
                Back to Collection
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} className="flex space-x-4 border border-[#1f1f1f] p-3 bg-[#050505]">
                <div className="relative w-20 h-24 bg-[#1f1f1f]/50">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-[#ececec] text-sm uppercase tracking-wider font-bold">{item.name}</h3>
                      <p className="text-[#ececec]/60 text-xs uppercase mt-1">
                        {item.selectedColor} | Size: {item.selectedSize}
                      </p>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id, item.selectedColor, item.selectedSize)}
                      className="text-[#ececec]/40 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center space-x-3 border border-[#1f1f1f] px-2 py-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, item.quantity - 1)}
                        className="text-[#ececec]/60 hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-[#ececec] text-xs font-mono">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, item.quantity + 1)}
                        className="text-[#ececec]/60 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-[#ececec] font-mono text-sm tracking-tighter">
                      Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-[#1f1f1f] bg-[#050505]">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[#ececec] uppercase tracking-widest text-sm">Subtotal</span>
              <span className="text-[#ececec] font-mono font-bold">
                Rp {getSubtotal().toLocaleString('id-ID')}
              </span>
            </div>
            <p className="text-[#ececec]/40 text-xs uppercase tracking-wider mb-4 text-center">
              Shipping and taxes calculated at checkout.
            </p>
            <button 
              onClick={handleCheckout}
              className="w-full bg-[#ececec] text-[#050505] py-4 uppercase tracking-widest font-bold hover:bg-white transition-colors"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
