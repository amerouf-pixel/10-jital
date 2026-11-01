/**
 * 10-JITAL — Observations de prix réelles (stockage durable)
 *
 * Lit/écrit dans data/price-observations.json (fs, côté serveur uniquement).
 * Chaque observation est horodatée et comparée à la précédente pour détecter
 * un changement réel. Aucun prix n'est inventé : seule une observation saisie
 * ou collectée depuis une source active est enregistrée.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { PriceObservation, PriceObservationInput } from './price-sources';

const DATA_DIR = join(process.cwd(), 'data');
const OBS_FILE = join(DATA_DIR, 'price-observations.json');

// Une donnée est considérée "fraîche" pendant 24 h. Au-delà, le prix est
// affiché comme "non vérifié".
export const PRICE_FRESHNESS_MAX_AGE_HOURS = 24;

function readObservations(): PriceObservation[] {
  try {
    if (!existsSync(OBS_FILE)) return [];
    const raw = readFileSync(OBS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeObservations(obs: PriceObservation[]): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(OBS_FILE, JSON.stringify(obs, null, 2), 'utf-8');
}

/**
 * Enregistre une nouvelle observation et détecte le changement par rapport à
 * la dernière observation connue du même produit.
 */
export function recordObservation(input: PriceObservationInput): PriceObservation {
  const all = readObservations();
  const previous = all
    .filter((o) => o.productId === input.productId)
    .sort(
      (a, b) =>
        new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime()
    )[0];

  const previousPrice = previous ? previous.price : null;
  let changed = false;
  let changeType: 'decrease' | 'increase' | 'stable' | null = null;

  if (previousPrice !== null) {
    if (input.price < previousPrice) {
      changed = true;
      changeType = 'decrease';
    } else if (input.price > previousPrice) {
      changed = true;
      changeType = 'increase';
    } else {
      changeType = 'stable';
    }
  }

  const observation: PriceObservation = {
    id: `obs-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...input,
    merchantUrl: input.merchantUrl ?? null,
    verified: input.verified,
    checkedAt: new Date().toISOString(),
    previousPrice,
    changed,
    changeType,
  };

  writeObservations([observation, ...all]);
  return observation;
}

export function getObservations(productId?: string): PriceObservation[] {
  const all = readObservations();
  if (productId) {
    return all.filter((o) => o.productId === productId);
  }
  return all;
}

/**
 * Retourne l'état de prix d'un produit : dernier prix observé, fraîcheur,
 * et message d'affichage (ex: "Prix non vérifié").
 */
export function getPriceStatus(
  productId: string,
  productName: string
): {
  productId: string;
  productName: string;
  currentPrice: number | null;
  currentCurrency: string | null;
  lastChecked: string | null;
  isVerified: boolean;
  sourceId: string | null;
  sourceName: string | null;
  message: string;
} {
  const all = getObservations(productId).sort(
    (a, b) =>
      new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime()
  );
  const latest = all[0];

  if (!latest) {
    return {
      productId,
      productName,
      currentPrice: null,
      currentCurrency: null,
      lastChecked: null,
      isVerified: false,
      sourceId: null,
      sourceName: null,
      message: 'Prix non vérifié — aucune observation.',
    };
  }

  const ageHours =
    (Date.now() - new Date(latest.checkedAt).getTime()) /
    (1000 * 60 * 60);
  const isVerified = latest.verified && ageHours <= PRICE_FRESHNESS_MAX_AGE_HOURS;

  let message = 'Prix vérifié.';
  if (!latest.verified) {
    message = 'Prix non vérifié (source non confirmée).';
  } else if (ageHours > PRICE_FRESHNESS_MAX_AGE_HOURS) {
    message = `Prix non vérifié — données trop anciennes (${Math.floor(ageHours)} h).`;
  }

  return {
    productId,
    productName,
    currentPrice: latest.price,
    currentCurrency: latest.currency,
    lastChecked: latest.checkedAt,
    isVerified,
    sourceId: latest.sourceId,
    sourceName: latest.sourceName,
    message,
  };
}
