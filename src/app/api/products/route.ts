import { NextResponse } from 'next/server';

const FALLBACK_URL = 'https://vuinybayqnnloaqewnsk.supabase.co';
const FALLBACK_ANON_KEY = 'sb_publishable_KYjDaE6Fdoiyt2CwTUOR4g_ig-BpwDb/';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '300';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
  const supabaseKey = FALLBACK_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  try {
    const res = await fetch(
      $/rest/v1/products?select=*&order=viral_score.desc&limit=$,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: Bearer $,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ products: [], error: errText }, { status: res.status });
    }

    const products = await res.json();
    return NextResponse.json({ products: Array.isArray(products) ? products : [] });
  } catch (err: any) {
    return NextResponse.json({ products: [], error: err?.message || 'Fetch error' }, { status: 500 });
  }
}