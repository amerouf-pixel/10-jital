/**
 * 10-JITAL — API : historique des prix observés
 *
 * GET /api/price-history?productId=...  (lecture publique)
 * Retourne les observations de prix réelles, triées de la plus récente à la
 * plus ancienne. Les données de démonstration ne sont jamais mélangées ici.
 */

import { NextResponse } from 'next/server';
import { getObservations } from '@/lib/price-observation';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId') || undefined;
    const observations = getObservations(productId);
    return NextResponse.json({
      success: true,
      count: observations.length,
      data: observations,
      note: 'Observations réelles uniquement. Aucune donnée simulée.',
    });
  } catch {
    return NextResponse.json(
      { error: 'Erreur lors de la lecture de l\'historique des prix.' },
      { status: 500 }
    );
  }
}
