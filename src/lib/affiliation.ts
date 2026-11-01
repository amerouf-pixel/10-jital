/**
 * 10-JITAL — Architecture pour les sources d'affiliation
 * ⚠️ Aucun service d'affiliation n'est activé pour l'instant.
 * Ce fichier prépare l'architecture pour une intégration future, uniquement
 * avec des programmes d'affiliation autorisés et après vérification manuelle.
 */

export interface AffiliationSource {
  id: string;
  name: string;
  baseUrl: string;
  affiliateParam?: string; // ex: "aff_id", "ref", etc.
  isActive: boolean;
  requiresApiKey: boolean;
  apiKeyEnvVar?: string; // Nom de la variable d'environnement, jamais la valeur
  lastVerified: string | null; // Date de vérification manuelle
}

/**
 * Liste des sources d'affiliation configurables.
 * Aucune n'est active par défaut. À activer manuellement après vérification.
 */
export const AFFILIATION_SOURCES: AffiliationSource[] = [
  {
    id: "example-partner",
    name: "Exemple Partenaire",
    baseUrl: "https://example-partner.com",
    affiliateParam: "aff_id",
    isActive: false,
    requiresApiKey: false,
    apiKeyEnvVar: undefined,
    lastVerified: null,
  },
];

/**
 * Récupère une clé API depuis les variables d'environnement.
 * Retourne undefined si la variable n'est pas définie (pas de fallback en dur).
 */
export function getAffiliationApiKey(envVarName?: string): string | undefined {
  if (!envVarName) return undefined;
  const value = process.env[envVarName];
  if (!value || value === "your_api_key_here") return undefined;
  return value;
}

/**
 * Construit un URL d'affiliation avec le paramètre approprié.
 * Retourne l'URL originale si la source est inactive.
 */
export function buildAffiliationUrl(
  sourceId: string,
  productUrl: string
): string {
  const source = AFFILIATION_SOURCES.find((s) => s.id === sourceId);
  if (!source || !source.isActive || !source.affiliateParam) {
    return productUrl;
  }

  // Aucune clé API n'est injectée ici. Le paramètre d'affiliation est ajouté
    // uniquement si la source a été vérifiée et activée manuellement.
  const url = new URL(productUrl);
  url.searchParams.set(source.affiliateParam, "10jital");
  return url.toString();
}

/**
 * Vérifie qu'une source d'affiliation est autorisée et active.
 */
export function isAffiliationSourceActive(sourceId: string): boolean {
  const source = AFFILIATION_SOURCES.find((s) => s.id === sourceId);
  return !!source?.isActive;
}