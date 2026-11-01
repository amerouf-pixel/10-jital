import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Lecture de l'URL de la requête pour forcer le rendu dynamique sans export incompatible
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '300';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vuinybayqnnloaqewnsk.supabase.co';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseKey || supabaseKey.includes('placeholder')) {
    return NextResponse.json(
      { products: [], error: 'Missing valid Supabase API key in environment variables' },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/products?select=*&order=viral_score.desc,created_at.desc&limit=${limit}`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
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