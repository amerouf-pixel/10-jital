"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DEMO_PRODUCTS } from "@/lib/demo-data";
import { CATALOG_OVERRIDES } from "@/components/products/ProductCard";
import { useCurrency } from "@/context/CurrencyContext";

function ProductDetailContent() {
  const params = useParams();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : String(rawId || "prod-001");

  const demoList: any[] = Array.isArray(DEMO_PRODUCTS) ? DEMO_PRODUCTS : [];
  const fromDemo = demoList.find((p) => String(p.id) === String(id));
  const preset = CATALOG_OVERRIDES[id];

  const rawPrice = Number(fromDemo?.price ?? fromDemo?.priceEur ?? fromDemo?.price_eur ?? 0);
  const priceEur = rawPrice > 0 ? rawPrice : (preset?.priceEur ?? 59.99);

  const product = {
    id,
    name: preset?.name || fromDemo?.name || fromDemo?.title || `Produit ${id}`,
    category: preset?.category || fromDemo?.category || "Sélection 10-JITAL",
    priceEur,
    image: preset?.image || fromDemo?.image || fromDemo?.imageUrl || fromDemo?.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    description: preset?.description || fromDemo?.description || "Produit sélectionné par 10-JITAL.",
    longDescription: preset?.longDescription || fromDemo?.longDescription || fromDemo?.description || "Ce produit fait partie de la sélection officielle 10-JITAL avec suivi de prix et disponibilité en direct.",
    features: preset?.features || [
      "Sélectionné par le radar de tendances 10-JITAL",
      "Rapport qualité / prix vérifié",
      "Expédition rapide et garantie constructeur",
      "Conversion automatique multi-devises"
    ],
    affiliateUrl: fromDemo?.affiliateUrl || fromDemo?.affiliate_url || preset?.affiliateUrl || "https://www.amazon.fr"
  };

  let formattedPrice = `${product.priceEur.toFixed(2)} EUR`;
  try {
    const currencyCtx: any = useCurrency?.();
    if (currencyCtx?.formatPrice) {
      formattedPrice = currencyCtx.formatPrice(product.priceEur);
    } else if (currencyCtx?.currency) {
      const curr = String(currencyCtx.currency).toUpperCase();
      const rates: Record<string, number> = { EUR: 1, MAD: 10.85, USD: 1.08, GBP: 0.85, CAD: 1.48 };
      const rate = rates[curr] || 1;
      formattedPrice = `${(product.priceEur * rate).toFixed(2)} ${curr}`;
    }
  } catch {
    formattedPrice = `${product.priceEur.toFixed(2)} EUR`;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="text-sm text-gray-400 hover:text-violet-400 transition">
          ← Accueil
        </Link>
        <span className="text-gray-600">/</span>
        <Link href="/shop" className="text-sm text-violet-400 hover:text-violet-300 transition">
          Boutique 10-JITAL
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-[#0b0d17] border border-violet-500/25 rounded-3xl p-6 sm:p-10 shadow-2xl">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#121626] flex items-center justify-center">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <span className="absolute top-4 right-4 bg-violet-950/90 border border-violet-500/40 text-violet-200 text-xs font-semibold px-3.5 py-1.5 rounded-full backdrop-blur-sm">
            {product.category}
          </span>
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-violet-400 block mb-2">
              Réf : {product.id.toUpperCase()}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
              {product.name}
            </h1>

            <p className="text-gray-300 text-base leading-relaxed mb-6">
              {product.longDescription}
            </p>

            <div className="mb-8 bg-[#111424] border border-white/5 rounded-2xl p-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-3">
                Caractéristiques principales
              </h2>
              <ul className="space-y-2.5">
                {product.features.map((feat: string, idx: number) => (
                  <li key={idx} className="flex items-start text-sm text-gray-300">
                    <span className="text-cyan-400 font-bold mr-2.5">✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-gray-400 block">Meilleur prix détecté</span>
              <span className="text-3xl font-extrabold text-cyan-400">
                {formattedPrice}
              </span>
              <span className="text-xs text-gray-500 block mt-1">
                Prix de référence : {product.priceEur.toFixed(2)} EUR ( ≈ {(product.priceEur * 10.85).toFixed(0)} MAD )
              </span>
            </div>

            <a
              href={product.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-violet-600 hover:bg-violet-500 text-white font-bold px-7 py-4 rounded-xl transition shadow-lg shadow-violet-600/30"
            >
              Acheter / Voir l&apos;offre →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <main className="min-h-screen bg-[#05050a] text-white py-12 px-4 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="max-w-5xl mx-auto py-20 text-center text-violet-400 animate-pulse">
            Chargement de la fiche produit…
          </div>
        }
      >
        <ProductDetailContent />
      </Suspense>
    </main>
  );
}