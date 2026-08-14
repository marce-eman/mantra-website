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

  // State Form Input
  const [nameInput, setNameInput] = useState(user?.name || "");
  const [phoneInput, setPhoneInput] = useState("");
  const [addressInput, setAddressInput] = useState(user?.address || "");

  const subtotal = getSubtotal();
  // Total di website pure hanya total produk, ongkir dihitung terpisah di WA
  const total = subtotal; 

  const ADMIN_WHATSAPP = "6281234567890"; // Ganti dengan nomor WhatsApp Admin

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      setErrorMsg("Your cart is empty.");
      return;
    }

    if (!nameInput.trim() || !addressInput.trim() || !phoneInput.trim()) {
      setErrorMsg("Please complete all shipping details (Name, Phone, Address).");
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
        recipientName: nameInput,
        phone: phoneInput,
      });

      if (result.success && result.orderId) {
        clearCart();

        // Template Pesan WA yang Menginfokan Ongkir Dihitung via WA
        const waMessage = encodeURIComponent(
          `Hello MANTRA Admin,\nI would like to confirm my order.\n\n` +
          `*Order ID:* ${(result as any).orderNumber || result.orderId}\n` +
          `*Name:* ${nameInput}\n` +
          `*Phone:* ${phoneInput}\n` +
          `*Subtotal Items:* $${subtotal.toFixed(2)} USD\n` +
          `*Shipping Fee:* To be calculated via WA\n\n` +
          `Please calculate total shipping to my address and send payment details. Thank you!`
        );

        window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${waMessage}`, "_blank");
        router.push(`/order-success?orderId=${result.orderId}`);
      } else {
        setErrorMsg(result.error || "Failed to process order.");
        setIsSubmitting(false);
      }
    } catch {
      setErrorMsg("System error occurred while creating order.");
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
                1. Shipping Information
              </h2>
              {currentStep > 1 && (
                <span className="text-emerald-400 text-xs uppercase font-mono">
                  Completed
                </span>
              )}
            </div>
            {currentStep === 1 && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
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
                <input
                  type="text"
                  placeholder="Phone Number (WhatsApp Active)"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full bg-[#111111] border border-[#1f1f1f] p-3 text-sm focus:outline-none focus:border-[#ececec] rounded-lg"
                />
                <textarea
                  rows={3}
                  placeholder="Full Address (Street, City, State, Postal Code, Country)"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  className="w-full bg-[#111111] border border-[#1f1f1f] p-3 text-sm focus:outline-none focus:border-[#ececec] rounded-lg"
                />
                <button
                  onClick={() => {
                    if (!nameInput.trim() || !addressInput.trim() || !phoneInput.trim()) {
                      setErrorMsg("Please fill in all shipping details.");
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
                      Standard / Express Shipping
                    </p>
                    <p className="text-[#ececec]/60 text-xs mt-1">
                      Shipping cost will be calculated & confirmed via WhatsApp based on your destination.
                    </p>
                  </div>
                  <p className="font-mono text-xs text-zinc-400">Calculated via WA</p>
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
                3. Payment Method
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
                      WhatsApp Admin Payment
                    </p>
                    <p className="text-[#ececec]/60 text-xs mt-1">
                      You will be redirected to WhatsApp to confirm order items, shipping costs, and receive payment details.
                    </p>
                  </div>
                </label>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="w-full mt-8 bg-[#ececec] text-[#050505] py-4 uppercase tracking-widest text-xs font-bold hover:bg-white disabled:opacity-50 cursor-pointer transition-colors rounded-lg"
                >
                  {isSubmitting ? "Generating Order..." : "Place Order via WhatsApp"}
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
                      {item.quantity} x ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-[#1f1f1f] space-y-3 text-xs">
              <div className="flex justify-between text-[#ececec]/60 uppercase tracking-widest">
                <span>Subtotal</span>
                <span className="font-mono text-[#ececec]">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-[#ececec]/60 uppercase tracking-widest">
                <span>Shipping</span>
                <span className="font-mono text-zinc-400 italic">
                  Calculated via WA
                </span>
              </div>
              <div className="border-t border-[#1f1f1f] pt-3 flex justify-between uppercase tracking-widest font-bold text-sm">
                <span>Total Items</span>
                <span className="font-mono text-emerald-400">
                  ${total.toFixed(2)} USD
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}