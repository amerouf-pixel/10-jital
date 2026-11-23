/**
 * 10-JITAL — Raccourcisseur automatique de liens d'affiliation Amazon.
 *
 * Objectif : aucun lien long (ref=, keywords=, qid=, sr=...) ne doit apparaître
 * dans la boutique. Tout lien Amazon long est converti en format minimalisa :
 *
 *   https://www.amazon.{tld}/dp/{ASIN}?tag=10jital-21
 *
 * Règles :
 *   1. Un lien déjà court (amzn.to, amzn.eu) : conservé tel quel, le tag est forcé.
 *   2. Un lien Amazon avec ASIN (>dp/ ou >gp/product/) : ASIN extrait, tout le reste est jeté.
 *   3. Un lien Amazon sans ASIN exploitable : paramètres nettoyés (sauf tag existant), puis tagué.
 *   4. Tout lien hors Amazon : renvoyé inchangé.
 */

export const AMAZON_AFFILIATE_TAG = "10jital-21";

/** Regex d'extraction de l'ASIN Amazon : /dp/, /gp/product/ ou /gp/aw/d/ + 10 caractères [A-Z0-9]. */
export const AMAZON_ASIN_REGEX = /(?:\/dp\/|\/gp\/product\/|\/gp\/aw\/d\/)([A-Z0-9]{10})/i;

/** Regex d'extraction du tag d'affiliation existant (tag=, tagcode=...). */
export const AMAZON_TAG_REGEX = /(?:^|&|\b)tag=([A-Za-z0-9-]{1,40})/i;

/** Domaines Amazon raccourcis officiels (déjà courts). */
const AMAZON_SHORT_HOST_REGEX = /^amzn\.(to|eu)$/i;

/** Domaines de boutique Amazon. */
const AMAZON_HOST_REGEX = /(^|\.)(amazon\.[a-z]{2,3}(\.[a-z]{2})?|amzn\.(to|eu))$/i;

/**
 * Vérifie si une URL pointe vers un domaine Amazon (boutique ou raccourci).
 */
export function isAmazonUrl(rawUrl: string): boolean {
  try {
    const host = new URL(rawUrl).hostname.toLowerCase().replace(/^www\./, "");
    return AMAZON_HOST_REGEX.test(host);
  } catch {
    return false;
  }
}

/**
 * Extrait l'ASIN (10 caractères) d'un lien Amazon, quel que soit son format.
 * Retourne `null` si aucun ASIN n'est détecté.
 */
export function extractAmazonAsin(rawUrl: string): string | null {
  const match = AMAZON_ASIN_REGEX.exec(rawUrl ?? "");
  return match ? match[1].toUpperCase() : null;
}

/**
 * Vérifie si le lien est déjà un lien court Amazon (amzn.to / amzn.eu).
 */
export function isAmazonShortLink(rawUrl: string): boolean {
  try {
    const host = new URL(rawUrl).hostname.toLowerCase().replace(/^www\./, "");
    return AMAZON_SHORT_HOST_REGEX.test(host);
  } catch {
    return false;
  }
}

/**
 * Vérifie qu'un lien Amazon porte bien le tag d'affiliation 10JITAL.
 * Le tag existant n'est jamais écrasé s'il est déjà correct.
 */
export function attachAffiliateTag(rawUrl: string, tag: string = AMAZON_AFFILIATE_TAG): string {
  if (!rawUrl) return rawUrl;
  try {
    const url = new URL(rawUrl);
    if (!isAmazonUrl(rawUrl)) return rawUrl;
    const existing = url.searchParams.get("tag");
    if (existing === tag) return url.toString();
    url.searchParams.set("tag", tag);
    return url.toString();
  } catch {
    return rawUrl;
  }
}

/**
 * Transforme n'importe quel lien Amazon en lien court ultra-propre :
 *   https://www.amazon.{tld}/dp/{ASIN}?tag=10jital-21
 *
 * - Conserve le TLD d'origine (amazon.fr → /amazon.fr, amazon.de → /amazon.de...).
 * - Force la présence du tag 10jital-21 sur tout lien Amazon.
 * - Laisse inchangé tout lien non-Amazon.
 * - Tolère une URL invalide (retourne la valeur d'origine, nettoyée des espaces).
 */
export function toShortAffiliateLink(rawUrl: string, tag: string = AMAZON_AFFILIATE_TAG): string {
  const input = typeof rawUrl === "string" ? rawUrl.trim() : "";
  if (!input) return rawUrl ?? "";

  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return input;
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");

  // 1. Lien déjà court → on force simplement le tag d'affiliation.
  if (AMAZON_SHORT_HOST_REGEX.test(host)) {
    return attachAffiliateTag(parsed.toString(), tag);
  }

  // 2. Hors Amazon → inchangé.
  if (!AMAZON_HOST_REGEX.test(host)) {
    return input;
  }

  // 3. Lien Amazon avec ASIN → structure minimale /dp/{ASIN}.
  const asin = extractAmazonAsin(input);
  if (asin) {
    const tld = host.replace(/^amazon\./i, "") || "fr";
    return `https://www.amazon.${tld}/dp/${asin}?tag=${tag}`;
  }

  // 4. Lien Amazon sans ASIN → on purge les paramètres superflus (ref, keywords, qid, sr...)
  //    puis on réapplique le tag. Le slug (titre SEO) est conservé accidentellement dans le path.
  for (const key of [...parsed.searchParams.keys()]) {
    if (key.toLowerCase() !== "tag") {
      parsed.searchParams.delete(key);
    }
  }
  return attachAffiliateTag(parsed.toString(), tag);
}

/**
 * Genère le texte optimisé prêt à coller sur Instagram / TikTok :
 *   "🔥 Découvre {TITRE} ici : {LIEN_COURT} #10JITAL"
 */
export function buildAffiliateShareMessage(title: string, rawUrl: string): string {
  const shortUrl = toShortAffiliateLink(rawUrl);
  return `🔥 Découvre ${title} ici : ${shortUrl} #10JITAL`;
}

/**
 * Genère l'URL de partage Facebook direct avec le lien court + le titre produit.
 *   https://www.facebook.com/sharer/sharer.php?u={LIEN_COURT}&quote={TITRE}
 */
export function buildFacebookShareUrl(rawUrl: string, title: string): string {
  const shortUrl = toShortAffiliateLink(rawUrl);
  const params = new URLSearchParams({ u: shortUrl, quote: title });
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
}

/**
 * Normalise un produit (ou tout objet avec url d'affiliation) vers son lien court.
 * Pratique pour appliquer le raccourcisseur sur la base de données de produits :
 *
 *   products.map((p) => ({ ...p, affiliateUrl: shortenProductAffiliate(p) }))
 */
export function shortenProductAffiliate<
  T extends { affiliateUrl?: string | null; merchantUrl?: string | null; url?: string | null },
>(product: T): string {
  return toShortAffiliateLink(product.affiliateUrl || product.merchantUrl || product.url || "");
}
