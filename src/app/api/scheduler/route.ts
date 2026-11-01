/**
 * 10-JITAL — API : planificateur de vérification des prix
 *
 * GET    : état du planificateur (lecture publique)
 * POST   : { action: 'start' | 'stop' | 'check' } (admin)
 *   - start   : démarre l'intervalle de vérification planifiée
 *   - stop    : arrête l'intervalle
 *   - check   : lance une vérification immédiate de toutes les sources actives
 *
 * ⚠️ Le planificateur ne s'exécute que tant que le processus serveur est vivant.
 * Pour la production, utiliser un cron externe appelant l'action 'check'.
 */

import { NextResponse } from 'next/server';
import { isAuthenticatedRequest } from '@/lib/admin';
import {
  getSchedulerConfig,
  updateSchedulerConfig,
  getSchedulerState,
  startScheduler,
  stopScheduler,
  runCheckNow,
} from '@/lib/scheduler';

function requireAuth(request: Request): NextResponse | null {
  const cookieHeader = request.headers.get('cookie');
  if (!isAuthenticatedRequest(cookieHeader)) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }
  return null;
}

export async function GET() {
  return NextResponse.json({ success: true, data: getSchedulerState() });
}

export async function POST(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { action } = body as { action?: string };

    if (action === 'start') {
      const cfg = updateSchedulerConfig({ enabled: true });
      startScheduler();
      return NextResponse.json({
        success: true,
        data: { ...getSchedulerState(), config: cfg },
      });
    }

    if (action === 'stop') {
      stopScheduler();
      const cfg = updateSchedulerConfig({ enabled: false });
      return NextResponse.json({
        success: true,
        data: { ...getSchedulerState(), config: cfg },
      });
    }

    if (action === 'check') {
      const log = await runCheckNow('manual');
      return NextResponse.json({ success: log.status === 'completed', data: log });
    }

    return NextResponse.json(
      { error: "Action inconnue (start | stop | check)." },
      { status: 400 }
    );
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : 'Erreur lors de l\'action.',
      },
      { status: 500 }
    );
  }
}
