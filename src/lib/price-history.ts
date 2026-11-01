/**
 * 10-JITAL — Logique métier : prix et historique des prix
 * ⚠️ Données de démonstration uniquement. Aucun prix réel n'est suivi.
 * Aucun appel API externe n'est effectué.
 */

import type { CurrencyCode } from "./currency";

export interface PricePoint {
  date: string; // ISO date
  price: number; // en MAD
  currency: CurrencyCode;
  source: "demo" | "affiliation" | "scraping";
}

export interface PriceHistory {
  productId: string;
  productName: string;
  currentPrice: number;
  currentCurrency: CurrencyCode;
  history: PricePoint[];
  lastUpdated: string;
  isRealTime: boolean; // false tant qu'aucune source réelle n'est connectée
}

/**
 * Génère un historique de prix fictif à des fins de démonstration uniquement.
 * NE JAMAIS simuler de vraies baisses de prix ou de ventes.
 */
export function generateDemoPriceHistory(
  productId: string,
  productName: string,
  basePrice: number,
  currency: CurrencyCode
): PriceHistory {
  const history: PricePoint[] = [];
  const today = new Date();

  // Génère 30 jours d'historique fictif (prix constant, pas de baisse simulée)
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    history.push({
      date: date.toISOString().split("T")[0],
      price: basePrice, // prix constant, aucune variation simulée
      currency,
      source: "demo",
    });
  }

  return {
    productId,
    productName,
    currentPrice: basePrice,
    currentCurrency: currency,
    history,
    lastUpdated: today.toISOString(),
    isRealTime: false, // ⚠️ Pas de source réelle connectée
  };
}

/**
 * Vérifie si une alerte de prix est déclenchée (prix actuel <= prix cible).
 * Lecture seule, aucune modification de prix.
 */
export function checkAlertTriggered(
  currentPrice: number,
  targetPrice: number
): boolean {
  return currentPrice <= targetPrice;
}

/**
 * Formate un historique de prix pour l'affichage (graphique ou tableau).
 * Retourne les points les plus récents d'abord.
 */
export function getFormattedHistory(
  history: PricePoint[],
  limit: number = 30
): PricePoint[] {
  return [...history]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}