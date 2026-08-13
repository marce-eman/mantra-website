"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCartStore } from "@/store/useCartStore";
import { createOrderAction } from "@/app/actions/order";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3;

interface CheckoutClientProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    address: string | null;
  } | null;
}

export default function CheckoutClient({ user }: CheckoutClientProps) {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // State Form Alamat
  const [addressInput, setAddressInput] = useState(user?.address || "");

  const subtotal = getSubtotal();
  const shipping = 50000; // Fixed shipping rate
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      setErrorMsg("Your cart is empty.");
      return;
    }

    if (!addressInput.trim()) {
      setErrorMsg("Please fill in your shipping address.");
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const result = await createOrderAction({
        items: items.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
          price: i.price,
        })),
        totalAmount: total,
        shippingAddress: addressInput,
      });

      if (result.success && result.orderId) {
        clearCart();
        router.push(`/order-success?orderId=${result.orderId}`);
      } else {
        setErrorMsg(result.error || "Gagal memproses pesanan.");
        setIsSubmitting(false);
      }
    } catch {
      setErrorMsg("Terjadi kesalahan sistem saat membuat pesanan.");
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !isSubmitting) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-light text-[#ececec] uppercase tracking-widest mb-4">
          Your Cart is Empty
        </h1>
        <button
          onClick={() => router.push("/shop")}
          className="border border-[#1f1f1f] text-[#ececec] px-8 py-4 uppercase tracking-widest text-xs hover:bg-[#ececec] hover:text-[#050505] transition-colors cursor-pointer"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#050505] min-h-screen border-t border-[#1f1f1f] py-12 text-[#ececec]">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: 3-Step Wizard */}
        <div className="lg:col-span-7 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-red-950/50 border border-red-800/50 text-red-400 text-xs rounded-xl uppercase tracking-widest text-center">
              {errorMsg}
            </div>
          )}

          {/* Step 1: Shipping Address */}
          <div
            className={cn(
              "border border-[#1f1f1f] transition-colors duration-500 rounded-xl overflow-hidden",
              currentStep === 1 ? "bg-[#0a0a0a]" : "bg-transparent"
            )}
          >
            <div
              className="p-6 border-b border-[#1f1f1f] flex justify-between items-center cursor-pointer"
              onClick={() => setCurrentStep(1)}
            >
              <h2 className="uppercase tracking-widest font-bold text-sm">
                1. Shipping Address
              </h2>
              {currentStep > 1 && (
                <span className="text-emerald-400 text-xs uppercase font-mono">
                  Completed
                </span>
              )}
            </div>
            {currentStep === 1 && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    defaultValue={user?.name || ""}
                    className="w-full bg-[#111111] border border-[#1f1f1f] p-3 text-sm focus:outline-none focus:border-[#ececec] rounded-lg"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    defaultValue={user?.email || ""}
                    disabled
                    className="w-full bg-[#111111]/50 border border-[#1f1f1f] p-3 text-sm text-[#ececec]/50 rounded-lg cursor-not-allowed"
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder="Full Address (Street, City, Province, Postal Code)"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  className="w-full bg-[#111111] border border-[#1f1f1f] p-3 text-sm focus:outline-none focus:border-[#ececec] rounded-lg"
                />
                <button
                  onClick={() => {
                    if (!addressInput.trim()) {
                      setErrorMsg("Please fill in your shipping address.");
                      return;
                    }
                    setErrorMsg("");
                    setCurrentStep(2);
                  }}
                  className="mt-4 bg-[#ececec] text-[#050505] px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-white transition-colors cursor-pointer rounded-lg"
                >
                  Continue to Shipping
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Shipping Method */}
          <div
            className={cn(
              "border border-[#1f1f1f] transition-colors duration-500 rounded-xl overflow-hidden",
              currentStep === 2 ? "bg-[#0a0a0a]" : "bg-transparent"
            )}
          >
            <div
              className="p-6 border-b border-[#1f1f1f] flex justify-between items-center cursor-pointer"
              onClick={() => currentStep > 2 && setCurrentStep(2)}
            >
              <h2 className="uppercase tracking-widest font-bold text-sm">
                2. Shipping Method
              </h2>
              {currentStep > 2 && (
                <span className="text-emerald-400 text-xs uppercase font-mono">
                  Completed
                </span>
              )}
            </div>
            {currentStep === 2 && (
              <div className="p-6 space-y-4">
                <label className="flex items-center space-x-4 border border-[#1f1f1f] p-4 cursor-pointer hover:bg-[#111111] rounded-lg">
                  <input
                    type="radio"
                    name="shipping"
                    defaultChecked
                    className="accent-[#ececec] w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="text-sm uppercase tracking-widest font-bold">
                      JNE REG / SICEPAT
                    </p>
                    <p className="text-[#ececec]/60 text-xs">
                      2-3 Business Days
                    </p>
                  </div>
                  <p className="font-mono text-xs">Rp 50.000</p>
                </label>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="mt-4 bg-[#ececec] text-[#050505] px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-white transition-colors cursor-pointer rounded-lg"
                >
                  Continue to Payment
                </button>
              </div>
            )}
          </div>

          {/* Step 3: Payment Method */}
          <div
            className={cn(
              "border border-[#1f1f1f] transition-colors duration-500 rounded-xl overflow-hidden",
              currentStep === 3 ? "bg-[#0a0a0a]" : "bg-transparent"
            )}
          >
            <div className="p-6 border-b border-[#1f1f1f]">
              <h2 className="uppercase tracking-widest font-bold text-sm">
                3. Payment
              </h2>
            </div>
            {currentStep === 3 && (
              <div className="p-6 space-y-4">
                <label className="flex items-center space-x-4 border border-[#1f1f1f] p-4 cursor-pointer hover:bg-[#111111] rounded-lg">
                  <input
                    type="radio"
                    name="payment"
                    defaultChecked
                    className="accent-[#ececec] w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="text-sm uppercase tracking-widest font-bold">
                      QRIS / E-Wallet / Bank Transfer
                    </p>
                  </div>
                </label>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="w-full mt-8 bg-[#ececec] text-[#050505] py-4 uppercase tracking-widest text-xs font-bold hover:bg-white disabled:opacity-50 cursor-pointer transition-colors rounded-lg"
                >
                  {isSubmitting ? "Processing..." : "Place Order"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="border border-[#1f1f1f] bg-[#0a0a0a] sticky top-24 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-[#1f1f1f]">
              <h2 className="uppercase tracking-widest font-bold text-sm">
                Order Summary
              </h2>
            </div>
            <div className="p-6 space-y-4 max-h-[380px] overflow-y-auto">
              {items.map((item, idx) => (
                <div
                  key={`${item.id}-${item.selectedColor}-${item.selectedSize}-${idx}`}
                  className="flex space-x-4 items-center"
                >
                  <div className="relative w-16 h-16 bg-[#111111] border border-[#1f1f1f] rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={item.image || "/images/placeholder.jpg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-widest font-bold line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-[#ececec]/50 text-[10px] uppercase">
                      {item.selectedSize} / {item.selectedColor}
                    </p>
                    <p className="text-xs font-mono text-emerald-400 mt-1">
                      {item.quantity} x Rp {item.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-[#1f1f1f] space-y-3 text-xs">
              <div className="flex justify-between text-[#ececec]/60 uppercase tracking-widest">
                <span>Subtotal</span>
                <span className="font-mono text-[#ececec]">
                  Rp {subtotal.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between text-[#ececec]/60 uppercase tracking-widest">
                <span>Shipping</span>
                <span className="font-mono text-[#ececec]">
                  Rp {shipping.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="border-t border-[#1f1f1f] pt-3 flex justify-between uppercase tracking-widest font-bold text-sm">
                <span>Total</span>
                <span className="font-mono text-emerald-400">
                  Rp {total.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}