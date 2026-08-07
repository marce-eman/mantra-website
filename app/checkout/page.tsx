"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Step = 1 | 2 | 3;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = getSubtotal();
  const shipping = 50000; // Mock fixed shipping
  const total = subtotal + shipping;

  const handlePlaceOrder = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      clearCart();
      router.push("/order-success");
    }, 1500);
  };

  if (items.length === 0 && !isSubmitting) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-black text-[#ececec] uppercase tracking-widest mb-4">Your Cart is Empty</h1>
        <button onClick={() => router.push("/shop")} className="border border-[#1f1f1f] text-[#ececec] px-8 py-4 uppercase tracking-widest text-xs hover:bg-[#ececec] hover:text-[#050505] transition-colors">
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#050505] min-h-screen border-t border-[#1f1f1f] py-12">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: 3-Step Wizard */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Step 1: Shipping Address */}
          <div className={cn("border border-[#1f1f1f] transition-colors duration-500", currentStep === 1 ? "bg-[#0a0a0a]" : "bg-transparent")}>
            <div className="p-6 border-b border-[#1f1f1f] flex justify-between items-center cursor-pointer" onClick={() => setCurrentStep(1)}>
              <h2 className="text-[#ececec] uppercase tracking-widest font-bold text-sm">1. Shipping Address</h2>
              {currentStep > 1 && <span className="text-green-500 text-xs uppercase">Completed</span>}
            </div>
            {currentStep === 1 && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="First Name" className="w-full bg-[#111111] border border-[#1f1f1f] text-[#ececec] p-3 text-sm focus:outline-none focus:border-[#ececec]" />
                  <input type="text" placeholder="Last Name" className="w-full bg-[#111111] border border-[#1f1f1f] text-[#ececec] p-3 text-sm focus:outline-none focus:border-[#ececec]" />
                </div>
                <input type="text" placeholder="Full Address" className="w-full bg-[#111111] border border-[#1f1f1f] text-[#ececec] p-3 text-sm focus:outline-none focus:border-[#ececec]" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="City" className="w-full bg-[#111111] border border-[#1f1f1f] text-[#ececec] p-3 text-sm focus:outline-none focus:border-[#ececec]" />
                  <input type="text" placeholder="Postal Code" className="w-full bg-[#111111] border border-[#1f1f1f] text-[#ececec] p-3 text-sm focus:outline-none focus:border-[#ececec]" />
                </div>
                <button onClick={() => setCurrentStep(2)} className="mt-4 bg-[#ececec] text-[#050505] px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-white">
                  Continue to Shipping
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Shipping Method */}
          <div className={cn("border border-[#1f1f1f] transition-colors duration-500", currentStep === 2 ? "bg-[#0a0a0a]" : "bg-transparent")}>
            <div className="p-6 border-b border-[#1f1f1f] flex justify-between items-center cursor-pointer" onClick={() => currentStep > 2 && setCurrentStep(2)}>
              <h2 className="text-[#ececec] uppercase tracking-widest font-bold text-sm">2. Shipping Method</h2>
              {currentStep > 2 && <span className="text-green-500 text-xs uppercase">Completed</span>}
            </div>
            {currentStep === 2 && (
              <div className="p-6 space-y-4">
                <label className="flex items-center space-x-4 border border-[#1f1f1f] p-4 cursor-pointer hover:bg-[#111111]">
                  <input type="radio" name="shipping" defaultChecked className="accent-[#ececec] w-4 h-4" />
                  <div className="flex-1">
                    <p className="text-[#ececec] text-sm uppercase tracking-widest">JNE REG (Regular)</p>
                    <p className="text-[#ececec]/60 text-xs">2-3 Business Days</p>
                  </div>
                  <p className="text-[#ececec] font-mono">Rp 50.000</p>
                </label>
                <button onClick={() => setCurrentStep(3)} className="mt-4 bg-[#ececec] text-[#050505] px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-white">
                  Continue to Payment
                </button>
              </div>
            )}
          </div>

          {/* Step 3: Payment Method */}
          <div className={cn("border border-[#1f1f1f] transition-colors duration-500", currentStep === 3 ? "bg-[#0a0a0a]" : "bg-transparent")}>
            <div className="p-6 border-b border-[#1f1f1f]">
              <h2 className="text-[#ececec] uppercase tracking-widest font-bold text-sm">3. Payment</h2>
            </div>
            {currentStep === 3 && (
              <div className="p-6 space-y-4">
                <label className="flex items-center space-x-4 border border-[#1f1f1f] p-4 cursor-pointer hover:bg-[#111111]">
                  <input type="radio" name="payment" defaultChecked className="accent-[#ececec] w-4 h-4" />
                  <div className="flex-1">
                    <p className="text-[#ececec] text-sm uppercase tracking-widest">QRIS / E-Wallet</p>
                  </div>
                </label>
                <label className="flex items-center space-x-4 border border-[#1f1f1f] p-4 cursor-pointer hover:bg-[#111111]">
                  <input type="radio" name="payment" className="accent-[#ececec] w-4 h-4" />
                  <div className="flex-1">
                    <p className="text-[#ececec] text-sm uppercase tracking-widest">Virtual Account</p>
                  </div>
                </label>
                <label className="flex items-center space-x-4 border border-[#1f1f1f] p-4 cursor-pointer hover:bg-[#111111]">
                  <input type="radio" name="payment" className="accent-[#ececec] w-4 h-4" />
                  <div className="flex-1">
                    <p className="text-[#ececec] text-sm uppercase tracking-widest">Credit Card</p>
                  </div>
                </label>
                
                <button 
                  onClick={handlePlaceOrder} 
                  disabled={isSubmitting}
                  className="w-full mt-8 bg-[#ececec] text-[#050505] py-5 uppercase tracking-widest text-sm font-bold hover:bg-white disabled:opacity-50"
                >
                  {isSubmitting ? "Processing..." : "Place Order"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="border border-[#1f1f1f] bg-[#050505] sticky top-24">
            <div className="p-6 border-b border-[#1f1f1f]">
              <h2 className="text-[#ececec] uppercase tracking-widest font-bold text-sm">Order Summary</h2>
            </div>
            <div className="p-6 space-y-6 max-h-[400px] overflow-y-auto">
              {items.map(item => (
                <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} className="flex space-x-4">
                  <div className="relative w-16 h-20 bg-[#111111] border border-[#1f1f1f]">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                    <span className="absolute -top-2 -right-2 bg-[#ececec] text-[#050505] text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-[#ececec] text-xs uppercase tracking-widest font-bold mb-1">{item.name}</p>
                    <p className="text-[#ececec]/60 text-[10px] uppercase">{item.selectedColor} | {item.selectedSize}</p>
                    <p className="text-[#ececec] font-mono text-xs mt-2">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-[#1f1f1f] space-y-4">
              <div className="flex justify-between text-[#ececec]/60 text-xs uppercase tracking-widest">
                <span>Subtotal</span>
                <span className="font-mono text-[#ececec]">Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-[#ececec]/60 text-xs uppercase tracking-widest">
                <span>Shipping</span>
                <span className="font-mono text-[#ececec]">Rp {shipping.toLocaleString('id-ID')}</span>
              </div>
              <div className="border-t border-[#1f1f1f] pt-4 flex justify-between text-[#ececec] text-sm uppercase tracking-widest font-bold">
                <span>Total</span>
                <span className="font-mono">Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
