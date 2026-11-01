"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import type { NicheAnalysis } from "@/lib/niche-detector";
import { getCategories } from "@/lib/niche-detector";

/**
 * 10-JITAL — JITAL OPPORTUNITY HUNTER
 * Composant principal : comparaison et chasse aux opportunités de niches.
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

function scoreColor(level: "low" | "medium" | "high"): string {
  switch (level) {
    case "high":
      return "text-green-400";
    case "medium":
      return "text-yellow-400";
    case "low":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
}

function scoreBadge(level: "low" | "medium" | "high"): string {
  switch (level) {
    case "high":
      return "bg-green-900/30 text-green-400 border border-green-700/40";
    case "medium":
      return "bg-yellow-900/30 text-yellow-400 border border-yellow-700/40";
    case "low":
      return "bg-red-900/30 text-red-400 border border-red-700/40";
    default:
      return "bg-gray-900/30 text-gray-400 border border-gray-600";
  }
}

function confidenceBadge(conf: "low" | "medium" | "high"): string {
  switch (conf) {
    case "high":
      return "bg-green-900/30 text-green-400 border border-green-700/40";
    case "medium":
      return "bg-yellow-900/30 text-yellow-400 border border-yellow-700/40";
    case "low":
      return "bg-red-900/30 text-red-400 border border-red-700/40";
    default:
      return "bg-gray-900/30 text-gray-400 border border-gray-600";
  }
}

/**
 * Retourne un plan d'action concret pour une niche.
 * Ce plan est généré localement à partir des données de l'analyse,
 * sans aucune recherche externe.
 */
function buildActionPlan(analysis: NicheAnalysis): Array<{
  step: number;
  title: string;
  description: string;
  type: "keyword" | "demand" | "competitor" | "price" | "source" | "criteria";
  items: string[];
  sourceNote: string;
}> {
  const { input, keywords, competition, score } = analysis;
  const plan: Array<{
    step: number;
    title: string;
    description: string;
    type:
      | "keyword"
      | "demand"
      | "competitor"
      | "price"
      | "source"
      | "criteria";
    items: string[];
    sourceNote: string;
  }> = [];

  // 1. Mots-clés à vérifier
  const kwItems: string[] = [...keywords.suggested.slice(0, 5)];
  if (input.keyword.trim()) kwItems.unshift(input.keyword);
  plan.push({
    step: 1,
    title: "Vérifier les mots-clés",
    description:
      "Ces mots-clés sont des suggestions logicielles, pas des volumes de recherche.",
    type: "keyword",
    items: kwItems,
    sourceNote: "Généré par le système 10-JITAL à partir de votre saisie.",
  });

  // 2. Informations sur la demande
  const demandItems: string[] = [
    `Chercher la demande pour "${input.keyword}" sur ${input.market}`,
    `Vérifier les tendances dans le secteur ${input.sector}`,
    `Consulter les places de marché pour ${input.productType}`,
  ];
  plan.push({
    step: 2,
    title: "Rechercher des informations sur la demande",
    description: "Aucune donnée de demande n'a été collectée automatiquement.",
    type: "demand",
    items: demandItems,
    sourceNote: "À vérifier manuellement par l'utilisateur.",
  });

  // 3. Concurrents à identifier
  const compItems =
    competition.competitors.length > 0
      ? competition.competitors
      : ["Aucun concurrent identifié (aucune source externe connectée)"];
  plan.push({
    step: 3,
    title: "Identifier les concurrents",
    description: competition.sufficient
      ? "Concurrents issus des sources connectées."
      : "Aucune source externe n'est connectée pour identifier des concurrents.",
    type: "competitor",
    items: compItems,
    sourceNote: competition.sufficient
      ? "Sources externes"
      : "Aucune source externe",
  });

  // 4. Prix et produits à comparer
  const priceItems: string[] = [
    `Comparer les prix de ${input.productType} sur ${input.market}`,
    `Vérifier la fourchette de prix pour "${input.keyword}"`,
    `Analyser les produits les plus vendus dans la catégorie ${CATEGORY_LABELS[input.category]}`,
  ];
  plan.push({
    step: 4,
    title: "Comparer les prix et produits",
    description: "Aucun prix n'a été observé automatiquement.",
    type: "price",
    items: priceItems,
    sourceNote: "À vérifier manuellement par l'utilisateur.",
  });

  // 5. Sources fiables à consulter
  const sourceItems: string[] = [
    "Sites officiels de statistiques du marché",
    "Places de marché et annuaires professionnels",
    "Forums et communautés du secteur",
    "Rapports sectoriels publics",
  ];
  plan.push({
    step: 5,
    title: "Consulter des sources fiables",
    description:
      "Ces suggestions sont génériques et doivent être adaptées à votre contexte.",
    type: "source",
    items: sourceItems,
    sourceNote: "Suggestions logicielles, pas des données collectées.",
  });

  // 6. Critères à vérifier avant de choisir
  const criteriaItems: string[] = [
    "La demande est-elle suffisante et durable ?",
    "La concurrence permet-elle une différenciation ?",
    "Les marges sont-elles compatibles avec vos objectifs ?",
    "Avez-vous les compétences ou ressources pour entrer sur ce marché ?",
  ];
  if (score.missingData.length > 0) {
    criteriaItems.push(`Compléter : ${score.missingData.join(", ")}`);
  }
  plan.push({
    step: 6,
    title: "Vérifier les critères avant de choisir",
    description: "Ces critères doivent être évalués manuellement avant toute décision.",
    type: "criteria",
    items: criteriaItems,
    sourceNote: "Checklist générée par le système, basée sur les données disponibles.",
  });

  return plan;
}

