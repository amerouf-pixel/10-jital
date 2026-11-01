"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  exchangeRates: Record<string, number>;
  formatAmount?: (amount: number) => string;
  convertPrice?: (amount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState("MAD");

  const exchangeRates: Record<string, number> = {
    MAD: 1,
    EUR: 0.095,
    USD: 0.1,
    GBP: 0.079,
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, exchangeRates }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    return {
      currency: "MAD",
      setCurrency: () => {},
      exchangeRates: {
        MAD: 1,
        EUR: 0.095,
        USD: 0.1,
        GBP: 0.079,
      },
      formatAmount: (amount: number) => `${amount} MAD`,
      convertPrice: (amount: number) => amount,
    };
  }
  return context;
}