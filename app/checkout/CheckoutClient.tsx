"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Script from "next/script";
import { useCartStore } from "@/store/useCartStore";
import { useCurrency } from "@/context/CurrencyContext";
import { cn, formatRupiah } from "@/lib/utils";
import {
  Truck,
  ShieldCheck,
  CreditCard,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Globe,
  ChevronDown,
  Building2,
  Mail,
  Sparkles,
  MapPin,
} from "lucide-react";

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

export interface DistrictItem {
  district: string;
  postal_code: string;
  id: string;
  area_name: string;
  city?: string;
  province?: string;
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

const COUNTRY_OPTIONS = [
  { code: "ID", name: "Indonesia 🇮🇩" },
  { code: "SG", name: "Singapore 🇸🇬" },
  { code: "MY", name: "Malaysia 🇲🇾" },
  { code: "US", name: "United States 🇺🇸" },
  { code: "GB", name: "United Kingdom 🇬🇧" },
  { code: "AU", name: "Australia 🇦🇺" },
  { code: "JP", name: "Japan 🇯🇵" },
  { code: "KR", name: "South Korea 🇰🇷" },
  { code: "DE", name: "Germany 🇩🇪" },
  { code: "FR", name: "France 🇫🇷" },
  { code: "CA", name: "Canada 🇨🇦" },
  { code: "NL", name: "Netherlands 🇳🇱" },
  { code: "OTHER", name: "Other Countries 🌐" },
];

export default function CheckoutClient({ user }: CheckoutClientProps) {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { formatPrice, currency, exchangeRate } = useCurrency();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Destination Country State
  const [countryInput, setCountryInput] = useState<string>("ID");

  // Validation errors state
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    state?: string;
    city?: string;
    district?: string;
    postalCode?: string;
    address?: string;
  }>({});

  // Helper to parse saved user address
  const parseInitialSavedAddress = (raw: string | null | undefined) => {
    if (!raw) {
      return {
        recipientName: "",
        street: "",
        areaId: "",
        areaName: "",
        postalCode: "",
        phone: "",
        country: "ID",
        city: "",
        state: "",
        district: "",
      };
    }
    try {
      const obj = JSON.parse(raw);
      if (obj && typeof obj === "object") {
        return {
          recipientName: obj.recipientName || obj.recipient_name || obj.name || "",
          street: obj.street || obj.street_details || "",
          areaId: obj.area_id || obj.areaId || "",
          areaName:
            obj.area_name ||
            obj.areaName ||
            (obj.district && obj.city
              ? `${obj.district}, ${obj.city}, ${obj.province || ""} ${obj.postal_code || ""}`.trim()
              : ""),
          postalCode: obj.postal_code || obj.postalCode || "",
          phone: obj.phone || "",
          country: obj.country || "ID",
          city: obj.city || "",
          state: obj.state || obj.province || "",
          district: obj.district || "",
        };
      }
    } catch (e) {
      // string parsing fallback
    }

    const phoneMatch = raw.match(/(?:\+62|62|0)8[1-9][0-9]{6,11}/);
    const postalMatch = raw.match(/\b(\d{5})\b/);

    let cleanStreet = raw;
    let extractedName = "";
    const match = raw.match(/\[(.*?)\] (.*?) \((.*?)\) - (.*)/);
    if (match) {
      extractedName = match[2];
      cleanStreet = match[4];
    }

    return {
      recipientName: extractedName,
      street: cleanStreet,
      areaId: "",
      areaName: "",
      postalCode: postalMatch ? postalMatch[1] : "",
      phone: phoneMatch ? phoneMatch[0] : "",
      country: "ID",
      city: "",
      state: "",
      district: "",
    };
  };

  const initialSaved = parseInitialSavedAddress(user?.address);
  const initialName = initialSaved.recipientName || user?.name || "";
  const initialPostal = initialSaved.postalCode;
  const initialPhone = initialSaved.phone || user?.whatsapp || "";

  // Contact Inputs
  const [nameInput, setNameInput] = useState(initialName);
  const [emailInput, setEmailInput] = useState(user?.email || "");
  const [phoneInput, setPhoneInput] = useState(initialPhone);

  // 1. Scoped State/Province Typeahead State
  const [stateInput, setStateInput] = useState(initialSaved.state || "");
  const [stateSuggestions, setStateSuggestions] = useState<string[]>([]);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [isLoadingState, setIsLoadingState] = useState(false);
  const stateRef = useRef<HTMLDivElement>(null);

