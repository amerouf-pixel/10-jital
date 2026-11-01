"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import type { TrendHistory, TrendObservation } from "@/lib/trend-types";
import { getTrendCategories } from "@/lib/trend-types";

/**
 * 10-JITAL — JITAL TREND RADAR
 * Composant principal : détection et suivi des tendances.
 *
 * Design : thème noir et violet, responsive, sobre et professionnel.
 * Aucune donnée commerciale n'est inventée.
 * Aucune clé API n'est requise.
 */

const CATEGORY_LABELS: Record<string, string> = {
  "digital-products": "Produits numériques",
  ebooks: "E-books et livres",
  "print-on-demand": "Impression à la demande",
  affiliation: "Affiliation",
  "physical-accessories": "Accessoires et produits physiques",
  "creator-tools": "Outils pour créateurs",
  software: "Logiciels et applications",
  other: "Autres niches",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function freshnessColor(f: "fresh" | "stale" | "empty"): string {
  switch (f) {
    case "fresh": return "text-green-400";
    case "stale": return "text-yellow-400";
    case "empty": return "text-red-400";
    default: return "text-gray-400";
  }
}

function freshnessBadge(f: "fresh" | "stale" | "empty"): string {
  switch (f) {
    case "fresh": return "bg-green-900/30 text-green-400 border border-green-700/40";
    case "stale": return "bg-yellow-900/30 text-yellow-400 border border-yellow-700/40";
    case "empty": return "bg-red-900/30 text-red-400 border border-red-700/40";
    default: return "bg-gray-900/30 text-gray-400 border border-gray-600";
  }
}

export default function TrendRadar() {
  const [trends, setTrends] = useState<TrendHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMarket, setSelectedMarket] = useState<string>("all");
  const [historyKeyword, setHistoryKeyword] = useState<string | null>(null);

  const categories = useMemo(() => getTrendCategories(), []);
  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.value, c.label])),
    [categories]
  );

  // Charger les tendances
  useEffect(() => {
    fetch("/api/trends")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setTrends(data.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger les tendances.");
        setLoading(false);
      });
  }, []);

  // Filtrer les tendances
  const filteredTrends = useMemo(() => {
    return trends.filter((t) => {
      const matchesSearch = t.keyword
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCat =
        selectedCategory === "all" || t.category === selectedCategory;
      const matchesMarket =
        selectedMarket === "all" || t.market.toLowerCase() === selectedMarket.toLowerCase();
      return matchesSearch && matchesCat && matchesMarket;
    });
  }, [trends, searchQuery, selectedCategory, selectedMarket]);

  // Marchés uniques pour le filtre
  const markets = useMemo(() => {
    const set = new Set<string>();
    for (const t of trends) set.add(t.market);
    return Array.from(set).sort();
  }, [trends]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleTransferToNiche = useCallback(
    (keyword: string, category: string, market: string) => {
      const params = new URLSearchParams({
        keyword,
        sector: category,
        productType: "",
        market,
        category: category as any,
      });
      window.location.href = `/niche-detector?${params.toString()}`;
    },
    []
  );

  const handleViewOpportunities = useCallback(() => {
    window.location.href = "/opportunity-hunter";
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Chargement des tendances…</p>
      </div>
    );
  }

  const historyTrend = historyKeyword
    ? trends.find((t) => t.keyword === historyKeyword)
    : undefined;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* En-tête */}
      <header className="border-b border-gray-800 bg-black/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-violet-500 font-bold text-xl tracking-tight hover:text-violet-400 transition-colors"
              >
                10JITAL
              </Link>
              <span className="text-xs text-gray-500 ml-2">· Trend Radar</span>
            </div>
            <Link
              href="/"
              className="text-sm font-medium text-gray-400 hover:text-violet-400 transition-colors"
            >
              ← Retour à la boutique
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Titre */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-semibold tracking-wider uppercase mb-4">
            JITAL TREND RADAR
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Détection de tendances
          </h1>
          <p className="text-gray-400">
            Repérez des sujets intéressants, suivez leurs observations et
            transmettez les pistes vers le Niche Detector ou l'Opportunity
            Hunter. Aucune donnée commerciale n'est inventée.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700/40 text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Recherche et filtres */}
        <section className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Recherche par mot-clé
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Rechercher une tendance…"
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Catégorie
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Marché
              </label>
              <select
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors"
              >
                <option value="all">Tous les marchés</option>
                {markets.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Liste des tendances */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-violet-400">
              Tendances observées
            </h2>
            <span className="px-2 py-1 rounded text-xs font-mono text-gray-400">
              {filteredTrends.length} tendance{filteredTrends.length > 1 ? "s" : ""}
            </span>
          </div>

          {filteredTrends.length === 0 ? (
            <div className="text-center py-16 bg-gray-900/30 rounded-2xl border border-gray-700">
              <div className="text-gray-500 text-3xl mb-3">📭</div>
              <h3 className="text-gray-300 font-medium mb-2">
                Aucune tendance enregistrée
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Aucune tendance n'a encore été observée.
              </p>
              <p className="text-xs text-gray-500 mb-6">
                Les tendances apparaissent ici lorsqu'une observation est
                enregistrée. Aucune source externe n'est connectée par défaut.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTrends.map((t) => (
                <div
                  key={`${t.keyword}-${t.category}-${t.market}`}
                  className="flex items-center justify-between p-4 rounded-xl border transition-colors bg-gray-900/30 border-gray-700 hover:border-gray-600"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-medium truncate ${t.freshness === "fresh" ? "text-green-400" : t.freshness === "stale" ? "text-yellow-400" : "text-red-400"}`}
                        title={t.keyword}
                      >
                        {t.keyword}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${freshnessBadge(t.freshness)}`}
                      >
                        {t.freshness.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <span>{categoryMap.get(t.category) || t.category}</span>
                      <span className="mx-1">•</span>
                      <span>{t.market}</span>
                      <span className="mx-1">•</span>
                      <span>{t.observationCount} obs.</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Dernière : {t.lastObserved ? formatDate(t.lastObserved) : "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setHistoryKeyword(
                        historyKeyword === t.keyword ? null : t.keyword
                      )}
                      className="px-3 py-1.5 text-xs font-medium text-violet-400 hover:text-violet-300 bg-violet-900/30 rounded hover:bg-violet-900/50 transition-colors"
                    >
                      {historyKeyword === t.keyword ? "Masquer l'historique" : "Historique"}
                    </button>
                    <button
                      onClick={() => handleTransferToNiche(t.keyword, t.category, t.market)}
                      className="px-3 py-1.5 text-xs font-medium text-violet-400 hover:text-violet-300 bg-violet-900/30 rounded hover:bg-violet-900/50 transition-colors"
                    >
                      → Niche Detector
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Historique d'une tendance */}
        {historyKeyword && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-violet-400">
                  Historique : {historyKeyword}
                </h2>
                <p className="text-sm text-gray-400">
                  Observations réelles enregistrées pour ce mot-clé.
                </p>
              </div>
              <button
                onClick={() => setHistoryKeyword(null)}
                className="text-sm text-gray-400 hover:text-white"
              >
                Fermer
              </button>
            </div>

            <div className="bg-gray-900/30 rounded-xl border border-gray-700 p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-3 rounded bg-gray-800/50 border border-gray-700/30">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Observations
                  </div>
                  <div className="text-xl font-bold text-white">
                    {historyTrend?.observationCount ?? 0}
                  </div>
                </div>
                <div className="p-3 rounded bg-gray-800/50 border border-gray-700/30">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Première observation
                  </div>
                  <div className="text-sm font-mono text-gray-300">
                    {historyTrend?.firstObserved ? formatDate(historyTrend.firstObserved) : "—"}
                  </div>
                </div>
                <div className="p-3 rounded bg-gray-800/50 border border-gray-700/30">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Dernière observation
                  </div>
                  <div className="text-sm font-mono text-gray-300">
                    {historyTrend?.lastObserved ? formatDate(historyTrend.lastObserved) : "—"}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {historyTrend
                  ?.observations.map((o: TrendObservation) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between p-3 rounded bg-gray-800/30 border border-gray-700/30"
                    >
                      <div>
                        <div className="text-sm font-medium text-white">
                          {o.value !== null ? o.value.toString() : "—"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {o.source} • {formatDate(o.observedAt)}
                        </div>
                        {o.note && (
                          <p className="text-xs text-gray-500 italic mt-1">
                            {o.note}
                          </p>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${o.verified ? "bg-green-900/30 text-green-400 border border-green-700/40" : "bg-gray-800 text-gray-500 border border-gray-600/30"}`}
                      >
                        {o.verified ? "Vérifié" : "Non vérifié"}
                      </span>
                    </div>
                  ))}
              </div>

              <p className="mt-4 text-xs text-gray-500">
                Ces observations sont des données réelles enregistrées localement.
                Elles ne mesurent pas la viralité, les ventes ou la rentabilité.
              </p>
            </div>
          </section>
        )}

        {/* Barre d'actions rapides */}
        <section className="mb-8">
          <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6 sm:p-8">
            <h3 className="text-sm font-semibold text-violet-400 mb-4 uppercase tracking-wider">
              Actions rapides
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleViewOpportunities}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold transition-colors"
              >
                Voir l'Opportunity Hunter
              </button>
              <p className="text-sm text-gray-500">
                Retrouvez les analyses de niches liées aux tendances observées.
              </p>
            </div>
          </div>
        </section>

        {/* Pied d'information */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>
            ⚠️ Aucune source externe n'est connectée par défaut. Les tendances
            affichées sont des observations locales enregistrées manuellement.
            Aucune donnée commerciale n'est inventée.
          </p>
        </div>
      </main>
    </div>
  );
}
