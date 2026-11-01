"use client";

import Link from "next/link";
import { CURRENCIES, DEFAULT_CURRENCY, formatAmount, getStoredCurrency, setStoredCurrency, type CurrencyCode } from "@/lib/currency";
import { useState, useEffect } from "react";

export default function Footer() {
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  useEffect(() => {
    setCurrency(getStoredCurrency());
  }, []);

  const handleCurrencyChange = (code: CurrencyCode) => {
    setCurrency(code);
    setStoredCurrency(code);
  };

  const [currentYear, setCurrentYear] = useState(2024);
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-gray-800 bg-black pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Logo & description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-violet-500 tracking-tight">10JITAL</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Plateforme professionnelle avec boutique, blog, détection de tendances,
              suivi des prix et alertes. Données de démonstration uniquement.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">Devise :</span>
              <select
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value as CurrencyCode)}
                className="bg-gray-900 border border-gray-700 text-white text-xs rounded px-2 py-1 focus:ring-2 focus:ring-violet-500 outline-none"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">Navigation</h3>
            <div className="space-y-2">
              <Link href="/" className="text-gray-400 text-sm hover:text-violet-400 transition-colors">Accueil</Link>
              <Link href="/shop" className="text-gray-400 text-sm hover:text-violet-400 transition-colors">Boutique</Link>
              <Link href="/blog" className="text-gray-400 text-sm hover:text-violet-400 transition-colors">Blog</Link>
              <Link href="/trends" className="text-gray-400 text-sm hover:text-violet-400 transition-colors">Tendances</Link>
              <Link href="/prices" className="text-gray-400 text-sm hover:text-violet-400 transition-colors">Prix</Link>
              <Link href="/alerts" className="text-gray-400 text-sm hover:text-violet-400 transition-colors">Alertes</Link>
            </div>
          </div>

          {/* Informations */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">Informations</h3>
            <div className="space-y-2 text-gray-400 text-sm">
              <p>⚠️ Données de démonstration uniquement</p>
              <p>Aucun achat réel n'est possible</p>
              <p>Aucune donnée personnelle n'est collectée</p>
              <p>Prix non actualisés en temps réel</p>
              <p>Sources d'affiliation : aucune activée</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            {currentYear} 10-JITAL — Tous droits réservés.
          </p>
          <div className="flex gap-4 text-gray-500 text-xs">
            <span>MAD • EUR • USD</span>
            <span>Données fictives</span>
          </div>
        </div>
      </div>
    </footer>
  );
}