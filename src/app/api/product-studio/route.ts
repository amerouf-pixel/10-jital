/**
 * 10-JITAL — API Route : JITAL PRODUCT STUDIO
 *
 * GET    : liste tous les projets Product Studio enregistrés localement
 * POST   : crée un nouveau projet (body valide requis)
 *
 * ⚠️ Aucune donnée commerciale n'est inventée.
 * Aucun produit n'est publié automatiquement.
 * Aucune clé API n'est utilisée.
 * Les données sont stockées localement dans data/product-studio.json.
 */

import { NextResponse } from "next/server";
import { readProductStudioProjects, writeProductStudioProjects } from "@/lib/product-studio-storage";
import type { ProductStudioProject, ProductStudioInput, ProductStudioType, ProductStudioLanguage } from "@/lib/product-studio-types";
import { emptyProject } from "@/lib/product-studio-types";

function validateInput(body: unknown): { input: ProductStudioInput; error?: string } {
  if (!body || typeof body !== "object") {
    return { input: null as any, error: "Corps de requête invalide." };
  }

  const b = body as Record<string, unknown>;
  const name = String(b.name ?? "").trim();
  const type = String(b.type ?? "other");
  const niche = String(b.niche ?? "").trim();
  const audience = String(b.audience ?? "").trim();
  const language = String(b.language ?? "fr");
  const idea = String(b.idea ?? "").trim();
  const commercialObjective = String(b.commercialObjective ?? "").trim();
  const indicativePrice = b.indicativePrice !== undefined ? Number(b.indicativePrice) : null;
  const deliveryFormat = String(b.deliveryFormat ?? "").trim();
  const source = String(b.source ?? "manual");
  const sourceId = b.sourceId ?? null;

  const validTypes = [
    "ebook",
    "workbook",
    "template",
    "prompt-pack",
    "creator-kit",
    "resource-pack",
    "course",
    "tool",
    "other",
  ];
  const validLanguages = ["fr", "en", "ar", "es"];
  const validSources = ["manual", "niche-detector", "opportunity-hunter", "trend-radar"];

  if (!name) {
    return { input: null as any, error: "Le nom du produit est requis." };
  }
  if (!type || !validTypes.includes(type)) {
    return { input: null as any, error: "Type de produit invalide." };
  }
  if (!niche) {
    return { input: null as any, error: "La niche ou le secteur est requis." };
  }
  if (!audience) {
    return { input: null as any, error: "Le public cible est requis." };
  }
  if (!language || !validLanguages.includes(language)) {
    return { input: null as any, error: "Langue invalide." };
  }
  if (!idea) {
    return { input: null as any, error: "La description de l'idée est requise." };
  }
  if (!commercialObjective) {
    return { input: null as any, error: "L'objectif commercial est requis." };
  }
  if (indicativePrice !== null && (isNaN(indicativePrice) || indicativePrice < 0)) {
    return { input: null as any, error: "Prix indicatif invalide." };
  }
  if (!validSources.includes(source)) {
    return { input: null as any, error: "Source invalide." };
  }

  return {
    input: {
      name,
      type: type as ProductStudioType,
      niche,
      audience,
      language: language as ProductStudioLanguage,
      idea,
      commercialObjective,
      indicativePrice,
      deliveryFormat,
      source: source as ProductStudioInput["source"],
      sourceId: sourceId as string | null,
    },
  };
}

export async function GET() {
  try {
    const projects = readProductStudioProjects();
    // Trier par date de mise à jour décroissante
    projects.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    return NextResponse.json({
      success: true,
      count: projects.length,
      data: projects,
      note: "Projets locaux uniquement. Aucune donnée commerciale externe.",
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la lecture des projets." },
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

    const project: ProductStudioProject = emptyProject(validation.input);

    const existing = readProductStudioProjects();
    existing.push(project);
    writeProductStudioProjects(existing);

    return NextResponse.json({
      success: true,
      data: project,
      note: "Projet enregistré localement. Aucune donnée commerciale externe.",
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement du projet." },
      { status: 500 }
    );
  }
}
