import { NextResponse } from "next/server";
import {
  readProducts,
  writeProducts,
  generateProductId,
} from "@/lib/products-server";
import { isAuthenticatedRequest } from "@/lib/admin";

/**
 * 10-JITAL — API Admin Produits
 * Tous les endpoints requièrent une authentification via le cookie de session.
 * GET    : liste des produits
 * POST   : créer un produit
 * PUT    : modifier un produit (body contient id + champs)
 * DELETE : supprimer un produit (body contient id)
 * ⚠️ Aucune donnée n'est envoyée à un service externe.
 */

function requireAuth(request: Request): NextResponse | null {
  const cookieHeader = request.headers.get("cookie");
  if (!isAuthenticatedRequest(cookieHeader)) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  return null;
}

export async function GET(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const products = readProducts();
    return NextResponse.json({ success: true, data: products });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la lecture des produits." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      name,
      description,
      price,
      oldPrice,
      currency,
      category,
      image,
      inStock,
      merchantUrl,
      affiliateUrl,
    } = body as {
      name?: string;
      description?: string;
      price?: number;
      oldPrice?: number | null;
      currency?: string;
      category?: string;
      image?: string;
      inStock?: boolean;
      merchantUrl?: string | null;
      affiliateUrl?: string | null;
    };

    // Validation des champs requis
    if (!name || !description || price === undefined || !currency || !category || !image) {
      return NextResponse.json(
        { error: "Champs requis manquants : name, description, price, currency, category, image." },
        { status: 400 }
      );
    }

    const products = readProducts();
    const id = generateProductId(products.map((p) => p.id));
    const now = new Date().toISOString();

    const newProduct = {
      id,
      name,
      description,
      price: Number(price),
      oldPrice: oldPrice ?? null,
      currency,
      category,
      image: image.startsWith("http") ? image : image,
      inStock: inStock ?? true,
      rating: 0,
      reviews: 0,
      merchantUrl: merchantUrl ?? null,
      affiliateUrl: affiliateUrl ?? null,
      source: "admin",
      createdAt: now,
      updatedAt: now,
    };

    products.push(newProduct);
    writeProducts(products);

    return NextResponse.json({ success: true, data: newProduct });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la création du produit." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, ...updates } = body as {
      id?: string;
      name?: string;
      description?: string;
      price?: number;
      oldPrice?: number | null;
      currency?: string;
      category?: string;
      image?: string;
      inStock?: boolean;
      merchantUrl?: string | null;
      affiliateUrl?: string | null;
    };

    if (!id) {
      return NextResponse.json({ error: "ID du produit requis." }, { status: 400 });
    }

    const products = readProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
    }

    const updatedProduct = {
      ...products[index],
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.price !== undefined && { price: Number(updates.price) }),
      ...(updates.oldPrice !== undefined && { oldPrice: updates.oldPrice ?? null }),
      ...(updates.currency !== undefined && { currency: updates.currency }),
      ...(updates.category !== undefined && { category: updates.category }),
      ...(updates.image !== undefined && { image: updates.image }),
      ...(updates.inStock !== undefined && { inStock: updates.inStock }),
      ...(updates.merchantUrl !== undefined && { merchantUrl: updates.merchantUrl ?? null }),
      ...(updates.affiliateUrl !== undefined && { affiliateUrl: updates.affiliateUrl ?? null }),
      updatedAt: new Date().toISOString(),
    };

    products[index] = updatedProduct;
    writeProducts(products);

    return NextResponse.json({ success: true, data: updatedProduct });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la modification du produit." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID du produit requis." }, { status: 400 });
    }

    const products = readProducts();
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length === products.length) {
      return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
    }

    writeProducts(filtered);
    return NextResponse.json({ success: true, message: "Produit supprimé." });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la suppression du produit." }, { status: 500 });
  }
}