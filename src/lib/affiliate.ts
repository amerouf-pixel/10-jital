/**
 * Système de gestion des liens trackés et alertes prix pour 10-JITAL.
 *
 * ⚠️ Génération modernisée : tous les liens produits passent désormais par
 * le raccourcisseur `src/utils/affiliate.ts` qui produira TOUJOURS un lien court :
 *   https://www.amazon.{tld}/dp/{ASIN}?tag=10jital-21
 * (plus aucun paramètre ref=/keywords=/qid=/sr= ni utm_* superflu).
 */

import { toShortAffiliateLink } from "@/utils/affiliate";

export interface AffiliateProduct {
  id: string;
  name: string;
  price: number;
  currency: "MAD" | "EUR" | "USD";
  rawUrl: string;
  affiliateTag: string;
}

export function generateSmartAffiliateUrl(product: AffiliateProduct): string {
  const direct = toShortAffiliateLink(product.rawUrl);
  if (direct) {
    return direct;
  }
  // Fallback : URL brute brut taguée (cas d'une URL non-Amazon ou illisible).
  const separator = product.rawUrl.includes("?") ? "&" : "?";
  return `${product.rawUrl}${separator}tag=${product.affiliateTag}`;
}
