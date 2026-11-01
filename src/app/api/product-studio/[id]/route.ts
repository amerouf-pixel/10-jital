/**
 * 10-JITAL — API Route : JITAL PRODUCT STUDIO — Projet individuel
 *
 * GET    : récupère un projet par ID
 * PUT    : met à jour un projet (body contient id + champs)
 * DELETE : supprime un projet (body contient id)
 *
 * ⚠️ Aucune donnée commerciale n'est inventée.
 * Aucune clé API n'est utilisée.
 */

import { NextResponse } from "next/server";
import {
  readProductStudioProjects,
  writeProductStudioProjects,
} from "@/lib/product-studio-storage";
import type { ProductStudioProject } from "@/lib/product-studio-types";
import { generateProjectContent } from "@/lib/product-studio-types";

function validateUpdate(body: unknown): { id: string; updates: Partial<ProductStudioProject>; error?: string } {
  if (!body || typeof body !== "object") {
    return { id: "", updates: {}, error: "Corps de requête invalide." };
  }

  const b = body as Record<string, unknown>;
  const id = String(b.id ?? "").trim();

  if (!id) {
    return { id: "", updates: {}, error: "ID du projet requis." };
  }

  const allowedFields = [
    "name",
    "type",
    "niche",
    "audience",
    "language",
    "idea",
    "commercialObjective",
    "indicativePrice",
    "deliveryFormat",
    "commercialTitle",
    "commercialSubtitle",
    "detailedDescription",
    "benefits",
    "tableOfContents",
    "sectionsContent",
    "gumroadPresentation",
    "coverIdea",
    "qualityChecklist",
    "keywords",
    "status",
  ];

  const updates: Partial<ProductStudioProject> = {};
  for (const field of allowedFields) {
    if (b[field] !== undefined) {
      (updates as Record<string, unknown>)[field] = b[field];
    }
  }

  return { id, updates };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projects = readProductStudioProjects();
    const project = projects.find((p) => p.id === id);
    if (!project) {
      return NextResponse.json({ error: "Projet introuvable." }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: project });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la lecture du projet." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = validateUpdate(body);

    if (validation.error) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const projects = readProductStudioProjects();
    const index = projects.findIndex((p) => p.id === validation.id);
    if (index === -1) {
      return NextResponse.json({ error: "Projet introuvable." }, { status: 404 });
    }

    let projectToUpdate: ProductStudioProject = projects[index];

    // Génération de contenu initial si demandée
    if ((body as Record<string, unknown>)._generate === true) {
      projectToUpdate = generateProjectContent(projectToUpdate);
    }

    const updatedProject: ProductStudioProject = {
      ...projectToUpdate,
      ...validation.updates,
      updatedAt: new Date().toISOString(),
    };

    projects[index] = updatedProject;
    writeProductStudioProjects(projects);

    return NextResponse.json({ success: true, data: updatedProject });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la modification du projet." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("id") || id;

    if (!projectId) {
      return NextResponse.json({ error: "ID du projet requis." }, { status: 400 });
    }

    const projects = readProductStudioProjects();
    const filtered = projects.filter((p) => p.id !== projectId);
    if (filtered.length === projects.length) {
      return NextResponse.json({ error: "Projet introuvable." }, { status: 404 });
    }

    writeProductStudioProjects(filtered);
    return NextResponse.json({ success: true, message: "Projet supprimé." });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la suppression du projet." },
      { status: 500 }
    );
  }
}
