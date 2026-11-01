/**
 * 10-JITAL — API : vérifier une source de prix à la demande
 *
 * POST /api/sources/[id]/check  (admin)
 * Lance la vérification d'une seule source active et utilisable.
 */

import { NextResponse } from 'next/server';
import { isAuthenticatedRequest } from '@/lib/admin';
import { getSource, isSourceUsable, fetchSource } from '@/lib/price-sources';
import { recordObservation } from '@/lib/price-observation';
import { appendExecutionLog } from '@/lib/execution-log';

function requireAuth(request: Request): NextResponse | null {
  const cookieHeader = request.headers.get('cookie');
  if (!isAuthenticatedRequest(cookieHeader)) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }
  return null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const source = getSource(id);
  if (!source) {
    return NextResponse.json({ error: 'Source introuvable.' }, { status: 404 });
  }
  if (!source.isActive) {
    return NextResponse.json(
      { error: 'Cette source est inactive.' },
      { status: 400 }
    );
  }
  if (!isSourceUsable(id)) {
    return NextResponse.json(
      {
        error:
          'Source inutilisable : identifiants manquants (' +
          (source.credentialsEnvVar ?? '-') +
          ').',
      },
      { status: 400 }
    );
  }

  const startedAt = Date.now();
  const errors: string[] = [];
  let observationsRecorded = 0;

  // Les sources de type 'manual' ne se vérifient pas automatiquement.
  if (source.type !== 'manual' && source.baseUrl) {
    const apiKey = source.credentialsEnvVar
      ? process.env[source.credentialsEnvVar]
      : undefined;
    const result = await fetchSource(source.baseUrl, apiKey
      ? { apiKey }
      : undefined);

    if (!result.ok) {
      errors.push(
        `${source.id}: HTTP ${result.status ?? '?'}${
          result.error ? ' — ' + result.error : ''
        }`
      );
      source.lastStatus = 'error';
      source.lastError = result.error ?? `HTTP ${result.status ?? '?'}`;
    } else {
      source.lastStatus = 'ok';
      source.lastError = null;
    }
  }

  source.lastChecked = new Date().toISOString();

  const log = {
    triggeredAt: new Date().toISOString(),
    trigger: 'manual' as const,
    sourcesChecked: 1,
    observationsRecorded,
    errors,
    status: (errors.length ? "failed" : "completed") as "completed" | "failed",
    durationMs: Date.now() - startedAt,
  };
  appendExecutionLog(log);

  return NextResponse.json({
    success: errors.length === 0,
    source: {
      id: source.id,
      lastChecked: source.lastChecked,
      lastStatus: source.lastStatus,
      lastError: source.lastError,
    },
    log,
  });
}
