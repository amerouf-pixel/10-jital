/**
 * 10-JITAL — Stockage persistant des projets Product Studio (côté serveur uniquement)
 * Lit et écrit dans data/product-studio.json via le module Node.js fs.
 * Ce fichier ne doit être importé que par des API routes ou des Server Components.
 *
 * ⚠️ Attention : le stockage par fichiers JSON fonctionne en développement et
 * sur des serveurs avec système de fichiers persistant. Sur Vercel/serverless,
 * les écritures locales ne sont pas persistantes entre les déploiements.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import type { ProductStudioProject } from "./product-studio-types";

const DATA_DIR = join(process.cwd(), "data");
const PROJECTS_FILE = join(DATA_DIR, "product-studio.json");

export interface ProductStudioData {
  projects: ProductStudioProject[];
  metadata: {
    source: string;
    note: string;
    lastUpdated: string;
    version: string;
  };
}

/**
 * Lit tous les projets depuis le fichier JSON.
 */
export function readProductStudioProjects(): ProductStudioProject[] {
  try {
    if (!existsSync(PROJECTS_FILE)) {
      return [];
    }
    const raw = readFileSync(PROJECTS_FILE, "utf-8");
    const data: ProductStudioData = JSON.parse(raw);
    return data.projects ?? [];
  } catch {
    return [];
  }
}

/**
 * Lit le fichier de données complet.
 */
export function readProductStudioData(): ProductStudioData {
  try {
    if (!existsSync(PROJECTS_FILE)) {
      return {
        projects: [],
        metadata: {
          source: "local",
          note: "Projets Product Studio locaux uniquement. Aucune donnée commerciale externe.",
          lastUpdated: new Date().toISOString(),
          version: "1.0",
        },
      };
    }
    const raw = readFileSync(PROJECTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {
      projects: [],
      metadata: {
        source: "local",
        note: "Projets Product Studio locaux uniquement. Aucune donnée commerciale externe.",
        lastUpdated: new Date().toISOString(),
        version: "1.0",
      },
    };
  }
}

/**
 * Écrit la liste complète des projets dans le fichier JSON.
 */
export function writeProductStudioProjects(projects: ProductStudioProject[]): void {
  try {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    const data: ProductStudioData = {
      projects,
      metadata: {
        source: "local",
        note: "Projets Product Studio locaux uniquement. Aucune donnée commerciale externe.",
        lastUpdated: new Date().toISOString(),
        version: "1.0",
      },
    };
    writeFileSync(PROJECTS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Erreur lors de l'écriture des projets Product Studio:", error);
    throw new Error("Impossible d'écrire les projets Product Studio.");
  }
}
