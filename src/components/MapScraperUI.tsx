"use client";

import { useState } from "react";
import { useMapsScraper } from "@/hooks/useMapsScraper";

type MapsScraperResult = {
  name: string;
  rating: number;
  address: string;
  phone: string;
  website: string;
};

interface MapScraperUIProps {
  onResultsReady?: (results: MapsScraperResult[]) => void;
}

export default function MapScraperUI({ onResultsReady }: MapScraperUIProps) {
  const { state, results, error, search } = useMapsScraper();
  const [params, setParams] = useState<{
    query: string;
    location: string;
    maxResults: number;
  }>({
    query: "",
    location: "",
    maxResults: 5,
  });

  const handleSearch = async () => {
    await search({
      query: params.query,
      location: params.location,
      maxResults: params.maxResults,
    });
    if (onResultsReady && results.length > 0) {
      onResultsReady(results);
    }
  };

  return (
    <div className="bg-black text-white p-6 sm:p-8 lg:p-10 rounded-xl border border-gray-700/50">
      <h2 className="text-2xl font-bold text-white mb-6">
        Google Maps Scraper
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Terme de recherche
          </label>
          <input
            type="text"
            value={params.query}
            onChange={(e) => setParams((prev) => ({ ...prev, query: e.target.value }))}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
            placeholder="Ex: restaurants"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Localisation
          </label>
          <input
            type="text"
            value={params.location}
            onChange={(e) => setParams((prev) => ({ ...prev, location: e.target.value }))}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
            placeholder="Ex: Casablanca"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nombre de résultats
          </label>
          <select
            value={params.maxResults}
            onChange={(e) => setParams((prev) => ({ ...prev, maxResults: Number(e.target.value) }))}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors"
          >
            <option value="3">3</option>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
        </div>

        <button
          onClick={handleSearch}
          disabled={state === "searching"}
          className="w-full bg-violet-600 hover:bg-violet-500 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state === "searching" ? "Recherche en cours..." : "Démarrer le scraping"}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="text-xl font-bold text-white mb-4">
            Résultats ({results.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((result, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-violet-500/50 transition-colors"
              >
                <h4 className="font-bold text-white">{result.name}</h4>
                <p className="text-violet-400 text-sm">
                  ⭐ {result.rating}/5
                </p>
                <p className="text-gray-400 text-sm line-clamp-2">
                  {result.address}
                </p>
                <p className="text-gray-400 text-sm">
                  📞 {result.phone}
                </p>
                <a
                  href={result.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-violet-400 text-sm underline underline-offset-2 hover:text-violet-300"
                >
                  🌐 Visiter le site
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
