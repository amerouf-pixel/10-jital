/**
 * 10-JITAL — API Route : JITAL NICHE DETECTOR
 *
 * GET    : liste toutes les analyses de niches enregistrées localement
 * POST   : enregistre une nouvelle analyse de niche (body valide requis)
 *
 * ⚠️ Aucune donnée commerciale n'est inventée.
 * Aucune clé API n'est utilisée.
 * Les données sont stockées localement dans data/niches.json.
 */

import { NextResponse } from "next/server";
import { readNiches, writeNiches } from "@/lib/niches-server";
import type { NicheAnalysis } from "@/lib/niche-detector";
import { analyzeNiche } from "@/lib/niche-detector";

function validateInput(body: unknown): { input: any; error?: string } {
  if (!body || typeof body !== "object") {
    return { input: null, error: "Corps de requête invalide." };
  }

  const b = body as Record<string, unknown>;
  const keyword = String(b.keyword ?? "").trim();
  const sector = String(b.sector ?? "").trim();
  const productType = String(b.productType ?? "").trim();
  const market = String(b.market ?? "").trim();
  const category = String(b.category ?? "other");

  const validCategories = [
    "digital-products",
    "ebooks",
    "print-on-demand",
    "affiliation",
    "physical-accessories",
    "creator-tools",
    "software",
    "other",
  ];

  if (!keyword) {
    return { input: null, error: "Le mot-clé est requis." };
  }
  if (!sector) {
    return { input: null, error: "Le secteur d'activité est requis." };
  }
  if (!productType) {
    return { input: null, error: "Le type de produit est requis." };
  }
  if (!market) {
    return { input: null, error: "Le marché / pays est requis." };
  }
  if (!validCategories.includes(category)) {
    return { input: null, error: "Catégorie invalide." };
  }

  return {
    input: { keyword, sector, productType, market, category },
  };
}

export async function GET() {
  try {
    const analyses = readNiches();
    // Trier par date de création décroissante
    analyses.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json({
      success: true,
      count: analyses.length,
      data: analyses,
      note: "Analyses locales uniquement. Aucune donnée commerciale externe.",
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la lecture des analyses." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateInput(body);

    if (validation.error) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const analysis: NicheAnalysis = analyzeNiche(validation.input);

    const existing = readNiches();
    existing.push(analysis);
    writeNiches(existing);

    return NextResponse.json({
      success: true,
      data: analysis,
      note: "Analyse enregistrée localement. Aucune donnée commerciale externe.",
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement de l'analyse." },
      { status: 500 }
    );
  }
}
