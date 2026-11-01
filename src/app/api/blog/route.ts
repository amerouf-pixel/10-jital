import { NextResponse } from "next/server";
import { DEMO_BLOG_POSTS } from "@/lib/demo-data";
import type { BlogPost } from "@/lib/demo-data";

/**
 * 10-JITAL — API Route : Articles de blog
 * ⚠️ Retourne les données de démonstration uniquement.
 * Aucune source réelle n'est connectée.
 */

function validateBlogQuery(query: URLSearchParams): { category?: string } | null {
  const category = query.get("category") || undefined;
  return { category };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = validateBlogQuery(searchParams);

    if (!filters) {
      return NextResponse.json(
        { error: "Paramètres de requête invalides" },
        { status: 400 }
      );
    }

    let filtered = [...DEMO_BLOG_POSTS];

    if (filters.category) {
      filtered = filtered.filter((p) => p.category === filters.category);
    }

    const posts: BlogPost[] = filtered.map((p) => ({
      id: p.id,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      author: p.author,
      date: p.date,
      category: p.category,
      image: p.image,
    }));

    return NextResponse.json({
      success: true,
      count: posts.length,
      data: posts,
      source: "demo", // ⚠️ Données de démonstration
      note: "Aucune source réelle n'est connectée.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}