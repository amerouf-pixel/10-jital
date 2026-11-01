"use client";

import React from "react";
import Link from "next/link";
import { useCurrency } from "@/context/CurrencyContext";

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
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    affiliateUrl: "https://www.amazon.fr/s?k=montre+connectee+sport+gps"
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
    image: "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=900&q=80",
    affiliateUrl: "https://www.amazon.fr/s?k=doudoune+veste+thermique+hiver"
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
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    affiliateUrl: "https://www.amazon.fr/s?k=bottes+de+neige+fourrees+antiderapantes"
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
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    affiliateUrl: "https://www.amazon.fr/s?k=casque+bluetooth+reduction+de+bruit"
  },
  "prod-005": {
    name: "Enceinte Étanche Pulse 360",
    priceEur: 49.90,
    category: "Audio",
    description: "Enceinte portable étanche IPX7, son stéréo 360° puissant et 20h d'autonomie.",
    longDescription: "Emportez votre musique partout avec l'enceinte Pulse 360. Certifiée IPX7, elle résiste à l'eau et diffuse un son riche à 360° pendant 20 heures.",
    features: [
      "Étanchéité certifiée IPX7",
      "Son immersif 360° avec basses renforcées",
      "20 heures d'autonomie",
      "Appairage stéréo sans fil (TWS)"
    ],
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80",
    affiliateUrl: "https://www.amazon.fr/s?k=enceinte+bluetooth+etanche+ipx7"
  },
  "prod-006": {
    name: "Clavier Mécanique RGB Gamer",
    priceEur: 69.00,
    category: "Gaming & Tech",
    description: "Switchs mécaniques ultra-réactifs, rétroéclairage RGB personnalisable et châssis alu.",
    longDescription: "Conçu pour la performance e-sport et le confort de frappe, ce clavier mécanique format compact 75% intègre des switchs linéaires lubrifiés, un châssis en aluminium anodisé et une connexion sans fil tri-mode.",
    features: [
      "Switchs mécaniques hot-swappable haute réactivité",
      "Rétroéclairage RGB 16,8 millions de couleurs",
      "Triple connexion : Bluetooth 5.1, 2.4 GHz et USB-C",
      "Batterie haute capacité 4000 mAh"
    ],
    image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=900&q=80",
    affiliateUrl: "https://www.amazon.fr/s?k=clavier+mecanique+rgb+sans+fil"
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

  let formattedPrice = `${priceEur.toFixed(0)} EUR`;
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

        <p className="text-[11px] sm:text-sm text-gray-400 line-clamp-2 mb-2.5 sm:mb-4 leading-snug">
          {description}
        </p>
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