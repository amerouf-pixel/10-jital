"use client";

import { useCurrency } from "@/context/CurrencyContext";
import { useState } from "react";

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  const currencies = [
    { code: "MAD", symbol: "د.م.", name: "Dirham" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "USD", symbol: "$", name: "Dollar US" },
    { code: "GBP", symbol: "£", name: "Livre Sterling" },
  ];

  const currentCurrency = currencies.find((c) => c.code === currency);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2 transition">
        <span className="text-lg">{currentCurrency?.symbol}</span>
        <span>{currency}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50">
          {currencies.map((curr) => (
            <button
              key={curr.code}
              onClick={() => {
                setCurrency(curr.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 hover:bg-slate-700 transition flex items-center gap-2 ${
                currency === curr.code ? "bg-emerald-600" : ""
              }`}
            >
              <span className="text-lg">{curr.symbol}</span>
              <div>
                <div className="font-semibold text-white">{curr.code}</div>
                <div className="text-xs text-slate-400">{curr.name}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}