  // 2. Scoped City/Regency Typeahead State
  const [cityInput, setCityInput] = useState(initialSaved.city || "");
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isLoadingCity, setIsLoadingCity] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);

  // 3. Scoped District/Kecamatan Typeahead State (Indonesia)
  const [districtInput, setDistrictInput] = useState(initialSaved.district || "");
  const [districtSuggestions, setDistrictSuggestions] = useState<DistrictItem[]>([]);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [isLoadingDistrict, setIsLoadingDistrict] = useState(false);
  const districtRef = useRef<HTMLDivElement>(null);

  // 4. Postal Code & Area ID State (Auto-filled / Locked from District)
  const [postalCodeInput, setPostalCodeInput] = useState(initialPostal);
  const [destinationPostalCode, setDestinationPostalCode] = useState(initialPostal);
  const [selectedAreaId, setSelectedAreaId] = useState<string>(initialSaved.areaId || "");
  const [selectedAreaName, setSelectedAreaName] = useState<string>(initialSaved.areaName || "");

  // 5. Street Address Details (Textarea)
  const [addressInput, setAddressInput] = useState(initialSaved.street || user?.address || "");

  // Shipping Rates & Selection
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);

  const subtotal = getSubtotal();
  const shippingCost = selectedRate ? selectedRate.price : 0;
  const grandTotal = subtotal + shippingCost;

  // Click Outside to Close Typeahead Dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stateRef.current && !stateRef.current.contains(event.target as Node)) {
        setShowStateDropdown(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
      if (districtRef.current && !districtRef.current.contains(event.target as Node)) {
        setShowDistrictDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Shipping Rates from API
  const fetchShippingRates = useCallback(
    async (
      postalCode?: string,
      areaId?: string,
      areaName?: string,
      fullAddress?: string,
      countryOverride?: string,
      cityOverride?: string,
      stateOverride?: string
    ) => {
      const activeCountry = countryOverride ?? countryInput;
      const targetZip = (postalCode ?? destinationPostalCode ?? postalCodeInput).trim();
      const targetAreaId = areaId ?? selectedAreaId;
      const targetAreaName = areaName ?? selectedAreaName;
      const targetCity = cityOverride ?? cityInput;
      const targetState = stateOverride ?? stateInput;
      const targetAddress = fullAddress ?? addressInput;

      if (!targetZip && !targetAreaId && !targetCity && !targetAddress) return;
      if (items.length === 0) return;

      setIsLoadingRates(true);

      try {
        const res = await fetch("/api/shipping/rates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destination_country: activeCountry,
            destination_postal_code: targetZip || (activeCountry === "ID" ? "10110" : "00000"),
            destination_area_id: activeCountry === "ID" ? (targetAreaId || undefined) : undefined,
            destination_area_name: targetAreaName || undefined,
            destination_city: targetCity || undefined,
            destination_state: targetState || undefined,
            address: targetAddress,
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
    },
    [
      countryInput,
      destinationPostalCode,
      postalCodeInput,
      selectedAreaId,
      selectedAreaName,
      cityInput,
      stateInput,
      addressInput,
      items,
    ]
  );

  // Auto fetch initial rates if user has saved postal code or address
  useEffect(() => {
    if (initialPostal || initialSaved.areaId || initialSaved.street) {
      fetchShippingRates(
        initialPostal,
        initialSaved.areaId,
        initialSaved.areaName,
        initialSaved.street,
        countryInput,
        initialSaved.city,
        initialSaved.state
      );
    }
  }, []);

  // --- CASCADING AUTO-RESET HANDLERS ---

  // 1. Country Change -> Resets State, City, District, Postal Code
  const handleCountryChange = (newCountry: string) => {
    setCountryInput(newCountry);

    setStateInput("");
    setStateSuggestions([]);
    setShowStateDropdown(false);

    setCityInput("");
    setCitySuggestions([]);
    setShowCityDropdown(false);

    setDistrictInput("");
    setDistrictSuggestions([]);
    setShowDistrictDropdown(false);

    setPostalCodeInput("");
    setDestinationPostalCode("");
    setSelectedAreaId("");
    setSelectedAreaName("");

    setSelectedRate(null);
    setShippingRates([]);

    setErrors({});
  };

  // 2. State / Province Suggestions & Selection
  const fetchStateSuggestions = async (query: string) => {
    setIsLoadingState(true);
    try {
      const res = await fetch(
        `/api/biteship/areas?scope=state&country=${encodeURIComponent(countryInput)}&q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        setStateSuggestions(data.results);
        setShowStateDropdown(true);
      }
    } catch (e) {
      console.error("State search error:", e);
    } finally {
      setIsLoadingState(false);
    }
  };

  const handleStateInputChange = (val: string) => {
    setStateInput(val);
    if (errors.state) setErrors((prev) => ({ ...prev, state: undefined }));
    fetchStateSuggestions(val);
  };

  const handleSelectState = (selectedState: string) => {
    setStateInput(selectedState);
    setShowStateDropdown(false);

    // Reset Child Tiers
    setCityInput("");
    setCitySuggestions([]);
    setShowCityDropdown(false);

    setDistrictInput("");
    setDistrictSuggestions([]);
    setShowDistrictDropdown(false);

    setPostalCodeInput("");
    setDestinationPostalCode("");
    setSelectedAreaId("");
    setSelectedAreaName("");

    setSelectedRate(null);
    setShippingRates([]);

    if (errors.state) setErrors((prev) => ({ ...prev, state: undefined }));

    // Pre-fetch cities for this province
    fetchCitySuggestions("", selectedState);
  };

  // 3. City / Regency Suggestions & Selection
  const fetchCitySuggestions = async (query: string, stateVal?: string) => {
    setIsLoadingCity(true);
    try {
      const activeState = stateVal !== undefined ? stateVal : stateInput;
      const res = await fetch(
        `/api/biteship/areas?scope=city&country=${encodeURIComponent(countryInput)}&state=${encodeURIComponent(activeState)}&q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        setCitySuggestions(data.results);
        setShowCityDropdown(true);
      }
    } catch (e) {
      console.error("City search error:", e);
    } finally {
      setIsLoadingCity(false);
    }
  };

  const handleCityInputChange = (val: string) => {
    setCityInput(val);
    if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
    fetchCitySuggestions(val);
  };

  const handleSelectCity = (selectedCity: string) => {
    setCityInput(selectedCity);
    setShowCityDropdown(false);

    // Reset Child Tiers
    setDistrictInput("");
    setDistrictSuggestions([]);
    setShowDistrictDropdown(false);

    setPostalCodeInput("");
    setDestinationPostalCode("");
    setSelectedAreaId("");
    setSelectedAreaName("");

    setSelectedRate(null);
    setShippingRates([]);

    if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));

    // Pre-fetch districts for this city in Indonesia
    if (countryInput === "ID") {
      fetchDistrictSuggestions("", selectedCity, stateInput);
    }
  };

  // 4. District / Kecamatan Suggestions & Selection (Indonesia)
  const fetchDistrictSuggestions = async (query: string, cityVal?: string, stateVal?: string) => {
    setIsLoadingDistrict(true);
    try {
      const activeCity = cityVal !== undefined ? cityVal : cityInput;
      const activeState = stateVal !== undefined ? stateVal : stateInput;
      const res = await fetch(
        `/api/biteship/areas?scope=district&country=${encodeURIComponent(countryInput)}&state=${encodeURIComponent(activeState)}&city=${encodeURIComponent(activeCity)}&q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        setDistrictSuggestions(data.results);
        setShowDistrictDropdown(true);
      }
    } catch (e) {
      console.error("District search error:", e);
    } finally {
      setIsLoadingDistrict(false);
    }
  };

  const handleDistrictInputChange = (val: string) => {
    setDistrictInput(val);
    if (errors.district) setErrors((prev) => ({ ...prev, district: undefined }));
    fetchDistrictSuggestions(val);
  };

  const handleSelectDistrict = (item: DistrictItem) => {
    setDistrictInput(item.district);
    setPostalCodeInput(item.postal_code);
    setDestinationPostalCode(item.postal_code);
    setSelectedAreaId(item.id);
    setSelectedAreaName(item.area_name);
    setShowDistrictDropdown(false);

    if (item.city && !cityInput) setCityInput(item.city);
    if (item.province && !stateInput) setStateInput(item.province);

    if (errors.district || errors.postalCode) {
      setErrors((prev) => ({ ...prev, district: undefined, postalCode: undefined }));
    }

    // Trigger instant shipping rate calculation with the selected district area ID & postal code
    fetchShippingRates(
      item.postal_code,
      item.id,
      item.area_name,
      addressInput,
      countryInput,
      item.city || cityInput,
      item.province || stateInput
    );
  };

  // Step 1 -> Step 2 validation & rate calculation
  const handleProceedToShipping = async () => {
    const newErrors: {
      name?: string;
      email?: string;
      phone?: string;
      state?: string;
      city?: string;
      district?: string;
      postalCode?: string;
      address?: string;
    } = {};

    if (!nameInput.trim()) newErrors.name = "Recipient name is required";
    if (!emailInput.trim()) newErrors.email = "Email address is required";
    if (!phoneInput.trim()) newErrors.phone = "Phone number is required";
    if (!stateInput.trim()) newErrors.state = "Province / State is required";
    if (!cityInput.trim()) newErrors.city = "City / Regency is required";

    if (countryInput === "ID") {
      if (!districtInput.trim()) newErrors.district = "District (Kecamatan) is required";
      if (!postalCodeInput.trim() && !selectedAreaId) {
        newErrors.postalCode = "Postal Code is required (select a District)";
      }
    } else {
      if (!postalCodeInput.trim()) newErrors.postalCode = "Postal / ZIP Code is required";
    }

    if (!addressInput.trim()) {
      newErrors.address = "Street address & building / unit details is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setErrorMsg("");
    setCurrentStep(2);
    await fetchShippingRates(
      postalCodeInput.trim(),
      selectedAreaId || undefined,
      selectedAreaName || undefined,
      addressInput.trim(),
      countryInput,
      cityInput.trim(),
      stateInput.trim()
    );
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

    const countryObj = COUNTRY_OPTIONS.find((c) => c.code === countryInput);
    const countryLabel = countryObj ? countryObj.name : countryInput;

    const formattedShippingAddress =
      countryInput === "ID"
        ? selectedAreaName
          ? `${addressInput}, ${selectedAreaName}`
          : `${addressInput}, ${districtInput ? `${districtInput}, ` : ""}${cityInput ? `${cityInput}, ` : ""}${stateInput ? `${stateInput} ` : ""}${postalCodeInput} (Indonesia)`
        : `${addressInput}, ${cityInput}${stateInput ? `, ${stateInput}` : ""}, ${postalCodeInput}, ${countryLabel}`;

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
          shippingAddress: formattedShippingAddress,
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
            setErrorMsg("Payment failed or was declined. Please try again.");
            setIsSubmitting(false);
          },
          onClose: () => {
            setErrorMsg("Payment not completed. You can retry payment here or manage your order in My Orders.");
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

  const currentCountryName =
    COUNTRY_OPTIONS.find((c) => c.code === countryInput)?.name || countryInput;

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
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono border",
                      currentStep === 1
                        ? "bg-white text-black border-white"
                        : "border-[#2a2a2a] text-[#ececec]/50"
                    )}
                  >
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
                <div className="p-6 space-y-5">
                  {/* Field 1: Destination Country */}
                  <div>
                    <div className="h-5 flex items-center justify-between mb-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-[#ececec]/50 font-mono flex items-center gap-1.5 whitespace-nowrap">
                        <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Destination Country *
                      </label>
                      <span className="text-[10px] font-mono text-emerald-400/80 whitespace-nowrap">
                        {countryInput === "ID"
                          ? "Domestic Express (Indonesia)"
                          : "International Courier"}
                      </span>
                    </div>
                    <select
                      value={countryInput}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="w-full h-11 bg-[#111111] px-3 text-sm focus:outline-none rounded-xl border border-[#1f1f1f] focus:border-emerald-400 text-white cursor-pointer transition-all"
                    >
                      {COUNTRY_OPTIONS.map((c) => (
                        <option key={c.code} value={c.code} className="bg-[#111111] text-white py-2">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Field 2: Recipient Name & Email Address */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="h-5 flex items-center mb-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-[#ececec]/50 font-mono whitespace-nowrap">
                          Recipient Name *
                        </label>
                      </div>
                      <input
                        type="text"
                        placeholder="Your Full Name"
                        value={nameInput}
                        onChange={(e) => {
                          setNameInput(e.target.value);
                          if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        className={cn(
                          "w-full h-11 bg-[#111111] px-3 text-sm focus:outline-none rounded-xl transition-all",
                          errors.name
                            ? "border border-red-500 focus:border-red-500 text-red-100 placeholder:text-red-300/40"
                            : "border border-[#1f1f1f] focus:border-[#ececec]"
                        )}
                      />
                      {errors.name && (
                        <p className="text-red-400 text-[10px] font-mono mt-1">{errors.name}</p>
                      )}
                    </div>
                    <div>
                      <div className="h-5 flex items-center mb-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-[#ececec]/50 font-mono whitespace-nowrap">
                          Email Address *
                        </label>
                      </div>
                      <input
                        type="email"
                        placeholder="yourname@domain.com"
                        value={emailInput}
                        onChange={(e) => {
                          setEmailInput(e.target.value);
                          if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        className={cn(
                          "w-full h-11 bg-[#111111] px-3 text-sm focus:outline-none rounded-xl transition-all",
                          errors.email
                            ? "border border-red-500 focus:border-red-500 text-red-100 placeholder:text-red-300/40"
                            : "border border-[#1f1f1f] focus:border-[#ececec]"
                        )}
                      />
                      {errors.email && (
                        <p className="text-red-400 text-[10px] font-mono mt-1">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Field 3: Phone Number (WhatsApp Active) */}
                  <div>
                    <div className="h-5 flex items-center mb-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-[#ececec]/50 font-mono whitespace-nowrap">
                        Phone Number (WhatsApp Active) *
                      </label>
                    </div>
                    <input
                      type="tel"
                      placeholder={
                        countryInput === "ID"
                          ? "e.g. 08123456789"
                          : "e.g. +1 555 123 4567 / +60 12 345 6789"
                      }
                      value={phoneInput}
                      onChange={(e) => {
                        setPhoneInput(e.target.value);
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                      }}
                      className={cn(
                        "w-full h-11 bg-[#111111] px-3 text-sm focus:outline-none rounded-xl transition-all font-mono",
                        errors.phone
                          ? "border border-red-500 focus:border-red-500 text-red-100 placeholder:text-red-300/40"
                          : "border border-[#1f1f1f] focus:border-[#ececec]"
                      )}
                    />
                    {errors.phone && (
                      <p className="text-red-400 text-[10px] font-mono mt-1">{errors.phone}</p>
                    )}
                  </div>

                  {/* Field 4: Cascading Address Selector */}
                  {countryInput === "ID" ? (
                    /* 4-Tier Domestic Hierarchy (Province -> City / Regency -> District -> Postal Code Auto-Filled) */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Level 1: PROVINCE */}
                      <div className="relative" ref={stateRef}>
                        <div className="h-5 flex items-center justify-between mb-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-[#ececec]/50 font-mono whitespace-nowrap">
                            PROVINCE *
                          </label>
                        </div>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            placeholder="Select Province (e.g. West Java, Special Capital Region of Jakarta)"
                            value={stateInput}
                            onChange={(e) => handleStateInputChange(e.target.value)}
                            onFocus={() => fetchStateSuggestions(stateInput)}
                            className={cn(
                              "w-full h-11 bg-[#111111] p-3 pr-8 text-xs focus:outline-none rounded-xl transition-all font-mono",
                              errors.state
                                ? "border border-red-500 focus:border-red-500 text-red-100"
                                : "border border-[#1f1f1f] focus:border-emerald-400"
                            )}
                          />
                          <div className="absolute right-3 pointer-events-none text-[#ececec]/40">
                            {isLoadingState ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </div>
                        </div>
                        {errors.state && (
                          <p className="text-red-400 text-[10px] font-mono mt-1">{errors.state}</p>
                        )}

                        {showStateDropdown && stateSuggestions.length > 0 && (
                          <div className="absolute z-50 left-0 right-0 mt-1.5 bg-[#0e0e0e] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
                            <div className="p-2 text-[9px] uppercase tracking-widest text-[#ececec]/40 font-mono border-b border-[#1f1f1f]">
                              Select Province ({stateSuggestions.length})
                            </div>
                            {stateSuggestions.map((st, idx) => (
                              <div
                                key={`${st}-${idx}`}
                                onClick={() => handleSelectState(st)}
                                className="p-3 hover:bg-[#181818] cursor-pointer border-b border-[#181818] last:border-0 text-xs font-mono text-white transition-colors flex items-center justify-between"
                              >
                                <span>{st}</span>
                                <ChevronRight className="w-3 h-3 text-[#ececec]/30" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Level 2: CITY / REGENCY */}
                      <div className="relative" ref={cityRef}>
                        <div className="h-5 flex items-center justify-between mb-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-[#ececec]/50 font-mono whitespace-nowrap">
                            CITY / REGENCY *
                          </label>
                        </div>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            placeholder="Select City / Regency (e.g. Bandung, South Jakarta)"
                            value={cityInput}
                            onChange={(e) => handleCityInputChange(e.target.value)}
                            onFocus={() => fetchCitySuggestions(cityInput)}
                            className={cn(
                              "w-full h-11 bg-[#111111] p-3 pr-8 text-xs focus:outline-none rounded-xl transition-all font-mono",
                              errors.city
                                ? "border border-red-500 focus:border-red-500 text-red-100"
                                : "border border-[#1f1f1f] focus:border-emerald-400"
                            )}
                          />
                          <div className="absolute right-3 pointer-events-none text-[#ececec]/40">
                            {isLoadingCity ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                            ) : (
                              <Building2 className="w-3.5 h-3.5" />
                            )}
                          </div>
                        </div>
                        {errors.city && (
                          <p className="text-red-400 text-[10px] font-mono mt-1">{errors.city}</p>
                        )}

                        {showCityDropdown && citySuggestions.length > 0 && (
                          <div className="absolute z-50 left-0 right-0 mt-1.5 bg-[#0e0e0e] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
                            <div className="p-2 text-[9px] uppercase tracking-widest text-[#ececec]/40 font-mono border-b border-[#1f1f1f]">
                              Select City / Regency in {stateInput || "Selected Province"} ({citySuggestions.length})
                            </div>
                            {citySuggestions.map((ct, idx) => (
                              <div
                                key={`${ct}-${idx}`}
                                onClick={() => handleSelectCity(ct)}
                                className="p-3 hover:bg-[#181818] cursor-pointer border-b border-[#181818] last:border-0 text-xs font-mono text-white transition-colors flex items-center justify-between"
                              >
                                <span>{ct}</span>
                                <ChevronRight className="w-3 h-3 text-[#ececec]/30" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Level 3: DISTRICT / KECAMATAN */}
                      <div className="relative" ref={districtRef}>
                        <div className="h-5 flex items-center justify-between mb-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-[#ececec]/50 font-mono whitespace-nowrap">
                            DISTRICT / KECAMATAN *
                          </label>
                        </div>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            placeholder="Type District (e.g. Coblong, Kebayoran Baru)"
                            value={districtInput}
                            onChange={(e) => handleDistrictInputChange(e.target.value)}
                            onFocus={() => fetchDistrictSuggestions(districtInput)}
                            className={cn(
                              "w-full h-11 bg-[#111111] p-3 pr-8 text-xs focus:outline-none rounded-xl transition-all font-mono",
                              errors.district
                                ? "border border-red-500 focus:border-red-500 text-red-100"
                                : "border border-[#1f1f1f] focus:border-emerald-400"
                            )}
                          />
                          <div className="absolute right-3 pointer-events-none text-[#ececec]/40">
                            {isLoadingDistrict ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </div>
                        </div>
                        {errors.district && (
                          <p className="text-red-400 text-[10px] font-mono mt-1">{errors.district}</p>
                        )}

                        {showDistrictDropdown && districtSuggestions.length > 0 && (
                          <div className="absolute z-50 left-0 right-0 mt-1.5 bg-[#0e0e0e] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
                            <div className="p-2 text-[9px] uppercase tracking-widest text-[#ececec]/40 font-mono border-b border-[#1f1f1f]">
                              Select District in {cityInput || "Selected City"} ({districtSuggestions.length})
                            </div>
                            {districtSuggestions.map((item, idx) => (
                              <div
                                key={`${item.id}-${idx}`}
                                onClick={() => handleSelectDistrict(item)}
                                className="p-3 hover:bg-[#181818] cursor-pointer border-b border-[#181818] last:border-0 text-xs font-mono text-white transition-colors flex items-center justify-between gap-2"
                              >
                                <div>
                                  <span className="font-bold text-white block">{item.district}</span>
                                  {item.city && (
                                    <span className="text-[10px] text-[#ececec]/60 block">{item.city}</span>
                                  )}
                                </div>
                                {item.postal_code && (
                                  <span className="bg-[#1f1f1f] text-emerald-400 font-mono text-[10px] px-2 py-0.5 rounded border border-[#2a2a2a] shrink-0 font-bold flex items-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5" /> {item.postal_code}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Level 4: POSTAL CODE (Read-only / Auto-filled from District) */}
                      <div>
                        <div className="h-5 flex items-center justify-between mb-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-[#ececec]/50 font-mono whitespace-nowrap">
                            POSTAL CODE *
                          </label>
                          {postalCodeInput && (
                            <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1 font-semibold shrink-0 whitespace-nowrap">
                              <Sparkles className="w-2.5 h-2.5 shrink-0" /> Locked
                            </span>
                          )}
                        </div>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            readOnly
                            placeholder="Auto-filled from District"
                            value={postalCodeInput}
                            className={cn(
                              "w-full h-11 bg-[#111111] p-3 pr-8 text-xs focus:outline-none rounded-xl transition-all font-mono select-none cursor-default",
                              errors.postalCode
                                ? "border border-red-500 text-red-100 placeholder:text-red-300/40"
                                : postalCodeInput
                                ? "border border-emerald-500/40 text-emerald-300 font-bold bg-[#141414]"
                                : "border border-[#1f1f1f] text-[#ececec]/40 placeholder:text-[#ececec]/30"
                            )}
                          />
                          <div className="absolute right-3 pointer-events-none text-[#ececec]/40">
                            {postalCodeInput ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Mail className="w-3.5 h-3.5 text-[#ececec]/30" />
                            )}
                          </div>
                        </div>
                        {errors.postalCode && (
                          <p className="text-red-400 text-[10px] font-mono mt-1">{errors.postalCode}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* 3-Tier International Hierarchy (State -> City -> Postal Code) */
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* State / Province / Region */}
                      <div className="relative" ref={stateRef}>
                        <div className="h-5 flex items-center justify-between mb-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-[#ececec]/50 font-mono whitespace-nowrap">
                            STATE / PROVINCE / REGION
                          </label>
                        </div>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            placeholder="State / Province / Region (e.g. California, Selangor)"
                            value={stateInput}
                            onChange={(e) => handleStateInputChange(e.target.value)}
                            onFocus={() => fetchStateSuggestions(stateInput)}
                            className={cn(
                              "w-full h-11 bg-[#111111] p-3 pr-8 text-xs focus:outline-none rounded-xl transition-all font-mono",
                              errors.state
                                ? "border border-red-500 focus:border-red-500 text-red-100"
                                : "border border-[#1f1f1f] focus:border-emerald-400"
                            )}
                          />
                          <div className="absolute right-3 pointer-events-none text-[#ececec]/40">
                            {isLoadingState ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </div>
                        </div>

                        {showStateDropdown && stateSuggestions.length > 0 && (
                          <div className="absolute z-50 left-0 right-0 mt-1.5 bg-[#0e0e0e] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
                            <div className="p-2 text-[9px] uppercase tracking-widest text-[#ececec]/40 font-mono border-b border-[#1f1f1f]">
                              Select State / Province in {currentCountryName} ({stateSuggestions.length})
                            </div>
                            {stateSuggestions.map((st, idx) => (
                              <div
                                key={`${st}-${idx}`}
                                onClick={() => handleSelectState(st)}
                                className="p-3 hover:bg-[#181818] cursor-pointer border-b border-[#181818] last:border-0 text-xs font-mono text-white transition-colors flex items-center justify-between"
                              >
                                <span>{st}</span>
                                <ChevronRight className="w-3 h-3 text-[#ececec]/30" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* City / Municipality */}
                      <div className="relative" ref={cityRef}>
                        <div className="h-5 flex items-center justify-between mb-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-[#ececec]/50 font-mono whitespace-nowrap">
                            CITY / MUNICIPALITY *
                          </label>
                        </div>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            placeholder="City / Municipality (e.g. Los Angeles, Petaling Jaya)"
                            value={cityInput}
                            onChange={(e) => handleCityInputChange(e.target.value)}
                            onFocus={() => fetchCitySuggestions(cityInput)}
                            className={cn(
                              "w-full h-11 bg-[#111111] p-3 pr-8 text-xs focus:outline-none rounded-xl transition-all font-mono",
                              errors.city
                                ? "border border-red-500 focus:border-red-500 text-red-100"
                                : "border border-[#1f1f1f] focus:border-emerald-400"
                            )}
                          />
                          <div className="absolute right-3 pointer-events-none text-[#ececec]/40">
                            {isLoadingCity ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                            ) : (
                              <Building2 className="w-3.5 h-3.5" />
                            )}
                          </div>
                        </div>
                        {errors.city && (
                          <p className="text-red-400 text-[10px] font-mono mt-1">{errors.city}</p>
                        )}

                        {showCityDropdown && citySuggestions.length > 0 && (
                          <div className="absolute z-50 left-0 right-0 mt-1.5 bg-[#0e0e0e] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
                            <div className="p-2 text-[9px] uppercase tracking-widest text-[#ececec]/40 font-mono border-b border-[#1f1f1f]">
                              Select City / Municipality in {stateInput || currentCountryName} ({citySuggestions.length})
                            </div>
                            {citySuggestions.map((ct, idx) => (
                              <div
                                key={`${ct}-${idx}`}
                                onClick={() => handleSelectCity(ct)}
                                className="p-3 hover:bg-[#181818] cursor-pointer border-b border-[#181818] last:border-0 text-xs font-mono text-white transition-colors flex items-center justify-between"
                              >
                                <span>{ct}</span>
                                <ChevronRight className="w-3 h-3 text-[#ececec]/30" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Postal / ZIP Code */}
                      <div>
                        <div className="h-5 flex items-center justify-between mb-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-[#ececec]/50 font-mono whitespace-nowrap">
                            POSTAL / ZIP CODE *
                          </label>
                        </div>
                        <input
                          type="text"
                          placeholder="Postal / Zip Code (e.g. 90001, 50088)"
                          value={postalCodeInput}
                          onChange={(e) => {
                            setPostalCodeInput(e.target.value);
                            setDestinationPostalCode(e.target.value.trim());
                            if (errors.postalCode) setErrors((prev) => ({ ...prev, postalCode: undefined }));
                          }}
                          className={cn(
                            "w-full h-11 bg-[#111111] p-3 text-xs focus:outline-none rounded-xl transition-all font-mono",
                            errors.postalCode
                              ? "border border-red-500 focus:border-red-500 text-red-100"
                              : "border border-[#1f1f1f] focus:border-emerald-400"
                          )}
                        />
                        {errors.postalCode && (
                          <p className="text-red-400 text-[10px] font-mono mt-1">{errors.postalCode}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Field 5: Street Address & Building Details (Textarea) */}
                  <div>
                    <div className="h-5 flex items-center mb-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-[#ececec]/50 font-mono whitespace-nowrap">
                        STREET ADDRESS & BUILDING / UNIT DETAILS *
                      </label>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Street name, building/house number, RT/RW, village/sub-district, and landmarks (e.g. 123 Main Street, Apt 4B, near Central Park)"
                      value={addressInput}
                      onChange={(e) => {
                        setAddressInput(e.target.value);
                        if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
                      }}
                      className={cn(
                        "w-full bg-[#111111] p-3 text-sm focus:outline-none rounded-xl transition-all",
                        errors.address
                          ? "border border-red-500 focus:border-red-500 text-red-100 placeholder:text-red-300/40"
                          : "border border-[#1f1f1f] focus:border-[#ececec]"
                      )}
                    />
                    {errors.address && (
                      <p className="text-red-400 text-[10px] font-mono mt-1">{errors.address}</p>
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

            {/* Step 2: Shipping Rates Selector */}
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
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono border",
                      currentStep === 2
                        ? "bg-white text-black border-white"
                        : "border-[#2a2a2a] text-[#ececec]/50"
                    )}
                  >
                    2
                  </div>
                  <h2 className="uppercase tracking-widest font-bold text-sm flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#ececec]/70" /> Shipping Method (
                    {countryInput === "ID" ? "Biteship Express" : "International Courier"})
                  </h2>
                </div>
                {currentStep > 2 && selectedRate && (
                  <span className="text-emerald-400 text-xs uppercase font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {selectedRate.courier_name}{" "}
                    {selectedRate.courier_service_name}
                  </span>
                )}
              </div>

              {currentStep === 2 && (
                <div className="p-6 space-y-4">
                  {isLoadingRates ? (
                    <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
                      <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
                      <p className="text-xs uppercase tracking-widest text-[#ececec]/80 font-mono font-medium">
                        Calculating rates for{" "}
                        {districtInput ? `${districtInput}, ` : ""}
                        {cityInput ? `${cityInput}, ` : ""}
                        {currentCountryName} (Postal: {destinationPostalCode || postalCodeInput || "—"})...
                      </p>
                    </div>
                  ) : shippingRates.length === 0 ? (
                    <div className="text-center py-8 space-y-4">
                      <p className="text-xs text-[#ececec]/50 uppercase tracking-widest">
                        No courier rates available for {cityInput ? `${cityInput}, ` : ""}
                        {currentCountryName} (Postal: {destinationPostalCode || postalCodeInput || "—"}).
                      </p>
                      <button
                        onClick={() =>
                          fetchShippingRates(
                            destinationPostalCode || postalCodeInput,
                            selectedAreaId,
                            selectedAreaName,
                            addressInput,
                            countryInput,
                            cityInput,
                            stateInput
                          )
                        }
                        className="border border-[#2a2a2a] text-xs uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-[#111111]"
                      >
                        Retry Fetching Rates
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-[11px] uppercase tracking-widest text-[#ececec]/50 font-mono mb-2">
                        DESTINATION:{" "}
                        <span className="text-emerald-400 font-bold">
                          {selectedAreaName ||
                            `${districtInput ? `${districtInput}, ` : ""}${cityInput ? `${cityInput}, ` : ""}${currentCountryName} (POSTAL: ${destinationPostalCode || postalCodeInput || "—"})`}
                        </span>
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
                                {formatPrice(rate.price)}
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
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono border",
                      currentStep === 3
                        ? "bg-white text-black border-white"
                        : "border-[#2a2a2a] text-[#ececec]/50"
                    )}
                  >
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
                      Supports instant payment via International Credit / Debit Cards (Visa, Mastercard, JCB), QRIS, Bank Virtual Accounts, and e-Wallets.
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
                      <>Pay Now • {formatPrice(grandTotal)}</>
                    )}
                  </button>

                  {currency === "USD" && (
                    <p className="text-[10px] text-center text-[#ececec]/40 font-mono">
                      * Transaction billed in IDR via Midtrans Gateway: {formatRupiah(grandTotal)} (1 USD ≈ {formatRupiah(exchangeRate)})
                    </p>
                  )}
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
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-[#1f1f1f] space-y-3 text-xs">
                <div className="flex justify-between text-[#ececec]/60 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="font-mono text-[#ececec]">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-[#ececec]/60 uppercase tracking-widest">
                  <span>Shipping ({selectedRate?.courier_name || "Courier"})</span>
                  <span className="font-mono text-emerald-400">
                    {selectedRate ? formatPrice(selectedRate.price) : "Select in Step 2"}
                  </span>
                </div>

                <div className="border-t border-[#1f1f1f] pt-3 flex justify-between uppercase tracking-widest font-bold text-sm">
                  <span>Grand Total</span>
                  <div className="text-right">
                    <span className="font-mono text-emerald-400 block">
                      {formatPrice(grandTotal)}
                    </span>
                    {currency === "USD" && (
                      <span className="text-[10px] font-mono text-[#ececec]/40 block font-normal">
                        ≈ {formatRupiah(grandTotal)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}