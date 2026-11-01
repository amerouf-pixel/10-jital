"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import type {
  ProductStudioProject,
  ProductStudioInput,
  ProductStudioType,
  ProductStudioLanguage,
  ProductStudioStatus,
} from "@/lib/product-studio-types";
import {
  PRODUCT_STUDIO_TYPES,
  PRODUCT_STUDIO_LANGUAGES,
  PRODUCT_STATUS_LABELS,
  generateProjectContent,
} from "@/lib/product-studio-types";

/**
 * 10-JITAL — JITAL PRODUCT STUDIO
 * Composant principal : création et gestion de produits numériques.
 *
 * Design : thème noir et violet, responsive, sobre et professionnel.
 * Aucune donnée commerciale n'est inventée.
 * Aucun modèle d'IA externe n'est appelé — génération locale déterministe.
 */

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function typeLabel(t: ProductStudioType): string {
  const found = PRODUCT_STUDIO_TYPES.find((c) => c.value === t);
  return found ? found.label : t;
}

function languageLabel(l: ProductStudioLanguage): string {
  const found = PRODUCT_STUDIO_LANGUAGES.find((c) => c.value === l);
  return found ? found.label : l;
}

function statusLabel(s: ProductStudioStatus): string {
  return PRODUCT_STATUS_LABELS[s] || s;
}

function statusColor(s: ProductStudioStatus): string {
  switch (s) {
    case "idea": return "text-gray-400";
    case "draft": return "text-yellow-400";
    case "ready": return "text-green-400";
    case "published": return "text-blue-400";
    default: return "text-gray-400";
  }
}

