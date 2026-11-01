import { NextRequest, NextResponse } from "next/server";

/**
 * 10-JITAL — Webhook Messenger (partage de produits)
 * - GET  : vérification de l'abonnement par Meta (hub.challenge / MESSENGER_VERIFY_TOKEN)
 * - POST : réception des événements "messages" et "messaging_postbacks" (écoutes du partage)
 */

const VERIFY_TOKEN_ENV = "MESSENGER_VERIFY_TOKEN";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const expectedToken = process.env[VERIFY_TOKEN_ENV];

  if (mode === "subscribe" && token && challenge) {
    if (!expectedToken) {
      return NextResponse.json(
        { error: "MESSENGER_VERIFY_TOKEN non configuré côté serveur" },
        { status: 503 }
      );
    }
    if (token !== expectedToken) {
      return NextResponse.json({ error: "Verify token invalide" }, { status: 403 });
    }
    return new NextResponse(challenge, {
      status: 200,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  return NextResponse.json(
    {
      ok: true,
      webhook: "messenger",
      endpoint: "/api/webhook/messenger",
      usage:
        "Configurez l'URL https://10-jital.vercel.app/api/webhook/messenger dans l'App Meta (Webhooks Messenger), avec le même MESSENGER_VERIFY_TOKEN, puis abonnez les champs 'messages' et 'messaging_postbacks'.",
      verified: false,
    },
    { status: 200 }
  );
}

interface MessengerEvent {
  sender?: { id?: string };
  recipient?: { id?: string };
  timestamp?: number;
  message?: {
    is_echo?: boolean;
    text?: string;
    attachments?: Array<Record<string, unknown>>;
    share?: { link?: string };
  };
  postback?: { title?: string; payload?: string };
}

export async function POST(request: NextRequest) {
  let body: { object?: string; entry?: Array<{ messaging?: MessengerEvent[] }> };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  if (body?.object !== "page") {
    return NextResponse.json({ ok: true, ignored: "objet non-attended" }, { status: 200 });
  }

  const events: MessengerEvent[] = [];
  for (const entry of body.entry ?? []) {
    for (const item of entry.messaging ?? []) {
      events.push(item);
      // Partage de produit via Messenger : écho avec pièce jointe (share_response)
      if (item.message?.is_echo && item.message.attachments?.length) {
        const sharedLink = item.message.attachments
          .map((a) => (a as { payload?: { url?: string } }).payload?.url)
          .find(Boolean);
        console.log(
          `Partage produit via Messenger : ${typeof sharedLink === "string" ? sharedLink : "contenu partagé"} (sender ${item.sender?.id})`
        );
      }
    }
  }

  // Toujours 200 : Meta exige un accusé de réception immédiat
  return NextResponse.json({ ok: true, received: events.length }, { status: 200 });
}
