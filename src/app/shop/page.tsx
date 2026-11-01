'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<string>('Tous');
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/products', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.error) setApiError(data.error);
        const list = Array.isArray(data) ? data : (data.products || []);
        setProducts(list);
        setLoading(false);
      })
      .catch(err => {
        setApiError(err.message);
        setLoading(false);
      });
  }, []);

  const categories = ['Tous', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  const filtered = category === 'Tous' ? products : products.filter(p => p.category === category);

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8 border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-purple-400">Boutique & Catalogue 10JITAL ({filtered.length} produits)</h1>
            <p className="text-zinc-400 text-sm mt-1">Catalogue viral synchronisé en direct avec Amazon Affiliation (10jital-21)</p>
          </div>
          <Link href="/" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition">
            Retour Accueil
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                category === cat ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-zinc-400">Chargement du catalogue en direct...</div>
        ) : apiError ? (
          <div className="text-center py-12 bg-red-950/40 border border-red-800 rounded-2xl p-6">
            <p className="text-red-300 font-bold">Erreur de connexion API Supabase :</p>
            <p className="text-xs text-red-400 mt-2">{apiError}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <p className="text-xl text-zinc-300 font-semibold">Aucun produit trouvé dans la table.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((p) => (
              <div key={p.id || p.slug} className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:border-purple-500 transition">
                <div>
                  <div className="relative h-52 mb-4 overflow-hidden rounded-lg bg-zinc-950">
                    <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 text-[10px] uppercase px-2 py-1 bg-purple-600 text-white rounded font-bold">
                      {p.category || 'Viral'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white line-clamp-2">{p.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2">{p.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-lg font-extrabold text-emerald-400">
                    {p.price_amount ? `${Number(p.price_amount).toFixed(2)} €` : 'Voir prix'}
                  </span>
                  <a href={p.affiliate_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition">
                    Acheter sur Amazon
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