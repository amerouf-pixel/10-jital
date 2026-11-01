"use client";

import { useState, useEffect, useCallback } from "react";
import { CURRENCIES, DEFAULT_CURRENCY, formatAmount, getStoredCurrency, setStoredCurrency, type CurrencyCode } from "@/lib/currency";

interface CurrencySelectorProps {
  className?: string;
}

export default function CurrencySelector({ className }: CurrencySelectorProps) {
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCurrency(getStoredCurrency());
  }, []);

  const handleSelect = useCallback((code: CurrencyCode) => {
    setCurrency(code);
    setStoredCurrency(code);
    setIsOpen(false);
  }, []);

  const cur = CURRENCIES.find((c) => c.code === currency);

  return (
    <div className={`relative inline-block ${className ?? ""}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm font-medium text-violet-400 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
        aria-label="Sélecteur de devise"
        aria-expanded={isOpen}
      >
        <span className="font-bold">{cur?.symbol ?? ""}</span>
        <span>{cur?.label ?? ""}</span>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M19 9l-7 7-7-7" : "M19 9l-7 7-7-7"} />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-lg py-2">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => handleSelect(c.code)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                currency === c.code
                  ? "bg-violet-600/20 text-violet-400 font-semibold"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="font-bold">{c.symbol}</span>
              <span>{c.label}</span>
              {currency === c.code && (
                <svg className="ml-auto w-5 h-5 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
