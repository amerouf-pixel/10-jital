"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";

interface StoredProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice: number | null;
  currency: string;
  category: string;
  image: string;
  inStock: boolean;
  rating: number;
  reviews: number;
  merchantUrl: string | null;
  affiliateUrl: string | null;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditProductPage() {
  // Suspense requis : useParams() ne doit pas bloquer le prerender (cacheComponents)
  return (
    <Suspense
      fallback={
        <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-gray-500 text-sm">Chargement…</div>
        </div>
      }
    >
      <EditProductContent />
    </Suspense>
  );
}

function EditProductContent() {
  // Next 16 : `params` passé en prop est une Promesse → useParams() côté client
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<StoredProduct | null>(null);
  const [form, setForm] = useState<StoredProduct | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/products`, {
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data: { data: StoredProduct[] }) => {
        const p = data.data.find((x) => x.id === params.id);
        if (p) {
          setProduct(p);
          setForm({ ...p });
        } else {
          setError("Produit introuvable.");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur lors du chargement.");
        setLoading(false);
      });
  }, [params.id]);

  const handleChange = (key: string, value: string | number | boolean | null) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : null));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/products`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur lors de la modification.");
        return;
      }

      setProduct(data.data);
      setForm({ ...data.data });
      setSuccess("Produit modifié avec succès.");
    } catch {
      setError("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!window.confirm(`Supprimer "${product?.name}" ?`)) return;
    fetch(`/api/admin/products?id=${params.id}`, { method: "DELETE" })
      .then((res) => {
        if (res.ok) {
          window.location.href = "/admin/products";
        } else {
          setError("Impossible de supprimer le produit.");
        }
      })
      .catch(() => setError("Erreur de connexion."));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black p-4">
        <p className="text-gray-400">Chargement…</p>
      </div>
    );
  }

  if (error || !product || !form) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black p-4">
        <div className="text-center">
          <p className="text-red-400">{error || "Produit introuvable."}</p>
          <a
            href="/admin/products"
            className="mt-4 text-violet-400 hover:underline"
          >
            Retour à la liste
          </a>
        </div>
      </div>
    );
  }

  const discountPercent =
    form.oldPrice && form.price
      ? Math.round(((form.oldPrice - form.price) / form.oldPrice) * 100)
      : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Modifier le produit</h1>
          <p className="text-gray-400">ID : {form.id}</p>
        </div>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg font-medium hover:bg-red-900/40 transition-colors"
        >
          Supprimer
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-green-900/20 border border-green-500/30 text-green-400 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nom du produit *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Catégorie *
            </label>
            <select
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
            >
              <option value="Électronique">Électronique</option>
              <option value="Audio">Audio</option>
              <option value="Téléphonie">Téléphonie</option>
              <option value="Marroquinerie">Marroquinerie</option>
              <option value="Maison">Maison</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Description *
          </label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            required
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Prix actuel *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">{form.currency}</span>
              <input
                type="number"
                value={form.price}
                onChange={(e) => handleChange("price", e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Ancien prix
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">{form.currency}</span>
              <input
                type="number"
                value={form.oldPrice ?? ""}
                onChange={(e) =>
                  handleChange("oldPrice", e.target.value ? parseFloat(e.target.value) : null)
                }
                className="w-full pl-8 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Devise
            </label>
            <select
              value={form.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="MAD">Dirham marocain (MAD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="USD">Dollar américain (USD)</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={form.inStock}
              onChange={(e) => handleChange("inStock", e.target.checked)}
              className="w-4 h-4 text-violet-600 bg-gray-700 border-gray-600 rounded focus:ring-violet-500"
            />
            <label className="ml-2 text-sm text-gray-300">En stock</label>
          </div>
        </div>

        {discountPercent !== null && (
          <div className="bg-violet-900/20 border border-violet-500/30 rounded-xl p-3">
            <span className="text-violet-400 text-sm font-medium">
              Réduction : -{discountPercent}%
            </span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            URL de l'image
          </label>
          <input
            type="url"
            value={form.image}
            onChange={(e) => handleChange("image", e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              URL marchand
            </label>
            <input
              type="url"
              value={form.merchantUrl ?? ""}
              onChange={(e) => handleChange("merchantUrl", e.target.value || null)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Lien affilié
            </label>
            <input
              type="url"
              value={form.affiliateUrl ?? ""}
              onChange={(e) => handleChange("affiliateUrl", e.target.value || null)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Enregistrement…" : "Enregistrer les modifications"}
          </button>
          <a
            href="/admin/products"
            className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors text-center"
          >
            Annuler
          </a>
        </div>
      </form>
    </div>
  );
}