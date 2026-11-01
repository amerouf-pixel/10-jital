"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrency } from "@/context/CurrencyContext";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/shop", label: "Boutique" },
  { href: "/blog", label: "Blog" },
  { href: "/tendances", label: "Tendances" },
  { href: "/prix", label: "Prix" },
  { href: "/alertes", label: "Alertes" },
  { href: "/niche-detector", label: "Niche Detector" },
  { href: "/maps-scraper", label: "Maps Scraper" },
  { href: "/opportunity", label: "Opportunity" },
  { href: "/studio", label: "Studio" },
];

const CURRENCIES = [
  { code: "MAD", label: "د.م. MAD (Dirham)" },
  { code: "EUR", label: "€ EUR (Euro)" },
  { code: "USD", label: "$ USD (Dollar)" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  let currentCurrency = "MAD";
  let setCurrencyFn: ((c: any) => void) | null = null;
  try {
    const ctx: any = useCurrency?.();
    if (ctx?.currency) currentCurrency = String(ctx.currency).toUpperCase();
    if (ctx?.setCurrency) setCurrencyFn = ctx.setCurrency;
  } catch {}

  return (
    <header className="sticky top-0 z-50 bg-[#05050a]/95 backdrop-blur-md border-b border-violet-500/20">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Ligne principale : Logo + Navigation Desktop + Sélecteur Devise + Bouton Menu Mobile */}
        <div className="flex items-center justify-between h-16">
          {/* Logo 10JITAL mis en valeur sur mobile et desktop */}
          <Link href="/" className="flex items-center gap-1.5 shrink-0 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-md shadow-violet-600/30">
              <span className="text-white font-black text-sm sm:text-base tracking-tighter">10</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                10
              </span>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 drop-shadow-[0_0_12px_rgba(139,92,246,0.5)]">
                JITAL
              </span>
            </div>
          </Link>

          {/* Liens Desktop */}
          <nav className="hidden xl:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    active
                      ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions à droite : Devise + Burger Mobile */}
          <div className="flex items-center gap-2">
            <select
              aria-label="Choisir la devise"
              value={currentCurrency}
              onChange={(e) => setCurrencyFn && setCurrencyFn(e.target.value)}
              className="bg-[#0d1021] border border-violet-500/30 text-white text-xs font-semibold rounded-xl px-2.5 py-2 focus:outline-none focus:border-violet-400"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-[#0b0d17] text-white">
                  {c.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="xl:hidden inline-flex items-center justify-center p-2 rounded-xl bg-violet-600/15 border border-violet-500/30 text-violet-300 hover:text-white hover:bg-violet-600/25 transition"
              aria-label="Ouvrir le menu"
            >
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Barre d'accès rapide horizontale défilable sur mobile */}
        <div className="xl:hidden flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar border-t border-white/5">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition ${
                  active
                    ? "bg-violet-600 text-white shadow-sm shadow-violet-600/40"
                    : "bg-[#0d1021] text-gray-300 border border-white/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Menu déroulant Mobile plein */}
      {menuOpen && (
        <div className="xl:hidden bg-[#080912] border-b border-violet-500/20 px-4 pt-2 pb-4 space-y-1">
          <div className="grid grid-cols-2 gap-2">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                    active
                      ? "bg-violet-600/25 text-violet-200 border border-violet-500/40"
                      : "bg-[#0d1021] text-gray-300 hover:text-white"
                  }`}
                >
                  <span>{link.label}</span>
                  <span className="text-violet-400">→</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}