/**
 * 10-JITAL — API Route : Favoris de niches
 *
 * POST /api/niche-detector/[id]/favorite : bascule l'état favori d'une analyse.
 * Retourne le nouvel état (true = ajouté aux favoris, false = retiré).
 *
 * ⚠️ Aucune donnée commerciale n'est inventée.
 * Aucun secret n'est exposé.
 */

import { NextResponse } from "next/server";
import { toggleFavorite, isFavorite } from "@/lib/niches-server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "ID de niche invalide." },
        { status: 400 }
      );
    }

    const newState = toggleFavorite(id);
    if (newState === null) {
      return NextResponse.json(
        { error: "Analyse introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      id,
      isFavorite: newState,
      note: newState
        ? "Analyse ajoutée aux favoris."
        : "Analyse retirée des favoris.",
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la modification des favoris." },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "ID de niche invalide." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      id,
      isFavorite: isFavorite(id),
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la lecture des favoris." },
      { status: 500 }
    );
  }
}