export default function OpportunityHunter() {
  const [analyses, setAnalyses] = useState<NicheAnalysis[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"hunter" | "compare" | "action">("hunter");
  const [selectedForAction, setSelectedForAction] = useState<string | null>(null);

  // Charger les analyses
  useEffect(() => {
    fetch("/api/niche-detector")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setAnalyses(data.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger les analyses.");
        setLoading(false);
      });
  }, []);

  // Charger les favoris
  useEffect(() => {
    fetch("/api/niche-detector")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          const favs = data.data
            .filter((a: any) => a.isFavorite === true)
            .map((a: any) => a.id);
          setFavoriteIds(new Set(favs));
        }
      })
      .catch(() => {
        // Ignorer l'erreur de chargement des favoris
      });
  }, []);

  const toggleFavorite = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/niche-detector/${id}/favorite`, {
        method: "POST",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (json.isFavorite) next.add(id);
          else next.delete(id);
          return next;
        });
      }
    } catch {
      // Ignorer
    }
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === analyses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(analyses.map((a) => a.id)));
    }
  }, [selectedIds, analyses.length]);

  // Données filtrées et triées
  const categories = useMemo(() => getCategories(), []);
  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.value, c.label])),
    [categories]
  );

  const filteredAnalyses = useMemo(() => {
    return [...analyses].sort((a, b) => {
      const sa = a.score.value ?? -1;
      const sb = b.score.value ?? -1;
      return sb - sa;
    });
  }, [analyses]);

  const selectedAnalyses = analyses.filter((a) => selectedIds.has(a.id));
  const hasComparison = selectedAnalyses.length >= 2;
  const hasSingleAction = selectedForAction !== null;
  const actionAnalysis = analyses.find((a) => a.id === selectedForAction);

  const toggleActiveTab = (tab: "hunter" | "compare" | "action") => {
    setActiveTab(tab);
    if (tab !== "action") setSelectedForAction(null);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* En-tête de page */}
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
              <span className="text-xs text-gray-500 ml-2">
                · Opportunity Hunter
              </span>
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
            JITAL OPPORTUNITY HUNTER
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Chasseur d'opportunités
          </h1>
          <p className="text-gray-400">
            Comparez vos niches analysées, identifiez les pistes les plus
            intéressantes et préparez votre plan d'étude. Aucune donnée
            commerciale n'est inventée.
          </p>
        </div>

        {loading && (
          <div className="text-center py-12 text-gray-400">
            <p>Chargement des analyses…</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-900/30 border border-red-700/40 text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Onglets */}
            <div className="flex gap-2 mb-8 border-b border-gray-800 pb-4">
              <button
                onClick={() => toggleActiveTab("hunter")}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === "hunter"
                    ? "bg-violet-600 text-white rounded-lg"
                    : "text-gray-400 hover:text-violet-400 hover:bg-gray-800 rounded-lg"
                }`}
              >
                Chasser les opportunités
              </button>
              {analyses.length > 0 && (
                <button
                  onClick={() => toggleActiveTab("compare")}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === "compare"
                      ? "bg-violet-600 text-white rounded-lg"
                      : "text-gray-400 hover:text-violet-400 hover:bg-gray-800 rounded-lg"
                  }`}
                >
                  Comparateur ({selectedIds.size} sélectionné{selectedIds.size > 1 ? "s" : ""})
                </button>
              )}
            </div>

            {/* Onglet Chasseur */}
            {activeTab === "hunter" && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-violet-400">
                    Vos niches analysées
                  </h2>
                  <span className="px-2 py-1 rounded text-xs font-mono text-gray-400">
                    {analyses.length} analyse{analyses.length > 1 ? "s" : ""}
                  </span>
                </div>

                {analyses.length === 0 ? (
                  <div className="text-center py-16 bg-gray-900/30 rounded-2xl border border-gray-700">
                    <div className="text-gray-500 text-3xl mb-3">
                      📭
                    </div>
                    <h3 className="text-gray-300 font-medium mb-2">
                      Aucune analyse enregistrée
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Aucune niche n'a encore été analysée.
                    </p>
                    <Link
                      href="/niche-detector"
                      className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold transition-colors"
                    >
                      Créer une première analyse
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredAnalyses.map((a) => {
                      const isFav = favoriteIds.has(a.id);
                      const isSel = selectedIds.has(a.id);
                      const scoreVal = a.score.value;
                      const scoreLvl = a.score.level;
                      const conf = a.score.confidence;
                      return (
                        <div
                          key={a.id}
                          className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                            isSel
                              ? "bg-violet-900/20 border-violet-500/50"
                              : "bg-gray-900/30 border-gray-700 hover:border-gray-600"
                          }`}
                        >
                          <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleSelect(a.id)}>
                            <input
                              type="checkbox"
                              checked={isSel}
                              onChange={() => toggleSelect(a.id)}
                              className="w-4 h-4 rounded text-violet-600 bg-gray-700 border-gray-600 focus:ring-violet-500"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`font-medium truncate ${isFav ? "text-yellow-400" : "text-white"}`}
                                  title={a.input.keyword}
                                >
                                  {a.input.keyword}
                                </span>
                                {isFav && (
                                  <span className="text-xs text-yellow-400">
                                    ★
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                <span>{formatDate(a.createdAt)}</span>
                                <span className="mx-1">•</span>
                                <span>
                                  {categoryMap.get(a.input.category) ||
                                    a.input.category}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleFavorite(a.id)}
                              className={`p-1.5 rounded transition-colors ${
                                isFav
                                  ? "bg-yellow-900/30 text-yellow-400"
                                  : "text-gray-500 hover:text-yellow-400"
                              }`}
                              title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
                            >
                              ★
                            </button>
                            <div className="text-right">
                              <div
                                className={`text-xs font-semibold ${scoreColor(scoreLvl)}`}
                              >
                                {scoreVal === null ? "—" : scoreVal} / 100
                              </div>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${confidenceBadge(conf)}`}
                              >
                                {conf.toUpperCase()}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedForAction(a.id);
                                toggleActiveTab("action");
                              }}
                              className="px-3 py-1.5 text-xs font-medium text-violet-400 hover:text-violet-300 bg-violet-900/30 rounded hover:bg-violet-900/50 transition-colors"
                            >
                              Plan d'action
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* Onglet Comparateur */}
            {activeTab === "compare" && analyses.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-violet-400">
                    Comparateur d'opportunités
                  </h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleSelectAll}
                      className="text-xs text-gray-400 hover:text-violet-400 underline underline-offset-4"
                    >
                      {selectedIds.size === analyses.length
                        ? "Tout désélectionner"
                        : "Tout sélectionner"}
                    </button>
                    <button
                      onClick={() => setSelectedIds(new Set())}
                      className="text-xs text-gray-400 hover:text-red-400 underline underline-offset-4"
                    >
                      Effacer
                    </button>
                  </div>
                </div>

                {selectedAnalyses.length === 0 ? (
                  <div className="bg-gray-900/30 rounded-2xl border border-gray-700 p-8 text-center">
                    <p className="text-gray-400 text-sm mb-3">
                      Sélectionnez au moins deux niches pour les comparer.
                    </p>
                    <p className="text-xs text-gray-500">
                      Cochez les cases à gauche de chaque niche dans l'onglet
                      "Chasser les opportunités".
                    </p>
                  </div>
                ) : (
                  <>
                    {selectedAnalyses.length === 1 && (
                      <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-6 mb-6">
                        <h3 className="text-sm font-semibold text-amber-400 mb-2 uppercase tracking-wider">
                          Sélectionnez au moins deux niches
                        </h3>
                        <p className="text-sm text-gray-300">
                          Une seule niche est sélectionnée. Le comparateur
                          nécessite au moins deux niches pour effectuer une
                          comparaison significative.
                        </p>
                      </div>
                    )}

                    {hasComparison && (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm border-collapse">
                            <thead>
                              <tr className="border-b border-gray-700">
                                <th className="pb-3 text-gray-400 font-medium">
                                  Niche
                                </th>
                                <th className="pb-3 text-gray-400 font-medium">
                                  Mot-clé
                                </th>
                                <th className="pb-3 text-gray-400 font-medium">
                                  Catégorie
                                </th>
                                <th className="pb-3 text-gray-400 font-medium text-right">
                                  Score
                                </th>
                                <th className="pb-3 text-gray-400 font-medium">
                                  Confiance
                                </th>
                                <th className="pb-3 text-gray-400 font-medium">
                                  Données manquantes
                                </th>
                                <th className="pb-3 text-gray-400 font-medium text-center">
                                  Favori
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                              {selectedAnalyses.map((a) => {
                                const isFav = favoriteIds.has(a.id);
                                return (
                                  <tr
                                    key={a.id}
                                    className="hover:bg-gray-800/30 transition-colors"
                                  >
                                    <td className="py-3 text-white font-medium">
                                      {a.input.keyword}
                                    </td>
                                    <td className="py-3 text-gray-300 font-mono">
                                      {a.input.sector}
                                    </td>
                                    <td className="py-3 text-gray-400">
                                      {
                                        categoryMap.get(a.input.category) ||
                                          a.input.category
                                      }
                                    </td>
                                    <td className="py-3 text-right">
                                      <span
                                        className={`font-bold ${scoreColor(a.score.level)}`}
                                      >
                                        {a.score.value === null
                                          ? "—"
                                          : a.score.value}
                                      </span>
                                    </td>
                                    <td className="py-3">
                                      <span
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${confidenceBadge(a.score.confidence)}`}
                                      >
                                        {a.score.confidence.toUpperCase()}
                                      </span>
                                    </td>
                                    <td className="py-3 text-gray-400">
                                      {a.score.missingData.length === 0 ? (
                                        <span className="text-green-400 text-xs">
                                          Aucune
                                        </span>
                                      ) : (
                                        <span
                                          className="text-xs"
                                          title={a.score.missingData.join(", ")}
                                        >
                                          {a.score.missingData.length}
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-3 text-center">
                                      <button
                                        onClick={() => toggleFavorite(a.id)}
                                        className={`p-1.5 rounded transition-colors ${
                                          isFav
                                            ? "bg-yellow-900/30 text-yellow-400"
                                            : "text-gray-500 hover:text-yellow-400"
                                        }`}
                                        title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
                                      >
                                        ★
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        <div className="mt-6 bg-gray-900/30 rounded-xl border border-gray-700 p-6">
                          <h3 className="text-sm font-semibold text-violet-400 mb-3 uppercase tracking-wider">
                            Synthèse de comparaison
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-3 rounded bg-gray-800/50 border border-gray-700/30">
                              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                Score moyen
                              </div>
                              <div className="text-xl font-bold text-white">
                                {selectedAnalyses.length > 0
                                  ? Math.round(
                                      selectedAnalyses.reduce(
                                        (sum, a) => sum + (a.score.value ?? 0),
                                        0
                                      ) / selectedAnalyses.length
                                    )
                                  : "—"}
                              </div>
                            </div>
                            <div className="p-3 rounded bg-gray-800/50 border border-gray-700/30">
                              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                Meilleur score
                              </div>
                              <div className="text-xl font-bold text-white">
                                {selectedAnalyses.length > 0
                                  ? Math.max(
                                      ...selectedAnalyses.map(
                                        (a) => a.score.value ?? 0
                                      )
                                    )
                                  : "—"}
                              </div>
                            </div>
                            <div className="p-3 rounded bg-gray-800/50 border border-gray-700/30">
                              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                Confiance élevée
                              </div>
                              <div className="text-xl font-bold text-white">
                                {selectedAnalyses.filter(
                                  (a) => a.score.confidence === "high"
                                ).length}
                              </div>
                            </div>
                          </div>
                          <p className="mt-3 text-xs text-gray-500">
                            Ce classement repose exclusivement sur les données
                            réellement enregistrées. Aucun résultat n'est inventé.
                          </p>
                        </div>
                      </>
                    )}
                  </>
                )}
              </section>
            )}

            {/* Onglet Plan d'action */}
            {activeTab === "action" && hasSingleAction && actionAnalysis && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <Link
                    href="/niche-detector"
                    className="text-sm text-violet-400 hover:text-violet-300"
                  >
                    ← Retour à l'analyse détaillée
                  </Link>
                  <button
                    onClick={() => {
                      setSelectedForAction(null);
                      toggleActiveTab("hunter");
                    }}
                    className="text-sm text-gray-400 hover:text-white"
                  >
                    Fermer le plan d'action
                  </button>
                </div>

                <div className="bg-gray-900/30 rounded-2xl border border-gray-700 p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs font-mono text-gray-500">
                      #{actionAnalysis.id.split("-")[1]}
                    </span>
                    <h2 className="text-xl font-bold text-white truncate max-w-[60%]">
                      {actionAnalysis.input.keyword}
                    </h2>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${scoreBadge(actionAnalysis.score.level)}`}
                    >
                      Score{" "}
                      {actionAnalysis.score.value === null
                        ? "—"
                        : actionAnalysis.score.value}
                    </span>
                  </div>

                  <div className="space-y-6">
                    {buildActionPlan(actionAnalysis).map((item) => (
                      <div
                        key={item.step}
                        className="p-4 rounded-lg border border-gray-700/30 bg-gray-800/30"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center">
                              {item.step}
                            </span>
                            <h3 className="font-semibold text-white">
                              {item.title}
                            </h3>
                          </div>
                          <span
                          className={`text-xs font-mono uppercase tracking-wider text-gray-500`}
                        >
                          {item.type}
                        </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">
                          {item.description}
                        </p>
                        <ul className="space-y-1 text-sm text-gray-300">
                          {item.items.map((it, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-violet-500 mt-0.5">
                                ›
                              </span>
                              <span>{it}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-3 text-xs text-gray-500 italic">
                          Source : {item.sourceNote}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 rounded bg-amber-900/20 border border-amber-700/30">
                    <h3 className="text-sm font-semibold text-amber-400 mb-2 uppercase tracking-wider">
                      Rappel important
                    </h3>
                    <p className="text-sm text-gray-300">
                      Ce plan d'action est généré localement par le système
                      10-JITAL. Il ne représente aucune recherche externe
                      effectuée et ne garantit pas qu'une niche sera rentable.
                      Vérifiez chaque point manuellement avant de prendre une
                      décision.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {activeTab === "action" && !hasSingleAction && (
              <div className="text-center py-16 bg-gray-900/30 rounded-2xl border border-gray-700">
                <p className="text-gray-400 text-sm mb-3">
                  Sélectionnez une niche pour consulter son plan d'action.
                </p>
                <button
                  onClick={() => toggleActiveTab("hunter")}
                  className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold transition-colors"
                >
                  Retour à la liste
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
