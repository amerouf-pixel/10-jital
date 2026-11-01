"use client";

import { useEffect, useState } from "react";
import { calculateDiscountPercent } from "@/lib/products-storage";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/products", {
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data: { data: any[] }) => {
        setProducts(data.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestion des produits</h1>
          <p className="text-gray-400">
            {products.length} produit(s) au total — données stockées dans data/products.json
          </p>
        </div>
        <a
          href="/admin/products/new"
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium transition-colors"
        >
          + Nouveau produit
        </a>
      </div>

      {products.length === 0 ? (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
          <p className="text-gray-400">Aucun produit enregistré.</p>
        </div>
      ) : (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800/30">
                <th className="px-4 py-3 text-gray-400 font-medium">Produit</th>
                <th className="px-4 py-3 text-gray-400 font-medium">Catégorie</th>
                <th className="px-4 py-3 text-gray-400 font-medium text-right">Prix</th>
                <th className="px-4 py-3 text-gray-400 font-medium text-right">Ancien prix</th>
                <th className="px-4 py-3 text-gray-400 font-medium text-right">Réduction</th>
                <th className="px-4 py-3 text-gray-400 font-medium">Stock</th>
                <th className="px-4 py-3 text-gray-400 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {products.map((p) => {
                const discount = calculateDiscountPercent(p.price, p.oldPrice);
                return (
                  <tr key={p.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 text-white">{p.name}</td>
                    <td className="px-4 py-3 text-gray-400">{p.category}</td>
                    <td className="px-4 py-3 text-white font-mono text-right">
                      {p.price} {p.currency}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-right">
                      {p.oldPrice !== null ? p.oldPrice : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {discount !== null ? (
                        <span className="text-violet-400 font-bold">-{discount}%</span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.inStock
                            ? "bg-green-900/30 text-green-400"
                            : "bg-red-900/30 text-red-400"
                        }`}
                      >
                        {p.inStock ? "Disponible" : "Rupture"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <a
                          href={`/admin/products/${p.id}`}
                          className="px-2 py-1 text-gray-400 hover:text-violet-400 text-sm"
                        >
                          Modifier
                        </a>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `Supprimer "${p.name}" ? Cette action est irréversible.`
                              )
                            ) {
                              fetch(`/api/admin/products?id=${p.id}`, {
                                method: "DELETE",
                              }).then(() => window.location.reload());
                            }
                          }}
                          className="px-2 py-1 text-red-400 hover:text-red-300 text-sm"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}