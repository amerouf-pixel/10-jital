// Système de gestion des liens trackés et alertes prix pour 10-JITAL

export interface AffiliateProduct {
  id: string;
  name: string;
  price: number;
  currency: "MAD" | "EUR" | "USD";
  rawUrl: string;
  affiliateTag: string;
}

export function generateSmartAffiliateUrl(product: AffiliateProduct): string {
  const separator = product.rawUrl.includes("?") ? "&" : "?";
  return `${product.rawUrl}${separator}ref=${product.affiliateTag}&utm_source=10jital&utm_medium=social`;
}
