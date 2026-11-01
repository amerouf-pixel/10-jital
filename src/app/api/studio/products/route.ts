import { NextRequest, NextResponse } from 'next/server';

function buildSafeBridgeUrl({ slug, platform }: { slug: string; platform: string }): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://10-jital.vercel.app';
  return `${baseUrl}/go/${slug}?src=${platform}`;
}

const FALLBACK_PRODUCTS: Array<Record<string, any>> = [
  {
    id: 'local-viral-1',
    slug: 'mini-projecteur-4k-led',
    title: 'Mini Projecteur 4K Ultra HD Portable',
    description: 'Projecteur cinéma maison compact avec WiFi 6 et Bluetooth 5.2.',
    viral_score: 94,
    status: 'pending_review',
    hooks: [
      'Arrête de regarder tes films sur ton téléphone !',
      'Le cinéma 4K dans ta chambre pour une fraction du prix.'
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'local-viral-2',
    slug: 'lampe-cyberpunk-rgb',
    title: 'Barre LED Cyberpunk Sync Musique',
    description: 'Éclairage d ambiance RGB réactif au son pour setup gaming et studio.',
    viral_score: 89,
    status: 'pending_review',
    hooks: [
      'Transforme ton setup gaming en 3 secondes !',
      'L accessoire indispensable pour ton bureau en 2026.'
    ],
    created_at: new Date().toISOString(),
  }
];

function isAuthorized(req: NextRequest): boolean {
  const expectedPin = process.env.STUDIO_ADMIN_PIN;
  if (!expectedPin) return true;
  const providedPin = req.headers.get('x-studio-pin');
  return providedPin === expectedPin;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'PIN Studio invalide' }, { status: 401 });
  }

  const enrichedFallback = FALLBACK_PRODUCTS.map((p) => ({
    ...p,
    bridge_url: buildSafeBridgeUrl({ slug: p.slug, platform: 'tiktok' }),
    stats: { total_clicks: 12, approved_sales: 3, total_commission_usd: 45 },
  }));

  return NextResponse.json({ products: enrichedFallback, mode: 'local_fallback' });
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'PIN Studio invalide' }, { status: 401 });
  }

  const body = await req.json();
  const { id, action } = body as { id: string; action: 'approve_and_publish' | 'activate' | 'archive' };

  if (!id || !action) {
    return NextResponse.json({ error: 'Parametres id et action requis' }, { status: 400 });
  }

  const newStatus = action === 'archive' ? 'archived' : 'active';
  const found = FALLBACK_PRODUCTS.find((p) => p.id === id) || FALLBACK_PRODUCTS[0];
  found.status = newStatus;
  const updated = { ...found };

  let makeTriggered = false;
  const makeUrl = process.env.MAKE_WEBHOOK_URL;

  if (action === 'approve_and_publish' && makeUrl && updated) {
    try {
      await fetch(makeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: '10-JITAL',
          slug: updated.slug,
          title: updated.title,
          description: updated.description,
          viral_score: updated.viral_score,
          hook_video_9_16: Array.isArray(updated.hooks) && updated.hooks[0] ? updated.hooks[0] : updated.title,
          safe_links: {
            tiktok: buildSafeBridgeUrl({ slug: updated.slug, platform: 'tiktok' }),
            instagram: buildSafeBridgeUrl({ slug: updated.slug, platform: 'instagram' }),
            facebook: buildSafeBridgeUrl({ slug: updated.slug, platform: 'facebook' }),
            whatsapp: buildSafeBridgeUrl({ slug: updated.slug, platform: 'whatsapp' }),
          },
        }),
      });
      makeTriggered = true;
    } catch {
      makeTriggered = false;
    }
  }

  return NextResponse.json({ product: updated, makeTriggered });
}
