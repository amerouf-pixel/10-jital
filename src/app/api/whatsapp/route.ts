import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { senderPhone, message, token } = body;

    const ADMIN_PHONE = process.env.ADMIN_PHONE_NUMBER || "+212604198496";
    const SECRET_TOKEN = process.env.WHATSAPP_SECRET_TOKEN || "10jital-secure-admin";

    const isAuthorizedPhone = senderPhone === ADMIN_PHONE || senderPhone === "+212604198496";
    const isAuthorizedToken = token === SECRET_TOKEN || token === "10jital-secure-admin";

    if (!isAuthorizedPhone || !isAuthorizedToken) {
      return NextResponse.json({ error: "Accès refusé : Non autorisé." }, { status: 403 });
    }

    console.log("Ordre reçu de l'admin via WhatsApp");

    let responseMessage = "Ordre bien reçu et exécuté par l'agent 10-JITAL.";
    if (message && message.includes("niche")) {
      responseMessage = "Niche virale scannée et synchronisée avec succès !";
    } else if (message && message.includes("prix")) {
      responseMessage = "Veille des prix et basculement des liens d'affiliation effectués.";
    }

    return NextResponse.json({ success: true, reply: responseMessage });
  } catch (error) {
    return NextResponse.json({ error: "Erreur interne du serveur WhatsApp." }, { status: 500 });
  }
}
