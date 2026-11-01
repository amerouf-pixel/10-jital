/**
 * 10-JITAL — API : sources de prix
 *
 * GET    : liste les sources et leur état (lecture publique)
 * POST   : active/désactive une source (admin, body { sourceId, isActive })
 *
 * ⚠️ Aucune source n'est active par défaut. L'activation d'une source
 * nécessitant des identifiants échoue si la variable d'environnement est absente.
 */

import { NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin";
import {
  PRICE_SOURCES,
  getSource,
  isSourceUsable,
} from "@/lib/price-sources";

function requireAuth(request: Request): NextResponse | null {
  const cookieHeader = request.headers.get("cookie");
  if (!isAuthenticatedRequest(cookieHeader)) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const sources = PRICE_SOURCES.map((s) => ({
    id: s.id,
    name: s.name,
    type: s.type,
    isActive: s.isActive,
    requiresCredentials: s.requiresCredentials,
    credentialsConfigured: s.credentialsEnvVar
      ? Boolean(process.env[s.credentialsEnvVar])
      : null,
    usable: isSourceUsable(s.id),
    lastChecked: s.lastChecked,
    lastStatus: s.lastStatus,
    lastError: s.lastError,
    observationsCount: s.observationsCount,
  }));
  return NextResponse.json({ success: true, data: sources });
}

export async function POST(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { sourceId, isActive } = body as {
      sourceId?: string;
      isActive?: boolean;
    };

    if (!sourceId || typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "sourceId et isActive sont requis." },
        { status: 400 }
      );
    }

    const source = getSource(sourceId);
    if (!source) {
      return NextResponse.json({ error: "Source introuvable." }, { status: 404 });
    }

    if (isActive && source.requiresCredentials && source.credentialsEnvVar) {
      const value = process.env[source.credentialsEnvVar];
      if (!value || value === "your_api_key_here" || value.trim().length === 0) {
        return NextResponse.json(
          {
            error:
              "Impossible d'activer : la variable d'environnement " +
              source.credentialsEnvVar +
              " n'est pas configurée.",
          },
          { status: 400 }
        );
      }
    }

    source.isActive = isActive;
    return NextResponse.json({
      success: true,
      data: { id: source.id, isActive: source.isActive },
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la modification de la source." },
      { status: 500 }
    );
  }
}
