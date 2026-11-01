/**
 * 10-JITAL — Journal d'exécution des vérifications de prix
 *
 * Stockage durable dans data/execution-log.json (fs, côté serveur uniquement).
 * Conserve les exécutions planifiées et manuelles, leurs erreurs et leur état.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const LOG_FILE = join(DATA_DIR, 'execution-log.json');

export interface ExecutionLogEntry {
  id: string;
  triggeredAt: string;
  trigger: 'manual' | 'scheduled';
  sourcesChecked: number;
  observationsRecorded: number;
  errors: string[];
  status: 'completed' | 'failed';
  durationMs: number;
}

export function readExecutionLog(): ExecutionLogEntry[] {
  try {
    if (!existsSync(LOG_FILE)) return [];
    const raw = readFileSync(LOG_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function appendExecutionLog(
  entry: Omit<ExecutionLogEntry, 'id'>
): ExecutionLogEntry {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  const logs = readExecutionLog();
  const newEntry: ExecutionLogEntry = {
    ...entry,
    id: `run-${Date.now()}`,
  };
  const updated = [newEntry, ...logs].slice(0, 200); // garder les 200 derniers
  writeFileSync(LOG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  return newEntry;
}
