"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Script from "next/script";
import { useCartStore } from "@/store/useCartStore";
import { cn, formatRupiah } from "@/lib/utils";
import { Truck, ShieldCheck, CreditCard, ChevronRight, Loader2, CheckCircle2 } from "lucide-react";

declare global {
  interface Window {
    snap: any;
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
    whatsapp?: string | null;
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

  // Validation errors state
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    postalCode?: string;
    address?: string;
  }>({});

  // Helper to extract 5-digit postal code from saved user address if available
  const extractPostalCode = (addr: string | null | undefined): string => {
    if (!addr) return "";
    const match = addr.match(/\b(\d{5})\b/);
    return match ? match[1] : "";
  };

  // Helper to extract Indonesian phone number from saved address
  const extractPhone = (addr: string | null | undefined): string => {
    if (!addr) return "";
    const match = addr.match(/(?:\+62|62|0)8[1-9][0-9]{6,11}/);
    return match ? match[0] : "";
  };

  const initialPostal = extractPostalCode(user?.address) || "";
  const initialPhone = user?.whatsapp || extractPhone(user?.address) || "";

  // Form Inputs
  const [nameInput, setNameInput] = useState(user?.name || "");
  const [emailInput, setEmailInput] = useState(user?.email || "");
  const [phoneInput, setPhoneInput] = useState(initialPhone);
  const [postalCodeInput, setPostalCodeInput] = useState(initialPostal);
  const [destinationPostalCode, setDestinationPostalCode] = useState(initialPostal);
  const [addressInput, setAddressInput] = useState(user?.address || "");

  // Shipping Rates & Selection (Biteship)
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);

  const subtotal = getSubtotal();
  const shippingCost = selectedRate ? selectedRate.price : 0;
  const grandTotal = subtotal + shippingCost;

  // Fetch Shipping Rates from Biteship API
  const fetchShippingRates = useCallback(async (postalCode: string) => {
    const cleanedZip = postalCode.trim();
    if (!cleanedZip || items.length === 0) return;

    setIsLoadingRates(true);

    try {
      const res = await fetch("/api/biteship/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination_postal_code: cleanedZip,
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
        // Automatically retain or pick the first available rate
        setSelectedRate((prev) => {
          if (!prev) return data.rates[0];
          const matched = data.rates.find(
            (r: ShippingRate) =>
              r.courier_code === prev.courier_code &&
              r.courier_service_code === prev.courier_service_code
          );
          return matched || data.rates[0];
        });
      } else {
        setShippingRates([]);
        setSelectedRate(null);
      }
    } catch (err) {
      console.error("Rates fetch error:", err);
    } finally {
      setIsLoadingRates(false);
    }
  }, [items]);

  // Re-fetch dynamics: automatically calculate shipping rates when postal code or cart items change
  useEffect(() => {
    const cleanedPostal = destinationPostalCode.trim();
    if (cleanedPostal.length >= 4 && items.length > 0) {
      const timer = setTimeout(() => {
        fetchShippingRates(cleanedPostal);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [destinationPostalCode, items, fetchShippingRates]);

  // Handle postal code input change & sync destinationPostalCode & clear inline error
  const handlePostalCodeChange = (val: string) => {
    setPostalCodeInput(val);
    setDestinationPostalCode(val.trim());
    if (errors.postalCode) {
      setErrors((prev) => ({ ...prev, postalCode: undefined }));
    }
  };

  // Handle address input change & auto-detect postal code and phone & clear inline error
  const handleAddressChange = (val: string) => {
    setAddressInput(val);
    if (errors.address) {
      setErrors((prev) => ({ ...prev, address: undefined }));
    }
    const detectedPostal = extractPostalCode(val);
    if (detectedPostal && (!postalCodeInput || postalCodeInput === initialPostal)) {
      setPostalCodeInput(detectedPostal);
      setDestinationPostalCode(detectedPostal);
      if (errors.postalCode) {
        setErrors((prev) => ({ ...prev, postalCode: undefined }));
      }
    }
    const detectedPhone = extractPhone(val);
    if (detectedPhone && !phoneInput) {
      setPhoneInput(detectedPhone);
      if (errors.phone) {
        setErrors((prev) => ({ ...prev, phone: undefined }));
      }
    }
  };

  // Step 1 -> Step 2 validation & rate calculation
  const handleProceedToShipping = async () => {
    const newErrors: {
      name?: string;
      email?: string;
      phone?: string;
      postalCode?: string;
      address?: string;
    } = {};

    if (!nameInput.trim()) newErrors.name = "Full name is required";
    if (!emailInput.trim()) newErrors.email = "Email address is required";
    if (!phoneInput.trim()) newErrors.phone = "Phone number is required";
    if (!postalCodeInput.trim()) newErrors.postalCode = "Postal code is required";
    if (!addressInput.trim()) newErrors.address = "Full address is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setErrorMsg("");
    setCurrentStep(2);
    await fetchShippingRates(postalCodeInput.trim());
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
        throw new Error(data.error || data.message || "Failed to initiate payment.");
      }

      const orderId = data.orderId;
      const snapToken = data.snapToken || data.token;

      if (!snapToken) {
        if (data.redirectUrl) {
          clearCart();
          window.location.href = data.redirectUrl;
          return;
        }
        throw new Error("Unable to retrieve Midtrans payment token.");
      }

      // Check if Midtrans Snap SDK is available on window
      if (typeof window !== "undefined" && window.snap && typeof window.snap.pay === "function") {
        window.snap.pay(snapToken, {
          onSuccess: (result: any) => {
            console.log("Midtrans payment success:", result);
            clearCart();
            router.push(`/order-received?order_id=${orderId}`);
          },
          onPending: (result: any) => {
            console.log("Midtrans payment pending:", result);
            clearCart();
            router.push(`/account/orders?status=pending`);
          },
          onError: (result: any) => {
            console.error("Midtrans payment error:", result);
            setErrorMsg("Pembayaran gagal atau ditolak. Silakan coba lagi.");
            setIsSubmitting(false);
          },
          onClose: () => {
            setErrorMsg("Pembayaran belum diselesaikan. Anda dapat mencoba bayar lagi atau melihat pesanan di menu My Orders.");
            setIsSubmitting(false);
          },
        });
      } else if (data.redirectUrl) {
        clearCart();
        window.location.href = data.redirectUrl;
      } else {
        setErrorMsg("Midtrans Snap payment service is currently unavailable. Please refresh and try again.");
        setIsSubmitting(false);
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
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />

      <div className="bg-[#050505] min-h-screen border-t border-[#1f1f1f] py-12 text-[#ececec]">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: 3-Step Wizard */}
          <div className="lg:col-span-7 space-y-6">
            {errorMsg && currentStep !== 1 && (
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
                        onChange={(e) => {
                          setNameInput(e.target.value);
                          if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        className={cn(
                          "w-full bg-[#111111] p-3 text-sm focus:outline-none rounded-xl transition-all",
                          errors.name
                            ? "border border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-red-100 placeholder:text-red-300/40"
                            : "border border-[#1f1f1f] focus:border-[#ececec]"
                        )}
                      />
                      {errors.name && (
                        <p className="text-red-400 text-[11px] font-mono mt-1.5">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[#ececec]/50 block mb-1 font-mono">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. client@mantra.com"
                        value={emailInput}
                        onChange={(e) => {
                          setEmailInput(e.target.value);
                          if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        className={cn(
                          "w-full bg-[#111111] p-3 text-sm focus:outline-none rounded-xl transition-all",
                          errors.email
                            ? "border border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-red-100 placeholder:text-red-300/40"
                            : "border border-[#1f1f1f] focus:border-[#ececec]"
                        )}
                      />
                      {errors.email && (
                        <p className="text-red-400 text-[11px] font-mono mt-1.5">
                          {errors.email}
                        </p>
                      )}
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
                        onChange={(e) => {
                          setPhoneInput(e.target.value);
                          if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                        }}
                        className={cn(
                          "w-full bg-[#111111] p-3 text-sm focus:outline-none rounded-xl transition-all",
                          errors.phone
                            ? "border border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-red-100 placeholder:text-red-300/40"
                            : "border border-[#1f1f1f] focus:border-[#ececec]"
                        )}
                      />
                      {errors.phone && (
                        <p className="text-red-400 text-[11px] font-mono mt-1.5">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[#ececec]/50 block mb-1 font-mono">
                        Postal Code (Kode Pos) *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 78118 (Pontianak) / 12340"
                        value={postalCodeInput}
                        onChange={(e) => handlePostalCodeChange(e.target.value)}
                        className={cn(
                          "w-full bg-[#111111] p-3 text-sm focus:outline-none rounded-xl font-mono transition-all",
                          errors.postalCode
                            ? "border border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-red-100 placeholder:text-red-300/40"
                            : "border border-[#1f1f1f] focus:border-[#ececec]"
                        )}
                      />
                      {errors.postalCode && (
                        <p className="text-red-400 text-[11px] font-mono mt-1.5">
                          {errors.postalCode}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#ececec]/50 block mb-1 font-mono">
                      Full Address (Street, Building, RT/RW, District, City) *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Jl. Gajah Mada No. 88, Benua Melayu Darat, Pontianak Selatan, Kota Pontianak"
                      value={addressInput}
                      onChange={(e) => handleAddressChange(e.target.value)}
                      className={cn(
                        "w-full bg-[#111111] p-3 text-sm focus:outline-none rounded-xl transition-all",
                        errors.address
                          ? "border border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-red-100 placeholder:text-red-300/40"
                          : "border border-[#1f1f1f] focus:border-[#ececec]"
                      )}
                    />
                    {errors.address && (
                      <p className="text-red-400 text-[11px] font-mono mt-1.5">
                        {errors.address}
                      </p>
                    )}
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
                        Calculating rates for postal code {destinationPostalCode || postalCodeInput}...
                      </p>
                    </div>
                  ) : shippingRates.length === 0 ? (
                    <div className="text-center py-8 space-y-4">
                      <p className="text-xs text-[#ececec]/50 uppercase tracking-widest">
                        No courier rates available for postal code {destinationPostalCode || postalCodeInput || "—"}.
                      </p>
                      <button
                        onClick={() => fetchShippingRates(destinationPostalCode || postalCodeInput)}
                        className="border border-[#2a2a2a] text-xs uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-[#111111]"
                      >
                        Retry Fetching Rates
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-[11px] uppercase tracking-widest text-[#ececec]/50 font-mono mb-2">
                        FOR POSTAL CODE: <span className="text-emerald-400 font-bold">{destinationPostalCode || postalCodeInput || "—"}</span>
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