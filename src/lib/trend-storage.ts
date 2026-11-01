/**
 * 10-JITAL — Stockage persistant des observations de tendances (côté serveur uniquement)
 * Lit et écrit dans data/trends.json via le module Node.js fs.
 * Ce fichier ne doit être importé que par des API routes ou des Server Components.
 *
 * ⚠️ Attention : le stockage par fichiers JSON fonctionne en développement et
 * sur des serveurs avec système de fichiers persistant. Sur Vercel/serverless,
 * les écritures locales ne sont pas persistantes entre les déploiements.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import type {
  TrendObservation,
  TrendHistory,
  TrendInput,
} from "./trend-types";
import { generateTrendId, trendFreshness } from "./trend-types";

const DATA_DIR = join(process.cwd(), "data");
const TRENDS_FILE = join(DATA_DIR, "trends.json");

export interface TrendsData {
  observations: TrendObservation[];
  metadata: {
    source: string;
    note: string;
    lastUpdated: string;
    version: string;
  };
}

/**
 * Lit toutes les observations depuis le fichier JSON.
 */
export function readTrends(): TrendObservation[] {
  try {
    if (!existsSync(TRENDS_FILE)) {
      return [];
    }
    const raw = readFileSync(TRENDS_FILE, "utf-8");
    const data: TrendsData = JSON.parse(raw);
    return data.observations ?? [];
  } catch {
    return [];
  }
}

/**
 * Lit le fichier de données complet.
 */
export function readTrendsData(): TrendsData {
  try {
    if (!existsSync(TRENDS_FILE)) {
      return {
        observations: [],
        metadata: {
          source: "local",
          note: "Observations de tendances locales uniquement. Aucune donnée commerciale externe.",
          lastUpdated: new Date().toISOString(),
          version: "1.0",
        },
      };
    }
    const raw = readFileSync(TRENDS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {
      observations: [],
      metadata: {
        source: "local",
        note: "Observations de tendances locales uniquement. Aucune donnée commerciale externe.",
        lastUpdated: new Date().toISOString(),
        version: "1.0",
      },
    };
  }
}

/**
 * Écrit la liste complète des observations dans le fichier JSON.
 */
export function writeTrends(observations: TrendObservation[]): void {
  try {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    const data: TrendsData = {
      observations,
      metadata: {
        source: "local",
        note: "Observations de tendances locales uniquement. Aucune donnée commerciale externe.",
        lastUpdated: new Date().toISOString(),
        version: "1.0",
      },
    };
    writeFileSync(TRENDS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Erreur lors de l'écriture des tendances:", error);
    throw new Error("Impossible d'écrire les tendances.");
  }
}

/**
 * Enregistre une nouvelle observation de tendance.
 * Évite les doublons exacts (même mot-clé, catégorie, marché, source, date).
 */
export function recordTrendObservation(input: TrendInput): TrendObservation {
  const existing = readTrends();

  // Prévention des doublons exacts
  const isDuplicate = existing.some(
    (o) =>
      o.keyword.toLowerCase() === input.keyword.toLowerCase().trim() &&
      o.category === input.category &&
      o.market.toLowerCase() === input.market.toLowerCase().trim() &&
      o.source === (input.source ?? "user")
  );

  if (isDuplicate) {
    throw new Error("Une observation identique existe déjà pour ce mot-clé.");
  }

  const observation: TrendObservation = {
    id: generateTrendId(),
    keyword: input.keyword.trim(),
    category: input.category,
    market: input.market.trim(),
    value: input.value ?? null,
    source: input.source ?? "user",
    verified: input.verified ?? false,
    observedAt: new Date().toISOString(),
  };

  writeTrends([observation, ...existing]);
  return observation;
}

/**
 * Construit l'historique d'un mot-clé à partir des observations.
 */
export function buildTrendHistory(keyword: string): TrendHistory {
  const all = readTrends();
  const observations = all
    .filter((o) => o.keyword.toLowerCase() === keyword.toLowerCase().trim())
    .sort(
      (a, b) =>
        new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime()
    );

  if (observations.length === 0) {
    return {
      keyword,
      category: "other",
      market: "",
      observations: [],
      firstObserved: null,
      lastObserved: null,
      observationCount: 0,
      freshness: "empty",
    };
  }

  const category = observations[0].category;
  const market = observations[0].market;
  const firstObserved = observations[0].observedAt;
  const lastObserved = observations[observations.length - 1].observedAt;

  return {
    keyword,
    category,
    market,
    observations,
    firstObserved,
    lastObserved,
    observationCount: observations.length,
    freshness: trendFreshness(observations),
  };
}

/**
 * Liste les tendances uniques (par mot-clé) avec leur dernier statut.
 */
export function listTrendSummaries(): TrendHistory[] {
  const all = readTrends();
  const byKeyword = new Map<string, TrendObservation[]>();

  for (const o of all) {
    const key = o.keyword.toLowerCase().trim();
    if (!byKeyword.has(key)) byKeyword.set(key, []);
    byKeyword.get(key)!.push(o);
  }

  const summaries: TrendHistory[] = [];
  for (const [keyword, observations] of byKeyword.entries()) {
    const sorted = observations.sort(
      (a, b) =>
        new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime()
    );
    summaries.push({
      keyword,
      category: sorted[0].category,
      market: sorted[0].market,
      observations: sorted,
      firstObserved: sorted[0].observedAt,
      lastObserved: sorted[sorted.length - 1].observedAt,
      observationCount: sorted.length,
      freshness: trendFreshness(sorted),
    });
  }

  summaries.sort(
    (a, b) =>
      new Date(b.lastObserved ?? a.firstObserved ?? 0).getTime() -
      new Date(a.lastObserved ?? b.firstObserved ?? 0).getTime()
  );

  return summaries;
}
