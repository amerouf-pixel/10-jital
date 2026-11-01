import { NextResponse } from "next/server";
import { verifyAdminKey, createAdminSessionCookie, createAdminLogoutCookie, isAdminConfigured } from "@/lib/admin";

/**
 * 10-JITAL — API Auth Admin
 * POST : vérifie la clé secrète fournie et crée une session cookie.
 * DELETE : détruit la session (déconnexion).
 * ⚠️ Aucune clé n'est stockée ni retournée. Seul le cookie de session est émis.
 */

export async function POST(request: Request) {
  try {
    if (!isAdminConfigured()) {
      return NextResponse.json(
        { error: "L'authentification admin n'est pas configurée. Définissez ADMIN_SECRET_KEY." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { key } = body as { key?: string };

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { error: "Clé d'authentification requise." },
        { status: 400 }
      );
    }

    if (!verifyAdminKey(key)) {
      return NextResponse.json(
        { error: "Clé d'authentification invalide." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });
    response.headers.set("Set-Cookie", createAdminSessionCookie());
    return response;
  } catch {
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.headers.set("Set-Cookie", createAdminLogoutCookie());
  return response;
}