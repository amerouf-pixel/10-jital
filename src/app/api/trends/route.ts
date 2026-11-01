/**
 * 10-JITAL — API Route : JITAL TREND RADAR
 *
 * GET    : liste les tendances uniques avec leur historique (sommés par mot-clé)
 * POST   : enregistre une nouvelle observation de tendance (body valide requis)
 *
 * ⚠️ Aucune donnée commerciale n'est inventée.
 * Aucune clé API n'est utilisée.
 * Les données sont stockées localement dans data/trends.json.
 */

import { NextResponse } from "next/server";
import {
  recordTrendObservation,
  listTrendSummaries,
} from "@/lib/trend-storage";
import type { TrendInput, TrendCategory } from "@/lib/trend-types";

function validateInput(body: unknown): { input: TrendInput; error?: string } {
  if (!body || typeof body !== "object") {
    return { input: null as any, error: "Corps de requête invalide." };
  }

  const b = body as Record<string, unknown>;
  const keyword = String(b.keyword ?? "").trim();
  const category = String(b.category ?? "other");
  const market = String(b.market ?? "").trim();
  const value = b.value !== undefined ? Number(b.value) : null;
  const source = String(b.source ?? "user");
  const verified = Boolean(b.verified);

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
    return { input: null as any, error: "Le mot-clé est requis." };
  }
  if (!market) {
    return { input: null as any, error: "Le marché / pays est requis." };
  }
  if (!validCategories.includes(category)) {
    return { input: null as any, error: "Catégorie invalide." };
  }
  if (!["user", "system", "external"].includes(source)) {
    return { input: null as any, error: "Source invalide." };
  }
  if (value !== null && (isNaN(value) || value < 0)) {
    return { input: null as any, error: "Valeur invalide." };
  }

  return {
    input: {
      keyword,
      category: category as TrendCategory,
      market,
      value,
      source: source as "user" | "system" | "external",
      verified,
    },
  };
}

export async function GET() {
  try {
    const summaries = listTrendSummaries();
    return NextResponse.json({
      success: true,
      count: summaries.length,
      data: summaries,
      note: "Observations locales uniquement. Aucune donnée commerciale externe.",
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la lecture des tendances." },
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

    const observation = recordTrendObservation(validation.input);

    return NextResponse.json({
      success: true,
      data: observation,
      note: "Observation enregistrée localement. Aucune donnée commerciale externe.",
    });
  } catch (err: any) {
    if (err.message === "Une observation identique existe déjà pour ce mot-clé.") {
      return NextResponse.json(
        { error: err.message },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement de l'observation." },
      { status: 500 }
    );
  }
}
