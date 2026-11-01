/**
 * 10-JITAL — Sources de prix et connecteurs
 *
 * ⚠️ AUCUN connecteur n'est activé par défaut.
 * Les connecteurs de marchands / affiliation restent inactifs tant que :
 *   - ils sont explicitement activés (manuellement, après vérification), et
 *   - les variables d'environnement requises sont définies.
 *
 * Ce fichier prépare l'architecture. Aucun prix réel n'est récupéré tant
 * qu'une source n'est pas active et utilisable.
 */

export type SourceType = 'affiliation' | 'merchant-api' | 'product-feed' | 'manual';

export interface PriceSource {
  id: string;
  name: string;
  type: SourceType;
  baseUrl: string | null;
  isActive: boolean;
  requiresCredentials: boolean;
  credentialsEnvVar?: string; // nom de la variable d'environnement, JAMAIS la valeur
  checkIntervalMinutes?: number;
  lastChecked: string | null;
  lastStatus: 'ok' | 'error' | 'pending' | null;
  lastError: string | null;
  observationsCount: number;
}

/**
 * Sources configurables. Aucune n'est active par défaut, sauf la saisie manuelle.
 * À activer manuellement après vérification du programme / marchand.
 */
export const PRICE_SOURCES: PriceSource[] = [
  {
    id: 'manual',
    name: 'Saisie manuelle (admin)',
    type: 'manual',
    baseUrl: null,
    isActive: true,
    requiresCredentials: false,
    lastChecked: null,
    lastStatus: null,
    lastError: null,
    observationsCount: 0,
  },
  {
    id: 'example-affiliation',
    name: 'Exemple — Partenaire affiliation',
    type: 'affiliation',
    baseUrl: 'https://example-partner.com/feed',
    isActive: false,
    requiresCredentials: false,
    lastChecked: null,
    lastStatus: null,
    lastError: null,
    observationsCount: 0,
  },
  {
    id: 'example-merchant-api',
    name: 'Exemple — API marchand',
    type: 'merchant-api',
    baseUrl: 'https://api.example-merchant.com/v1/prices',
    isActive: false,
    requiresCredentials: true,
    credentialsEnvVar: 'MERCHANT_API_KEY',
    lastChecked: null,
    lastStatus: null,
    lastError: null,
    observationsCount: 0,
  },
];

export function getSource(id: string): PriceSource | undefined {
  return PRICE_SOURCES.find((s) => s.id === id);
}

/**
 * Une source est "utilisable" si elle est active et, si elle requiert des
 * identifiants, que la variable d'environnement correspondante est définie
 * (et n'est pas une valeur factice).
 */
export function isSourceUsable(id: string): boolean {
  const s = getSource(id);
  if (!s || !s.isActive) return false;
  if (s.requiresCredentials && !s.credentialsEnvVar) return false;
  if (s.requiresCredentials && s.credentialsEnvVar) {
    const value = process.env[s.credentialsEnvVar];
    if (!value || value === 'your_api_key_here' || value.trim().length === 0) {
      return false;
    }
  }
  return true;
}

export interface PriceObservationInput {
  productId: string;
  productName: string;
  price: number;
  currency: string;
  sourceId: string;
  sourceName: string;
  merchantUrl?: string | null;
  verified: boolean;
}

export interface PriceObservation extends PriceObservationInput {
  id: string;
  checkedAt: string;
  previousPrice: number | null;
  changed: boolean;
  changeType: 'decrease' | 'increase' | 'stable' | null;
}

/**
 * Fetcheur générique et sûr pour une source de prix.
 * - GET simple, User-Agent identifiant 10-JITAL
 * - Timeout de 15 s, pas d'exécution de JS, pas de contournement de protection
 * - Ne retourne que le statut et le corps brut (l'interprétation reste manuelle)
 */
export async function fetchSource(
  url: string,
  options?: { apiKey?: string }
): Promise<{
  ok: boolean;
  status?: number;
  body?: string;
  error?: string;
}> {
  try {
    const headers: Record<string, string> = {
      'User-Agent': '10-JITAL Price Monitor (contact: admin@10jital.example)',
      Accept: 'application/json, text/plain, */*',
    };
    if (options?.apiKey) {
      headers['Authorization'] = `Bearer ${options.apiKey}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timeout);

    let body: string | undefined;
    try {
      body = await res.text();
    } catch {
      body = undefined;
    }

    return { ok: res.ok, status: res.status, body };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Erreur réseau inconnue',
    };
  }
}
