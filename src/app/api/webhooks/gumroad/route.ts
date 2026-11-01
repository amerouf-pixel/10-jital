import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase';


/**
 * Recoit automatiquement les pings de vente Gumroad (Settings -> Advanced -> Ping)
 * et relie la commission au sub_id genere par /go/[slug].
 */
export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const payload: Record<string, string> = {};
    formData.forEach((value, key) => {
      payload[key] = String(value);
    });

    const priceCents = Number(payload.price || 0);
    const saleAmount = Number((priceCents / 100).toFixed(2));
    const commissionAmount = payload.affiliate_credit_amount_cents
      ? Number((Number(payload.affiliate_credit_amount_cents) / 100).toFixed(2))
      : saleAmount;

    // Extraction du sub_id passe via utm_content ou url_params
    let subId: string | null = payload['url_params[utm_content]'] || payload.utm_content || null;
    if (!subId && payload.url_params) {
      try {
        const parsed = JSON.parse(payload.url_params);
        subId = parsed.utm_content || parsed.subid || null;
      } catch {}
    }

    let productId: string | null = null;
    if (subId) {
      const { data: clickRow } = await supabase
        .from('click_logs')
        .select('product_id')
        .eq('sub_id', subId)
        .maybeSingle();
      productId = clickRow?.product_id || null;
    }

    await supabase.from('conversions').insert({
      sub_id: subId,
      product_id: productId,
      network: 'gumroad',
      sale_amount: saleAmount,
      commission_amount: commissionAmount,
      currency: (payload.currency || 'USD').toUpperCase(),
      status: payload.refunded === 'true' ? 'refunded' : 'approved',
      raw_payload: payload,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}