import { NextResponse } from 'next/server';

const SUPABASE_URL = 'https://vuinybayqnnloaqewnsk.supabase.co';
const PUBLISHABLE_KEY = 'sb_publishable_KYjDaE6Fdoiyt2CwTUOR4g_ig-BpwDb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '300';

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL;
  const key = PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const headers: Record<string, string> = {
    apikey: key,
    'Content-Type': 'application/json',
  };
  if (key.startsWith('eyJ')) {
    headers['Authorization'] = `Bearer ${key}`;
  }

  try {
    const res = await fetch(
      `${url}/rest/v1/products?select=*&order=viral_score.desc&limit=${limit}`,
      {
        headers,
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