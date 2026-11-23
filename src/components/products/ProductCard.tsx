"use client";

import React from "react";
import Link from "next/link";
import { useCurrency } from "@/context/CurrencyContext";
import { toShortAffiliateLink } from "@/utils/affiliate";
import SocialShareButtons from "@/components/products/SocialShareButtons";

export const CATALOG_OVERRIDES: Record<string, {
  name: string;
  priceEur: number;
  image: string;
  category: string;
  description: string;
  longDescription: string;
  features: string[];
  affiliateUrl: string;
}> = {
  "prod-001": {
    name: "Montre connectée SportPro",
    priceEur: 59.99,
    category: "Électronique",
    description: "Montre connectée étanche avec suivi cardiaque, GPS intégré et autonomie 7 jours.",
    longDescription: "La montre connectée SportPro accompagne toutes vos séances d'entraînement et votre quotidien. Dotée d'un écran AMOLED haute luminosité, d'un capteur cardio et SpO2 en continu, ainsi que d'un GPS multi-systèmes, elle offre jusqu'à 7 jours d'autonomie.",
    features: [
      "Étanche IP68 (jusqu'à 50 mètres)",
      "Suivi cardiaque 24h/24, SpO2 et analyse du sommeil",
      "GPS multi-bandes intégré + 100 modes sportifs",
      "Autonomie longue durée : 7 jours"
    ],
    image: "https://m.media-amazon.com/images/I/718H-NJ12UL._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.fr/dp/B0FTDRH6G4?tag=10jital-21"
  },
  "prod-002": {
    name: "Veste Duveteuse Thermo-Active",
    priceEur: 89.90,
    category: "Mode & Hiver",
    description: "Isolation thermique avancée, tissu déperlant coupe-vent et confort haute montagne.",
    longDescription: "Conçue pour affronter les températures hivernales, la Veste Duveteuse Thermo-Active combine une isolation thermique haute densité à une membrane extérieure déperlante et coupe-vent tout en restant ultra-légère.",
    features: [
      "Isolation thermique haute densité jusqu'à -15°C",
      "Membrane extérieure déperlante et coupe-vent",
      "Capuche ajustable et poignets élastiqués",
      "Poches latérales zippées doublées polaire"
    ],
    image: "https://m.media-amazon.com/images/I/71aDOzgc-EL._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.fr/dp/B0CJBWNQKR?tag=10jital-21"
  },
  "prod-003": {
    name: "Bottes de Neige Antidérapantes",
    priceEur: 64.50,
    category: "Chaussures",
    description: "Doublure polaire intégrale, semelle crantée antidérapante et extérieur imperméable.",
    longDescription: "Marchez en toute sécurité sur la neige et les sols glacés grâce aux Bottes de Neige Fourrées Antidérapantes. Leur doublure thermique conserve la chaleur tandis que la semelle crantée assure une adhérence maximale.",
    features: [
      "Doublure intérieure fourrée ultra-chaude",
      "Semelle en caoutchouc cranté anti-verglas",
      "Extérieur 100% imperméable",
      "Maintien renforcé de la cheville"
    ],
    image: "https://m.media-amazon.com/images/I/61jQjUifDeL._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.fr/dp/B0H7X3ND5C?tag=10jital-21"
  },
  "prod-004": {
    name: "Casque Sans Fil ProANC",
    priceEur: 74.90,
    category: "Audio",
    description: "Réduction de bruit active hybride, 30h d'autonomie et coussinets cuir mémoire.",
    longDescription: "Plongez dans votre musique sans distraction grâce à la réduction de bruit active hybride ProANC. Ses haut-parleurs de 40 mm délivrent des basses profondes avec 30 heures d'autonomie.",
    features: [
      "Réduction de bruit active (ANC) + mode Transparence",
      "30 heures d'autonomie avec charge rapide USB-C",
      "Coussinets à mémoire de forme ultra-confortables",
      "Bluetooth 5.3 multipoint"
    ],
    image: "https://m.media-amazon.com/images/I/61m7WdZi-3L._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.fr/dp/B0FX4YH3C1?tag=10jital-21"
  }
};

export function ProductCard(props: any) {
  const item = props.product || props;
  const id = String(item?.id || "prod-001");
  const useOverride = props.useCatalogOverride ?? true;
  const override = useOverride ? CATALOG_OVERRIDES[id] : undefined;

  const name = override?.name || item?.name || item?.title || "Produit 10-JITAL";
  const category = override?.category || item?.category || "Tendance";
  const description = override?.description || item?.description || "Produit sélectionné par 10-JITAL.";
  const rawPrice = Number(item?.price ?? item?.priceEur ?? item?.price_eur ?? 0);
  const priceEur = rawPrice > 0 ? rawPrice : (override?.priceEur ?? 59.99);
  const image = override?.image || item?.image || item?.imageUrl || item?.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80";

  // Aucun lien long ne s'affiche jamais : normalisation → /dp/{ASIN}?tag=10jital-21
  const affiliateUrl = toShortAffiliateLink(
    override?.affiliateUrl || item?.affiliateUrl || item?.affiliate_url || item?.merchantUrl || ""
  );

  let formattedPrice = `${priceEur.toFixed(2)} EUR`;
  try {
    const currencyCtx: any = useCurrency?.();
    if (currencyCtx?.formatPrice) {
      formattedPrice = currencyCtx.formatPrice(priceEur);
    } else if (currencyCtx?.currency) {
      const curr = String(currencyCtx.currency).toUpperCase();
      const rates: Record<string, number> = { EUR: 1, MAD: 10.85, USD: 1.08, GBP: 0.85, CAD: 1.48 };
      const rate = rates[curr] || 1;
      formattedPrice = `${(priceEur * rate).toFixed(0)} ${curr}`;
    }
  } catch {
    formattedPrice = `${priceEur.toFixed(2)} EUR`;
  }

  return (
    <div className="group bg-[#0b0d17] border border-violet-500/20 hover:border-violet-500/60 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 flex flex-col justify-between transition-all duration-300 shadow-lg hover:shadow-violet-900/20">
      <div>
        <Link href={`/shop/${id}`} className="block relative h-32 sm:h-52 w-full rounded-lg sm:rounded-xl overflow-hidden bg-[#121626] mb-2.5 sm:mb-4">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <span className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 bg-violet-950/90 border border-violet-500/40 text-violet-200 text-[10px] sm:text-xs font-medium px-2 py-0.5 sm:px-3 sm:py-1 rounded-full backdrop-blur-sm">
            {category}
          </span>
        </Link>

        <Link href={`/shop/${id}`}>
          <h3 className="text-xs sm:text-lg font-bold text-white group-hover:text-violet-400 transition-colors mb-1 sm:mb-2 line-clamp-1 sm:line-clamp-2">
            {name}
          </h3>
        </Link>

        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
          {description}
        </p>

        {affiliateUrl && (
          <SocialShareButtons url={affiliateUrl} title={name} className="mb-4" />
        )}
      </div>

      <div className="pt-2.5 sm:pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
        <span className="text-sm sm:text-lg font-extrabold text-cyan-400">
          {formattedPrice}
        </span>

        <Link
          href={`/shop/${id}`}
          className="bg-violet-600 hover:bg-violet-500 text-white text-[11px] sm:text-sm font-semibold px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-center transition-colors"
        >
          Voir l&apos;offre
        </Link>
      </div>
    </div>
  );
}

export default ProductCard;