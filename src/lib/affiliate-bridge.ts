import { createClient } from '@supabase/supabase-js';

export function buildSafeBridgeUrl({ slug, platform }: { slug: string; platform: string }) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${base}/go/${slug}?ref=${platform}`;
}