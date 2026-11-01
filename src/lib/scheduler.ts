/**
 * 10-JITAL — Tâche planifiée de vérification des prix
 *
 * S'exécute uniquement dans le processus du serveur Next.js en cours (dev ou
 * start). Pour la production, utiliser un cron externe appelant
 * POST /api/scheduler/check.
 *
 * La configuration (activé / intervalle) est persistée dans
 * data/scheduler-config.json. Aucune exécution n'a lieu tant que l'admin ne
 * l'a pas activée via l'API.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { PRICE_SOURCES, isSourceUsable, fetchSource } from './price-sources';
import { recordObservation } from './price-observation';
import { appendExecutionLog } from './execution-log';

const DATA_DIR = join(process.cwd(), 'data');
const CONFIG_FILE = join(DATA_DIR, 'scheduler-config.json');

export interface SchedulerConfig {
  enabled: boolean;
  intervalMinutes: number;
  lastRun: string | null;
  nextRun: string | null;
}

const DEFAULT_CONFIG: SchedulerConfig = {
  enabled: false,
  intervalMinutes: 60,
  lastRun: null,
  nextRun: null,
};

let intervalHandle: ReturnType<typeof setInterval> | null = null;
let isRunning = false;

function readConfig(): SchedulerConfig {
  try {
    if (!existsSync(CONFIG_FILE)) {
      writeConfig(DEFAULT_CONFIG);
      return { ...DEFAULT_CONFIG };
    }
    return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function writeConfig(cfg: SchedulerConfig): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8');
}

/**
 * Retourne la configuration du planificateur.
 */
export function getSchedulerConfig(): SchedulerConfig {
  return readConfig();
}

/**
 * Met à jour la configuration du planificateur (activé / intervalle).
 */
export function updateSchedulerConfig(
  partial: Partial<SchedulerConfig>
): SchedulerConfig {
  const cfg = readConfig();
  const next = { ...cfg, ...partial };
  writeConfig(next);
  return next;
}

/**
 * État du planificateur (pour l'affichage dans l'admin).
 */
export function getSchedulerState() {
  const cfg = readConfig();
  return {
    enabled: cfg.enabled,
    intervalMinutes: cfg.intervalMinutes,
    lastRun: cfg.lastRun,
    nextRun: cfg.nextRun,
    isRunning,
    intervalActive: intervalHandle !== null,
  };
}

/**
 * Lance une vérification immédiate de toutes les sources actives et utilisables.
 * Ne crée pas d'observation automatique : le body brut est laissé à l'interprétation.
 * Met à jour le statut lastChecked / lastStatus de chaque source.
 */
export async function runCheckNow(
  trigger: 'manual' | 'scheduled' = 'manual'
): Promise<{
  triggeredAt: string;
  trigger: 'manual' | 'scheduled';
  sourcesChecked: number;
  observationsRecorded: number;
  errors: string[];
  status: 'completed' | 'failed';
  durationMs: number;
}> {
  if (isRunning) {
    throw new Error('Une vérification est déjà en cours.');
  }

  isRunning = true;
  const startedAt = Date.now();
  const log: {
    triggeredAt: string;
    trigger: 'manual' | 'scheduled';
    sourcesChecked: number;
    observationsRecorded: number;
    errors: string[];
    status: 'completed' | 'failed';
    durationMs: number;
  } = {
    triggeredAt: new Date().toISOString(),
    trigger,
    sourcesChecked: 0,
    observationsRecorded: 0,
    errors: [],
    status: 'completed',
    durationMs: 0,
  };

  try {
    for (const source of PRICE_SOURCES) {
      if (!source.isActive) continue;
      log.sourcesChecked += 1;

      if (!isSourceUsable(source.id)) {
        log.errors.push(
          `${source.id}: inactif ou identifiants manquants (${source.credentialsEnvVar ?? '-'})`
        );
        continue;
      }

      // Les sources de type 'manual' ne se vérifient pas automatiquement.
      if (source.type !== 'manual' && source.baseUrl) {
        const apiKey = source.credentialsEnvVar
          ? process.env[source.credentialsEnvVar]
          : undefined;
        const result = await fetchSource(source.baseUrl, apiKey
          ? { apiKey }
          : undefined);

        if (!result.ok) {
          log.errors.push(
            `${source.id}: HTTP ${result.status ?? '?'}${
              result.error ? ' — ' + result.error : ''
            }`
          );
          source.lastStatus = 'error';
          source.lastError = result.error ?? `HTTP ${result.status ?? '?'}`;
          continue;
        }

        source.lastStatus = 'ok';
        source.lastError = null;
      }

      source.lastChecked = new Date().toISOString();
    }

    log.durationMs = Date.now() - startedAt;
  } catch (e) {
    log.status = 'failed';
    log.errors.push(e instanceof Error ? e.message : 'Erreur inconnue');
    log.durationMs = Date.now() - startedAt;
  } finally {
    isRunning = false;
    const cfg = readConfig();
    cfg.lastRun = new Date().toISOString();
    writeConfig(cfg);
    appendExecutionLog(log);
  }

  return log;
}

/**
 * Démarre l'intervalle de vérification planifiée (si activé et configuré).
 * À appeler uniquement via l'API /api/scheduler/start.
 */
export function startScheduler(): void {
  if (intervalHandle) return;
  const cfg = readConfig();
  if (!cfg.enabled || !cfg.intervalMinutes || cfg.intervalMinutes <= 0) return;

  intervalHandle = setInterval(async () => {
    try {
      await runCheckNow('scheduled');
    } catch {
      // Les erreurs sont déjà journalisées dans runCheckNow.
    }
  }, cfg.intervalMinutes * 60 * 1000);
}

/**
 * Arrête l'intervalle de vérification planifiée.
 */
export function stopScheduler(): void {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
}
