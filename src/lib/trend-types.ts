/**
 * 10-JITAL — JITAL TREND RADAR
 * Types pour les observations de tendances.
 *
 * ⚠️ Aucune donnée commerciale n'est inventée.
 * Aucune clé API n'est requise ni exposée.
 * Les tendances sont stockées localement dans data/trends.json.
 */

export type TrendCategory =
  | "digital-products"
  | "ebooks"
  | "print-on-demand"
  | "affiliation"
  | "physical-accessories"
  | "creator-tools"
  | "software"
  | "other";

export interface TrendObservation {
  id: string;
  keyword: string;
  category: TrendCategory;
  market: string;
  value: number | null;
  source: "user" | "system" | "external";
  verified: boolean;
  observedAt: string;
  note?: string;
}

export interface TrendHistory {
  keyword: string;
  category: TrendCategory;
  market: string;
  observations: TrendObservation[];
  firstObserved: string | null;
  lastObserved: string | null;
  observationCount: number;
  freshness: "fresh" | "stale" | "empty";
}

export interface TrendInput {
  keyword: string;
  category: TrendCategory;
  market: string;
  value?: number | null;
  source?: "user" | "system" | "external";
  verified?: boolean;
}

const CATEGORY_LABELS: Record<TrendCategory, string> = {
  "digital-products": "Produits numériques",
  ebooks: "E-books et livres",
  "print-on-demand": "Impression à la demande",
  affiliation: "Affiliation",
  "physical-accessories": "Accessoires et produits physiques",
  "creator-tools": "Outils pour créateurs",
  software: "Logiciels et applications",
  other: "Autres niches",
};

export function getTrendCategories(): { value: TrendCategory; label: string }[] {
  return Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value: value as TrendCategory,
    label,
  }));
}

export function generateTrendId(): string {
  return `trend-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * FRESHNESS_THRESHOLD_HOURS : une donnée est considérée "fresh" si elle a moins de 24h.
 */
export const FRESHNESS_THRESHOLD_HOURS = 24;

export function isFresh(observedAt: string): boolean {
  const diffHours =
    (Date.now() - new Date(observedAt).getTime()) / (1000 * 60 * 60);
  return diffHours <= FRESHNESS_THRESHOLD_HOURS;
}

export function trendFreshness(observations: TrendObservation[]): "fresh" | "stale" | "empty" {
  if (observations.length === 0) return "empty";
  const latest = observations.reduce((max, o) =>
    new Date(o.observedAt).getTime() > new Date(max.observedAt).getTime() ? o : max
  );
  return isFresh(latest.observedAt) ? "fresh" : "stale";
}
