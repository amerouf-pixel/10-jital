'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.products || []);
        setProducts(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-10 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-4xl font-black text-purple-400">10JITAL</h1>
            <p className="text-zinc-400 text-sm mt-1">Sélection automatisée de produits viraux ({products.length} pépites actives)</p>
          </div>
          <Link href="/shop" className="px-6 py-3 bg-purple-600 hover:bg-purple-500 font-bold text-sm rounded-xl transition">
            Voir tous les produits ({products.length})
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-zinc-400">Chargement des tendances...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.slice(0, 24).map((p) => (
              <div key={p.id || p.slug} className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:border-purple-500 transition">
                <div>
                  <div className="relative h-48 mb-4 overflow-hidden rounded-lg bg-zinc-950">
                    <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 text-[10px] uppercase px-2 py-1 bg-purple-600 text-white rounded font-bold">
                      {p.category || 'Tendance'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white line-clamp-2">{p.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{p.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-base font-extrabold text-emerald-400">
                    {p.price_amount ? `${Number(p.price_amount).toFixed(2)} €` : 'Offre'}
                  </span>
                  <a href={p.affiliate_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition">
                    Voir l'offre
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}