/**
 * 10-JITAL — API : journal d'exécution des vérifications
 *
 * GET /api/execution-log  (admin)
 * Retourne les exécutions récentes (planifiées et manuelles) avec erreurs.
 */

import { NextResponse } from 'next/server';
import { isAuthenticatedRequest } from '@/lib/admin';
import { readExecutionLog } from '@/lib/execution-log';

function requireAuth(request: Request): NextResponse | null {
  const cookieHeader = request.headers.get('cookie');
  if (!isAuthenticatedRequest(cookieHeader)) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }
  return null;
}

export async function GET(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const logs = readExecutionLog().slice(0, limit);
    return NextResponse.json({ success: true, count: logs.length, data: logs });
  } catch {
    return NextResponse.json(
      { error: 'Erreur lors de la lecture du journal d\'exécution.' },
      { status: 500 }
    );
  }
}
