/**
 * 10-JITAL — Stockage persistant des analyses de niches (côté serveur uniquement)
 * Lit et écrit dans data/niches.json via le module Node.js fs.
 * Ce fichier ne doit être importé que par des API routes ou des Server Components.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import type { NicheAnalysis } from "./niche-detector";

const DATA_DIR = join(process.cwd(), "data");
const NICHES_FILE = join(DATA_DIR, "niches.json");

export interface NichesData {
  analyses: NicheAnalysis[];
  metadata: {
    source: string;
    note: string;
    lastUpdated: string;
    version: string;
  };
}

/**
 * Lit toutes les analyses depuis le fichier JSON.
 * Retourne un tableau vide si le fichier n'existe pas encore.
 */
export function readNiches(): NicheAnalysis[] {
  try {
    if (!existsSync(NICHES_FILE)) {
      return [];
    }
    const raw = readFileSync(NICHES_FILE, "utf-8");
    const data: NichesData = JSON.parse(raw);
    return data.analyses ?? [];
  } catch {
    return [];
  }
}

/**
 * Lit le fichier de données complet (analyses + métadonnées).
 */
export function readNichesData(): NichesData {
  try {
    if (!existsSync(NICHES_FILE)) {
      return {
        analyses: [],
        metadata: {
          source: "local",
          note: "Analyses de niches locales uniquement. Aucune donnée commerciale externe.",
          lastUpdated: new Date().toISOString(),
          version: "1.0",
        },
      };
    }
    const raw = readFileSync(NICHES_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {
      analyses: [],
      metadata: {
        source: "local",
        note: "Analyses de niches locales uniquement. Aucune donnée commerciale externe.",
        lastUpdated: new Date().toISOString(),
        version: "1.0",
      },
    };
  }
}

/**
 * Écrit la liste complète des analyses dans le fichier JSON.
 */
export function writeNiches(analyses: NicheAnalysis[]): void {
  try {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    const data: NichesData = {
      analyses,
      metadata: {
        source: "local",
        note: "Analyses de niches locales uniquement. Aucune donnée commerciale externe.",
        lastUpdated: new Date().toISOString(),
        version: "1.0",
      },
    };
    writeFileSync(NICHES_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Erreur lors de l'écriture des analyses de niches:", error);
    throw new Error("Impossible d'écrire les analyses de niches.");
  }
}

/**
 * Bascule l'état favori d'une analyse. Retourne le nouvel état.
 * Le champ isFavorite est ajouté à l'analyse existante (par défaut false).
 */
export function toggleFavorite(nicheId: string): boolean | null {
  try {
    const data = readNichesData();
    const analysis = data.analyses.find((a) => a.id === nicheId);
    if (!analysis) return null;

    const isFavorite = (analysis as any).isFavorite ?? false;
    (analysis as any).isFavorite = !isFavorite;

    writeNiches(data.analyses);
    return !isFavorite;
  } catch {
    return null;
  }
}

/**
 * Retourne la liste des IDs d'analyses marquées comme favorites.
 */
export function getFavoriteIds(): string[] {
  try {
    const data = readNichesData();
    return data.analyses
      .filter((a) => (a as any).isFavorite === true)
      .map((a) => a.id);
  } catch {
    return [];
  }
}

/**
 * Retourne true si l'analyse donnée est favorite.
 */
export function isFavorite(nicheId: string): boolean {
  return getFavoriteIds().includes(nicheId);
}
