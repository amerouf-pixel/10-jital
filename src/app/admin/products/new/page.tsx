"use client";

import { useState } from "react";

export default function NewProductPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    oldPrice: "",
    currency: "MAD",
    category: "",
    image: "",
    inStock: true,
    merchantUrl: "",
    affiliateUrl: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: parseFloat(form.price) || 0,
          oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : null,
          currency: form.currency,
          category: form.category,
          image: form.image,
          inStock: form.inStock,
          merchantUrl: form.merchantUrl || null,
          affiliateUrl: form.affiliateUrl || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur lors de la création.");
        return;
      }

      setSuccess("Produit créé avec succès.");
      setForm({
        name: "",
        description: "",
        price: "",
        oldPrice: "",
        currency: "MAD",
        category: "",
        image: "",
        inStock: true,
        merchantUrl: "",
        affiliateUrl: "",
      });
    } catch {
      setError("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "Électronique",
    "Audio",
    "Téléphonie",
    "Marroquinerie",
    "Maison",
  ];

  const currencies = [
    { code: "MAD", label: "Dirham marocain" },
    { code: "EUR", label: "Euro" },
    { code: "USD", label: "Dollar américain" },
  ];

  const discountPercent =
    form.oldPrice && form.price
      ? Math.round(((parseFloat(form.oldPrice) - parseFloat(form.price)) / parseFloat(form.oldPrice)) * 100)
      : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Nouveau produit</h1>
        <p className="text-gray-400">
          Remplissez les champs pour ajouter un produit au catalogue. Aucune donnée
          n'est envoyée à un service externe.
        </p>
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
              placeholder="Ex: Montre connectée SportPro"
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
              <option value="">Sélectionner une catégorie</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
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
            placeholder="Décrivez le produit..."
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
                placeholder="899"
                className="w-full pl-8 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Ancien prix (optionnel)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">{form.currency}</span>
              <input
                type="number"
                value={form.oldPrice}
                onChange={(e) => handleChange("oldPrice", e.target.value)}
                placeholder="1099"
                className="w-full pl-8 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Devise *
            </label>
            <select
              value={form.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label} ({c.code})
                </option>
              ))}
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
              Réduction calculée : -{discountPercent}%
            </span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            URL de l'image *
          </label>
          <input
            type="url"
            value={form.image}
            onChange={(e) => handleChange("image", e.target.value)}
            placeholder="/demo/produit.jpg ou https://..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              URL marchand
            </label>
            <input
              type="url"
              value={form.merchantUrl}
              onChange={(e) => handleChange("merchantUrl", e.target.value)}
              placeholder="https://exemple.com/produit"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Lien affilié
            </label>
            <input
              type="url"
              value={form.affiliateUrl}
              onChange={(e) => handleChange("affiliateUrl", e.target.value)}
              placeholder="https://exemple.com/produit?ref=10jital"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Création…" : "Créer le produit"}
        </button>
      </form>
    </div>
  );
}