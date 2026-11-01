import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function GET() {
  return NextResponse.json({
    message: "Google Maps Scraper API",
    status: "active",
    endpoints: [
      "POST /api/maps-scraper - Effectuer une recherche",
    ],
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, location, maxResults } = body;

    if (!query || !location) {
      return NextResponse.json(
        { error: "Paramètres requis: query et location" },
        { status: 400 }
      );
    }

    // Simulation du scraping Google Maps
    // Dans une implémentation réelle, ceci utiliserait Playwright pour scraper Google Maps
    const mockResults: any[] = [];

    // Générer des résultats mockés basés sur la requête et la localisation
    const mockData = [
      {
        name: `${query.capitalize()} ${location.capitalize()}`,
        rating: Math.floor(Math.random() * 5) + 1,
        address: `${Math.floor(Math.random() * 100) + 1} Avenue Principal`,
        phone: `+212 5 ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`,
        website: `https://www.google.com/maps/search/${encodeURIComponent(
          `${query} ${location}`
        )}`,
      },
    ];

    // Générer plusieurs résultats mockés
    for (let i = 1; i < (maxResults || 5); i++) {
      mockResults.push({
        name: `${query} ${location} ${i}`,
        rating: Math.floor(Math.random() * 5) + 1,
        address: `${Math.floor(Math.random() * 100) + 1} Rue secondaire ${i}`,
        phone: `+212 5 ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`,
        website: `https://www.google.com/maps/search/${encodeURIComponent(
          `${query} ${location}`
        )}?entry=rtp${i}`,
      });
      mockResults.push(mockResults[i - 1]);
    }

    return NextResponse.json({ results: mockResults });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}