export default function ProductStudio() {
  const [projects, setProjects] = useState<ProductStudioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state for create/edit
  const [form, setForm] = useState<ProductStudioInput>({
    name: "",
    type: "ebook",
    niche: "",
    audience: "",
    language: "fr",
    idea: "",
    commercialObjective: "",
    indicativePrice: null,
    deliveryFormat: null,
  });

  // Edit state (full project being edited)
  const [editProject, setEditProject] = useState<ProductStudioProject | null>(null);

  // Charger les projets
  useEffect(() => {
    fetch("/api/product-studio")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setProjects(data.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger les projets.");
        setLoading(false);
      });
  }, []);

  const handleCreate = useCallback(async () => {
    if (!form.name.trim()) {
      setError("Le nom du produit est requis.");
      return;
    }
    if (!form.niche.trim()) {
      setError("La niche ou le secteur est requis.");
      return;
    }
    if (!form.audience.trim()) {
      setError("Le public cible est requis.");
      return;
    }
    if (!form.idea.trim()) {
      setError("La description de l'idée est requise.");
      return;
    }
    if (!form.commercialObjective.trim()) {
      setError("L'objectif commercial est requis.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/product-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || "Échec de la création.");
        setLoading(false);
        return;
      }

      setProjects((prev) => [json.data, ...prev]);
      setActiveTab("list");
      setForm({
        name: "", type: "ebook", niche: "", audience: "", language: "fr",
        idea: "", commercialObjective: "", indicativePrice: null, deliveryFormat: null,
      });
      setError(null);
    } catch {
      setError("Erreur réseau lors de la création.");
    } finally {
      setLoading(false);
    }
  }, [form]);

  const handleUpdate = useCallback(async () => {
    if (!editProject) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/product-studio/${editProject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editProject.id,
          ...form,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || "Échec de la mise à jour.");
        setLoading(false);
        return;
      }

      setProjects((prev) =>
        prev.map((p) => (p.id === editProject.id ? json.data : p))
      );
      setEditProject(null);
      setActiveTab("list");
      setError(null);
    } catch {
      setError("Erreur réseau lors de la mise à jour.");
    } finally {
      setLoading(false);
    }
  }, [editProject, form]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Supprimer ce projet ? Cette action est irréversible.")) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/product-studio/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || "Échec de la suppression.");
        setLoading(false);
        return;
      }

      setProjects((prev) => prev.filter((p) => p.id !== id));
      setError(null);
    } catch {
      setError("Erreur réseau lors de la suppression.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGenerateContent = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/product-studio/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, _generate: true }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || "Échec de la génération.");
        setLoading(false);
        return;
      }

      setProjects((prev) =>
        prev.map((p) => (p.id === id ? json.data : p))
      );
      setEditProject(json.data);
      setActiveTab("edit");
      setError(null);
    } catch {
      setError("Erreur réseau lors de la génération.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEdit = useCallback((project: ProductStudioProject) => {
    setEditProject(project);
    setForm({
      name: project.name,
      type: project.type,
      niche: project.niche,
      audience: project.audience,
      language: project.language,
      idea: project.idea,
      commercialObjective: project.commercialObjective,
      indicativePrice: project.indicativePrice,
      deliveryFormat: project.deliveryFormat,
    });
    setActiveTab("edit");
  }, []);

  const handleNew = useCallback(() => {
    setEditProject(null);
    setForm({
      name: "", type: "ebook", niche: "", audience: "", language: "fr",
      idea: "", commercialObjective: "", indicativePrice: null, deliveryFormat: null,
    });
    setActiveTab("create");
    setError(null);
  }, []);

  const sortedProjects = useMemo(() => {
    return [...projects].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [projects]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Chargement des projets…</p>
      </div>
    );
  }

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
              <span className="text-xs text-gray-500 ml-2">· Product Studio</span>
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
            JITAL PRODUCT STUDIO
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Atelier de création de produits
          </h1>
          <p className="text-gray-400">
            Transformez une idée en produit numérique structuré, préparé pour
            la vente. Aucun contenu n'est généré par une IA externe — tout est
            produit localement à partir de vos informations.
          </p>
        </div>

        {loading && (
          <div className="text-center py-12 text-gray-400">
            <p>Chargement des projets…</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-900/30 border border-red-700/40 text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Liste des projets */}
        {activeTab === "list" && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-violet-400">Vos produits</h2>
              <button
                onClick={handleNew}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold transition-colors"
              >
                + Nouveau produit
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-16 bg-gray-900/30 rounded-2xl border border-gray-700">
                <div className="text-gray-500 text-3xl mb-3">📦</div>
                <h3 className="text-gray-300 font-medium mb-2">Aucun produit pour le moment</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Aucun produit n'a encore été créé.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedProjects.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-4 rounded-xl border transition-colors bg-gray-900/30 border-gray-700 hover:border-gray-600"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium truncate ${statusColor(p.status)}`}
                          title={p.name}
                        >
                          {p.name}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${statusColor(p.status)}`}
                        >
                          {statusLabel(p.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <span>{typeLabel(p.type)}</span>
                        <span className="mx-1">•</span>
                        <span>{languageLabel(p.language)}</span>
                        <span className="mx-1">•</span>
                        <span>{formatDate(p.updatedAt)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {p.idea}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(p)}
                        className="px-3 py-1.5 text-xs font-medium text-violet-400 hover:text-violet-300 bg-violet-900/30 rounded hover:bg-violet-900/50 transition-colors"
                      >
                        Modifier
                      </button>
                      {p.status !== "idea" && (
                        <button
                          onClick={() => handleGenerateContent(p.id)}
                          className="px-3 py-1.5 text-xs font-medium text-green-400 hover:text-green-300 bg-green-900/30 rounded hover:bg-green-900/50 transition-colors"
                        >
                          Générer
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 bg-red-900/30 rounded hover:bg-red-900/50 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Formulaire de création / édition */}
        {(activeTab === "create" || activeTab === "edit") && (
          <section className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-violet-400">
                {activeTab === "create" ? "Nouveau produit" : "Modifier le produit"}
              </h2>
              <button
                onClick={() => {
                  setActiveTab("list");
                  setEditProject(null);
                }}
                className="text-sm text-gray-400 hover:text-white"
              >
                Annuler
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded bg-red-900/30 border border-red-700/40 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (activeTab === "create") handleCreate();
                else handleUpdate();
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nom du produit
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Guide du télétravail au Maroc"
                  className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Type de produit
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as ProductStudioType })}
                  className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors"
                >
                  {PRODUCT_STUDIO_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Niche / secteur
                </label>
                <input
                  type="text"
                  value={form.niche}
                  onChange={(e) => setForm({ ...form, niche: e.target.value })}
                  placeholder="Ex: Productivité, Cuisine, Électronique"
                  className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors"
                />
              </div>

              <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Public cible
                </label>
                <input
                  type="text"
                  value={form.audience}
                  onChange={(e) => setForm({ ...form, audience: e.target.value })}
                  placeholder="Ex: Freelances, Étudiants, Parents"
                  className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Langue
                </label>
                <select
                  value={form.language}
                  onChange={(e) =>
                    setForm({ ...form, language: e.target.value as ProductStudioLanguage })
                  }
                  className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors"
                >
                  {PRODUCT_STUDIO_LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description de l'idée
                </label>
                <textarea
                  value={form.idea}
                  onChange={(e) => setForm({ ...form, idea: e.target.value })}
                  rows={3}
                  placeholder="Décrivez votre idée de produit…"
                  className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Objectif commercial
                </label>
                <textarea
                  value={form.commercialObjective}
                  onChange={(e) => setForm({ ...form, commercialObjective: e.target.value })}
                  rows={3}
                  placeholder="Ex: Vendre 50 exemplaires le premier mois"
                  className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Prix indicatif (MAD)
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.indicativePrice ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      indicativePrice: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  placeholder="Ex: 299"
                  className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors"
                />
              </div>

              <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Format de livraison
                </label>
                <input
                  type="text"
                  value={form.deliveryFormat ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, deliveryFormat: e.target.value || null })
                  }
                  placeholder="Ex: Téléchargement ZIP, Lien Google Drive"
                  className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors"
                />
              </div>

              <div className="col-span-full flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-auto px-8 py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      En cours…
                    </span>
                  ) : activeTab === "create" ? (
                    "Créer le produit"
                  ) : (
                    "Enregistrer les modifications"
                  )}
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
