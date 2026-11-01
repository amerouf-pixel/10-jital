"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Clé d'authentification invalide.");
        return;
      }

      // Redirige vers le tableau de bord après login
      window.location.href = "/admin";
    } catch {
      setError("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-violet-400 mb-2">10JITAL Admin</h1>
          <p className="text-gray-400 text-sm">Connexion requise</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Clé secrète admin
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Entrez ADMIN_SECRET_KEY"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
              required
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            ⚠️ Configurez la variable d'environnement ADMIN_SECRET_KEY pour activer l'accès admin.
          </p>
        </div>
      </div>
    </div>
  );
}