"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Currency = "IDR" | "USD";

// Exchange Rate Reference: 1 USD = Rp 15.800
export const USD_EXCHANGE_RATE = 15800;

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  toggleCurrency: () => void;
  rate: number;
  exchangeRate: number;
  formatPrice: (amountInIdr: number | string | null | undefined) => string;
  convertToUsd: (amountInIdr: number) => number;
  convertToIdr: (amountInUsd: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("IDR");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("mantra_currency") as Currency | null;
    if (saved === "IDR" || saved === "USD") {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    if (typeof window !== "undefined") {
      localStorage.setItem("mantra_currency", newCurrency);
    }
  };

  const toggleCurrency = () => {
    const next = currency === "IDR" ? "USD" : "IDR";
    setCurrency(next);
  };

  const convertToUsd = (amountInIdr: number): number => {
    return Number((amountInIdr / USD_EXCHANGE_RATE).toFixed(2));
  };

  const convertToIdr = (amountInUsd: number): number => {
    return Math.round(amountInUsd * USD_EXCHANGE_RATE);
  };

  const formatPrice = (amountInIdr: number | string | null | undefined): string => {
    if (amountInIdr === null || amountInIdr === undefined || amountInIdr === "") {
      return currency === "USD" ? "$0.00" : "Rp 0";
    }

    const num = typeof amountInIdr === "string" ? parseFloat(amountInIdr) : Number(amountInIdr);
    if (isNaN(num)) {
      return currency === "USD" ? "$0.00" : "Rp 0";
    }

    if (currency === "USD") {
      const usdVal = num / USD_EXCHANGE_RATE;
      return `$${usdVal.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    return `Rp ${Math.round(num).toLocaleString("id-ID")}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        toggleCurrency,
        rate: USD_EXCHANGE_RATE,
        exchangeRate: USD_EXCHANGE_RATE,
        formatPrice,
        convertToUsd,
        convertToIdr,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Fallback if rendered outside CurrencyProvider
    return {
      currency: "IDR",
      setCurrency: () => {},
      toggleCurrency: () => {},
      rate: USD_EXCHANGE_RATE,
      exchangeRate: USD_EXCHANGE_RATE,
      formatPrice: (amount) => {
        const num = Number(amount) || 0;
        return `Rp ${Math.round(num).toLocaleString("id-ID")}`;
      },
      convertToUsd: (amount) => Number((amount / USD_EXCHANGE_RATE).toFixed(2)),
      convertToIdr: (amount) => Math.round(amount * USD_EXCHANGE_RATE),
    };
  }
  return context;
}
