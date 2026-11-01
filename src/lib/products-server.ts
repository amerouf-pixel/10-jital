/**
 * 10-JITAL — Stockage persistant des produits (côté serveur uniquement)
 * Lit et écrit dans /data/products.json via le module Node.js fs.
 * Ce fichier ne doit être importé que par des API routes ou des Server Components.
 * Aucune donnée n'est envoyée à un service externe.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import type { StoredProduct } from "./products-storage";

// Ré-exporter les utilitaires purs pour une importation unifiée côté serveur
export type { StoredProduct } from "./products-storage";
export { calculateDiscountPercent, generateProductId } from "./products-storage";

const DATA_DIR = join(process.cwd(), "data");
const PRODUCTS_FILE = join(DATA_DIR, "products.json");

export interface ProductsData {
  products: StoredProduct[];
  metadata: {
    source: string;
    note: string;
    lastUpdated: string;
    version: string;
  };
}

/**
 * Lit tous les produits depuis le fichier JSON.
 * Retourne un tableau vide si le fichier n'existe pas encore.
 */
export function readProducts(): StoredProduct[] {
  try {
    if (!existsSync(PRODUCTS_FILE)) {
      return [];
    }
    const raw = readFileSync(PRODUCTS_FILE, "utf-8");
    const data: ProductsData = JSON.parse(raw);
    return data.products ?? [];
  } catch {
    return [];
  }
}

/**
 * Lit le fichier de données complet (produits + métadonnées).
 */
export function readProductsData(): ProductsData {
  try {
    if (!existsSync(PRODUCTS_FILE)) {
      return {
        products: [],
        metadata: {
          source: "demo",
          note: "Données de démonstration uniquement.",
          lastUpdated: new Date().toISOString(),
          version: "1.0",
        },
      };
    }
    const raw = readFileSync(PRODUCTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {
      products: [],
      metadata: {
        source: "demo",
        note: "Données de démonstration uniquement.",
        lastUpdated: new Date().toISOString(),
        version: "1.0",
      },
    };
  }
}

/**
 * Écrit la liste complète des produits dans le fichier JSON.
 * Écrase le fichier existant (écriture atomique simple).
 */
export function writeProducts(products: StoredProduct[]): void {
  try {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    const data: ProductsData = {
      products,
      metadata: {
        source: "demo",
        note: "Données de démonstration uniquement. Aucun prix réel n'est suivi.",
        lastUpdated: new Date().toISOString(),
        version: "1.0",
      },
    };
    writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Erreur lors de l'écriture des produits:", error);
    throw new Error("Impossible d'écrire les produits dans le fichier de stockage.");
  }
}