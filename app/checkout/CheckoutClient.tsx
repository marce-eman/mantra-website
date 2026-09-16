"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Script from "next/script";
import { useCartStore } from "@/store/useCartStore";
import { cn, formatRupiah } from "@/lib/utils";
import { Truck, ShieldCheck, CreditCard, ChevronRight, Loader2, CheckCircle2 } from "lucide-react";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

type Step = 1 | 2 | 3;

interface ShippingRate {
  courier_name: string;
  courier_code: string;
  courier_service_name: string;
  courier_service_code: string;
  duration: string;
  price: number;
  description?: string;
}

interface CheckoutClientProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    address: string | null;
  } | null;
  whatsappNumber?: string;
}

export default function CheckoutClient({ user }: CheckoutClientProps) {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form Inputs
  const [nameInput, setNameInput] = useState(user?.name || "");
  const [emailInput, setEmailInput] = useState(user?.email || "");
  const [phoneInput, setPhoneInput] = useState("");
  const [postalCodeInput, setPostalCodeInput] = useState("12340");
  const [addressInput, setAddressInput] = useState(user?.address || "");

  // Shipping Rates & Selection (Biteship)
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);

  const subtotal = getSubtotal();
  const shippingCost = selectedRate ? selectedRate.price : 0;
  const grandTotal = subtotal + shippingCost;

  // Fetch Shipping Rates from Biteship API
  const fetchShippingRates = async (postalCode: string) => {
    if (!postalCode.trim() || items.length === 0) return;

    setIsLoadingRates(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/shipping/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination_postal_code: postalCode.trim(),
          items: items.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.rates) && data.rates.length > 0) {
        setShippingRates(data.rates);
        // Default to first rate if none selected
        if (!selectedRate) {
          setSelectedRate(data.rates[0]);
        }
      } else {
        setErrorMsg(data.message || "Failed to load shipping rates.");
      }
    } catch (err) {
      console.error("Rates fetch error:", err);
      setErrorMsg("Network error while calculating shipping.");
    } finally {
      setIsLoadingRates(false);
    }
  };

  // Step 1 -> Step 2 validation & rate calculation
  const handleProceedToShipping = async () => {
    if (!nameInput.trim() || !phoneInput.trim() || !addressInput.trim() || !postalCodeInput.trim()) {
      setErrorMsg("Please complete all required shipping fields including postal code.");
      return;
    }
    setErrorMsg("");
    setCurrentStep(2);
    await fetchShippingRates(postalCodeInput);
  };

  // Step 2 -> Step 3 validation
  const handleProceedToPayment = () => {
    if (!selectedRate) {
      setErrorMsg("Please choose a shipping courier.");
      return;
    }
    setErrorMsg("");
    setCurrentStep(3);
  };

  // Final Execution: Create Order & Trigger Midtrans Snap
  const handlePayWithMidtrans = async () => {
    if (items.length === 0) {
      setErrorMsg("Your cart is empty.");
      return;
    }

    if (!selectedRate) {
      setErrorMsg("Please select a shipping courier first.");
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.id,
            name: i.name,
            size: i.selectedSize,
            color: i.selectedColor,
            quantity: i.quantity,
            price: i.price,
          })),
          recipientName: nameInput,
          email: emailInput,
          phone: phoneInput,
          shippingAddress: `${addressInput} (Postal Code: ${postalCodeInput})`,
          shippingCourier: selectedRate.courier_name,
          shippingService: selectedRate.courier_service_name,
          shippingCost: selectedRate.price,
        }),
      });

      const data = await res.json();

      if (!data.success || !data.orderId) {
        throw new Error(data.message || "Failed to initiate payment.");
      }

      const orderId = data.orderId;
      const snapToken = data.snapToken;

      // Check if Midtrans Snap SDK is loaded on window
      if (snapToken && typeof window !== "undefined" && window.snap) {
        window.snap.pay(snapToken, {
          onSuccess: () => {
            clearCart();
            router.push(`/order-success?orderId=${orderId}`);
          },
          onPending: () => {
            clearCart();
            router.push(`/order-success?orderId=${orderId}`);
          },
          onError: () => {
            setErrorMsg("Payment failed or was declined. Please try again.");
            setIsSubmitting(false);
          },
          onClose: () => {
            clearCart();
            // Redirect to order success where pending status is shown
            router.push(`/order-success?orderId=${orderId}`);
          },
        });
      } else if (data.redirectUrl) {
        clearCart();
        window.location.href = data.redirectUrl;
      } else {
        // Fallback redirection
        clearCart();
        router.push(`/order-success?orderId=${orderId}`);
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setErrorMsg(err.message || "An error occurred while creating your order.");
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
          className="border border-[#1f1f1f] text-[#ececec] px-8 py-4 uppercase tracking-widest text-xs hover:bg-[#ececec] hover:text-[#050505] transition-colors cursor-pointer rounded-xl"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Midtrans Snap Script (Sandbox) */}
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""}
        strategy="lazyOnload"
      />

      <div className="bg-[#050505] min-h-screen border-t border-[#1f1f1f] py-12 text-[#ececec]">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: 3-Step Wizard */}
          <div className="lg:col-span-7 space-y-6">
            {errorMsg && (
              <div className="p-4 bg-red-950/50 border border-red-800/50 text-red-400 text-xs rounded-xl uppercase tracking-widest text-center">
                {errorMsg}
              </div>
            )}

            {/* Step 1: Shipping Information */}
            <div
              className={cn(
                "border border-[#1f1f1f] transition-colors duration-500 rounded-2xl overflow-hidden",
                currentStep === 1 ? "bg-[#0a0a0a]" : "bg-transparent"
              )}
            >
              <div
                className="p-6 border-b border-[#1f1f1f] flex justify-between items-center cursor-pointer"
                onClick={() => setCurrentStep(1)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono border",
                    currentStep === 1 ? "bg-white text-black border-white" : "border-[#2a2a2a] text-[#ececec]/50"
                  )}>
                    1
                  </div>
                  <h2 className="uppercase tracking-widest font-bold text-sm">
                    Shipping Information
                  </h2>
                </div>
                {currentStep > 1 && (
                  <span className="text-emerald-400 text-xs uppercase font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                  </span>
                )}
              </div>

              {currentStep === 1 && (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[#ececec]/50 block mb-1 font-mono">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Marcus Aurelius"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="w-full bg-[#111111] border border-[#1f1f1f] p-3 text-sm focus:outline-none focus:border-[#ececec] rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[#ececec]/50 block mb-1 font-mono">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. client@mantra.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full bg-[#111111] border border-[#1f1f1f] p-3 text-sm focus:outline-none focus:border-[#ececec] rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[#ececec]/50 block mb-1 font-mono">
                        Phone Number (WhatsApp Active) *
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 081234567890"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className="w-full bg-[#111111] border border-[#1f1f1f] p-3 text-sm focus:outline-none focus:border-[#ececec] rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[#ececec]/50 block mb-1 font-mono">
                        Postal Code (Kode Pos) *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 12340 / 40115"
                        value={postalCodeInput}
                        onChange={(e) => setPostalCodeInput(e.target.value)}
                        className="w-full bg-[#111111] border border-[#1f1f1f] p-3 text-sm focus:outline-none focus:border-[#ececec] rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#ececec]/50 block mb-1 font-mono">
                      Full Address (Street, Building, RT/RW, District, City) *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Jl. Arcanum No. 7, Kebayoran Baru, Jakarta Selatan"
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      className="w-full bg-[#111111] border border-[#1f1f1f] p-3 text-sm focus:outline-none focus:border-[#ececec] rounded-xl"
                    />
                  </div>

                  <button
                    onClick={handleProceedToShipping}
                    className="mt-4 w-full bg-[#ececec] text-[#050505] px-8 py-3.5 uppercase tracking-widest text-xs font-bold hover:bg-white transition-colors cursor-pointer rounded-xl flex items-center justify-center gap-2"
                  >
                    Continue to Shipping <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Biteship Shipping Rates Selector */}
            <div
              className={cn(
                "border border-[#1f1f1f] transition-colors duration-500 rounded-2xl overflow-hidden",
                currentStep === 2 ? "bg-[#0a0a0a]" : "bg-transparent"
              )}
            >
              <div
                className="p-6 border-b border-[#1f1f1f] flex justify-between items-center cursor-pointer"
                onClick={() => currentStep > 2 && setCurrentStep(2)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono border",
                    currentStep === 2 ? "bg-white text-black border-white" : "border-[#2a2a2a] text-[#ececec]/50"
                  )}>
                    2
                  </div>
                  <h2 className="uppercase tracking-widest font-bold text-sm flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#ececec]/70" /> Shipping Method (Biteship)
                  </h2>
                </div>
                {currentStep > 2 && selectedRate && (
                  <span className="text-emerald-400 text-xs uppercase font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {selectedRate.courier_name} {selectedRate.courier_service_name}
                  </span>
                )}
              </div>

              {currentStep === 2 && (
                <div className="p-6 space-y-4">
                  {isLoadingRates ? (
                    <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                      <p className="text-xs uppercase tracking-widest text-[#ececec]/60 font-mono">
                        Querying Biteship Couriers...
                      </p>
                    </div>
                  ) : shippingRates.length === 0 ? (
                    <div className="text-center py-8 space-y-4">
                      <p className="text-xs text-[#ececec]/50 uppercase tracking-widest">
                        No courier rates available for postal code {postalCodeInput}.
                      </p>
                      <button
                        onClick={() => fetchShippingRates(postalCodeInput)}
                        className="border border-[#2a2a2a] text-xs uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-[#111111]"
                      >
                        Retry Fetching Rates
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-[11px] uppercase tracking-widest text-[#ececec]/50 font-mono mb-2">
                        Select preferred courier for postal code: <span className="text-emerald-400 font-bold">{postalCodeInput}</span>
                      </p>

                      {shippingRates.map((rate, idx) => {
                        const isSelected =
                          selectedRate?.courier_code === rate.courier_code &&
                          selectedRate?.courier_service_code === rate.courier_service_code;

                        return (
                          <label
                            key={`${rate.courier_code}-${rate.courier_service_code}-${idx}`}
                            className={cn(
                              "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all",
                              isSelected
                                ? "bg-[#141414] border-emerald-500/50 shadow-lg shadow-emerald-950/20"
                                : "bg-[#111111] border-[#1f1f1f] hover:border-[#2a2a2a]"
                            )}
                            onClick={() => setSelectedRate(rate)}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="courierSelection"
                                checked={isSelected}
                                onChange={() => setSelectedRate(rate)}
                                className="accent-emerald-400 w-4 h-4"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                                    {rate.courier_name}
                                  </span>
                                  <span className="text-[10px] font-mono uppercase bg-[#202020] px-2 py-0.5 rounded text-[#ececec]/70">
                                    {rate.courier_service_name}
                                  </span>
                                </div>
                                <p className="text-[10px] text-[#ececec]/50 font-mono mt-0.5">
                                  Estimated: {rate.duration}
                                </p>
                              </div>
                            </div>

                            <div className="text-right font-mono">
                              <span className="text-xs font-bold text-emerald-400">
                                {formatRupiah(rate.price)}
                              </span>
                            </div>
                          </label>
                        );
                      })}

                      <button
                        onClick={handleProceedToPayment}
                        className="mt-6 w-full bg-[#ececec] text-[#050505] px-8 py-3.5 uppercase tracking-widest text-xs font-bold hover:bg-white transition-colors cursor-pointer rounded-xl flex items-center justify-center gap-2"
                      >
                        Continue to Payment <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 3: Midtrans Payment Method */}
            <div
              className={cn(
                "border border-[#1f1f1f] transition-colors duration-500 rounded-2xl overflow-hidden",
                currentStep === 3 ? "bg-[#0a0a0a]" : "bg-transparent"
              )}
            >
              <div className="p-6 border-b border-[#1f1f1f] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono border",
                    currentStep === 3 ? "bg-white text-black border-white" : "border-[#2a2a2a] text-[#ececec]/50"
                  )}>
                    3
                  </div>
                  <h2 className="uppercase tracking-widest font-bold text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#ececec]/70" /> Payment (Midtrans Snap)
                  </h2>
                </div>
              </div>

              {currentStep === 3 && (
                <div className="p-6 space-y-5">
                  <div className="p-4 bg-[#111111] border border-emerald-500/30 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4" /> Midtrans Snap Gateway
                    </div>
                    <p className="text-xs text-[#ececec]/60 leading-relaxed font-light">
                      Supports instant payment via QRIS, BCA/Mandiri/BRI Virtual Accounts, GoPay, ShopeePay, and Credit Card.
                    </p>
                  </div>

                  <button
                    onClick={handlePayWithMidtrans}
                    disabled={isSubmitting}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#050505] py-4 rounded-xl text-xs uppercase tracking-widest font-bold disabled:opacity-50 cursor-pointer transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Opening Midtrans Snap...
                      </>
                    ) : (
                      <>
                        Pay Now • {formatRupiah(grandTotal)}
                      </>
                    )}
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
                        {item.quantity} x {formatRupiah(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-[#1f1f1f] space-y-3 text-xs">
                <div className="flex justify-between text-[#ececec]/60 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="font-mono text-[#ececec]">
                    {formatRupiah(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-[#ececec]/60 uppercase tracking-widest">
                  <span>Shipping ({selectedRate?.courier_name || "Courier"})</span>
                  <span className="font-mono text-emerald-400">
                    {selectedRate ? formatRupiah(selectedRate.price) : "Select in Step 2"}
                  </span>
                </div>

                <div className="border-t border-[#1f1f1f] pt-3 flex justify-between uppercase tracking-widest font-bold text-sm">
                  <span>Grand Total</span>
                  <span className="font-mono text-emerald-400">
                    {formatRupiah(grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}