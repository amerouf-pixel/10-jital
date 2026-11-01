/**
 * 10-JITAL — Utilitaires purs de produits (utilisables côté client et serveur)
 * Aucune dépendance à Node.js fs.
 */

export interface StoredProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice: number | null;
  currency: string;
  category: string;
  image: string;
  inStock: boolean;
  rating: number;
  reviews: number;
  merchantUrl: string | null;
  affiliateUrl: string | null;
  source: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Calcule le pourcentage de réduction à partir des prix réels saisis.
 * Retourne null si oldPrice est manquant ou invalide.
 */
export function calculateDiscountPercent(
  currentPrice: number,
  oldPrice: number | null
): number | null {
  if (!oldPrice || oldPrice <= 0 || currentPrice >= oldPrice) {
    return null;
  }
  return Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
}

/**
 * Génère un nouvel ID unique pour un produit.
 */
export function generateProductId(existingIds: string[]): string {
  const maxId = existingIds.reduce((max, id) => {
    const num = parseInt(id.replace("prod-", ""), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  return `prod-${String(maxId + 1).padStart(3, "0")}`;
}