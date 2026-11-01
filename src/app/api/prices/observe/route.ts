/**
 * 10-JITAL — API : enregistrer une observation de prix
 *
 * POST /api/prices/observe  (admin)
 * Body : { productId, productName, price, currency, sourceId?, sourceName?, merchantUrl?, verified? }
 *
 * Enregistre une observation réelle (saisie admin ou collectée depuis une source).
 * Détecte le changement par rapport à l'observation précédente.
 */

import { NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin";
import { recordObservation } from "@/lib/price-observation";
import { getSource, isSourceUsable } from "@/lib/price-sources";
import { appendExecutionLog } from "@/lib/execution-log";

function requireAuth(request: Request): NextResponse | null {
  const cookieHeader = request.headers.get("cookie");
  if (!isAuthenticatedRequest(cookieHeader)) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  return null;
}

export async function POST(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      productId,
      productName,
      price,
      currency,
      sourceId = "manual",
      sourceName = "Saisie manuelle",
      merchantUrl = null,
      verified = true,
    } = body as {
      productId?: string;
      productName?: string;
      price?: number;
      currency?: string;
      sourceId?: string;
      sourceName?: string;
      merchantUrl?: string | null;
      verified?: boolean;
    };

    if (!productId || !productName || price === undefined || !currency) {
      return NextResponse.json(
        { error: "Champs requis : productId, productName, price, currency." },
        { status: 400 }
      );
    }

    const source = getSource(sourceId);
    if (source && !isSourceUsable(sourceId) && source.isActive) {
      return NextResponse.json(
        { error: "Source non utilisable : identifiants manquants." },
        { status: 400 }
      );
    }

    const observation = recordObservation({
      productId,
      productName,
      price: Number(price),
      currency,
      sourceId,
      sourceName,
      merchantUrl: merchantUrl ?? null,
      verified: Boolean(verified),
    });

    appendExecutionLog({
      triggeredAt: new Date().toISOString(),
      trigger: "manual",
      sourcesChecked: 1,
      observationsRecorded: 1,
      errors: [],
      status: "completed",
      durationMs: 0,
    });

    return NextResponse.json({ success: true, data: observation });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement de l'observation." },
      { status: 500 }
    );
  }
}
