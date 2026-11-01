'use client';

import React, { useEffect, useState } from 'react';

interface StudioProduct {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  price_amount: number;
  currency_origin: string;
  commission_rate: number;
  viral_score: number;
  hooks: string[];
  status: 'pending' | 'active' | 'archived';
  in_stock: boolean;
  bridge_url: string;
  stats?: {
    total_clicks: number;
    approved_sales: number;
    total_commission_usd: number;
  };
}

export default function JitalStudioPage() {
  const [products, setProducts] = useState<StudioProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function loadProducts(customPin?: string) {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/studio/products', {
        headers: { 'x-studio-pin': customPin ?? pin },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur chargement Studio');
      setProducts(data.products || []);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur reseau');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleAction(id: string, action: 'approve_and_publish' | 'activate' | 'archive') {
    const res = await fetch('/api/studio/products', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-studio-pin': pin,
      },
      body: JSON.stringify({ id, action }),
    });
    if (res.ok) {
      await loadProducts();
    }
  }

  function copyBridgeLink(url: string, slug: string) {
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  }

  const visibleProducts = products.filter((p) => (filter === 'all' ? p.status !== 'archived' : p.status === filter));

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8 md:px-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* EN-TETE STUDIO 10-JITAL */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-violet-500/30 bg-zinc-950/80 rounded-2xl p-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-violet-400 font-semibold">
              Centre de Controle Temps Reel
            </span>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">
              10-JITAL <span className="text-violet-400">Automation Studio</span>
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Validez les pepites detectees par viral_scout.py, copiez vos liens ponts anti-ban et declenchez Make.com.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="password"
              placeholder="PIN Admin (optionnel)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="bg-black border border-violet-500/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-400"
            />
            <button
              onClick={() => loadProducts(pin)}
              className="bg-violet-600 hover:bg-violet-500 transition px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Actualiser
            </button>
          </div>
        </header>

        {/* FILTRES RAPIDES */}
        <div className="flex items-center gap-3">
          {(['all', 'pending', 'active'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
                filter === tab
                  ? 'bg-violet-600/20 border-violet-400 text-violet-300'
                  : 'bg-zinc-950 border-violet-500/20 text-zinc-400 hover:text-white'
              }`}
            >
              {tab === 'all' ? 'Tous les produits' : tab === 'pending' ? 'En attente (Pending)' : 'En ligne (Actifs)'}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="border border-red-500/40 bg-red-950/30 text-red-200 rounded-xl p-4 text-sm">
            {errorMsg} — Verifiez vos cles Supabase dans <code>.env.local</code>.
          </div>
        )}

        {/* GRILLE DES OPPORTUNITES */}
        {loading ? (
          <div className="text-zinc-400 text-sm py-12 text-center">Chargement des opportunites 10-JITAL...</div>
        ) : visibleProducts.length === 0 ? (
          <div className="border border-violet-500/30 bg-zinc-950 rounded-2xl p-10 text-center space-y-3">
            <p className="text-lg font-semibold">Aucun produit dans cette vue</p>
            <p className="text-zinc-400 text-sm">
              Lancez <code className="text-violet-400">python scripts/viral_scout.py</code> dans votre terminal pour detecter et enrichir vos premieres niches.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {visibleProducts.map((item) => (
              <article
                key={item.id}
                className="border border-violet-500/30 bg-zinc-950/90 rounded-2xl p-6 flex flex-col justify-between gap-5 hover:border-violet-400/60 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      Score Viral : {item.viral_score}/100
                    </span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        item.status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {item.status === 'active' ? 'ACTIF SUR BOUTIQUE' : 'EN ATTENTE VALIDATION'}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-white leading-snug">{item.title}</h2>
                  <p className="text-sm text-zinc-400 line-clamp-2">{item.description}</p>

                  {/* METRIQUES FINANCIERES & CLICS */}
                  <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                    <div className="bg-black border border-violet-500/20 rounded-xl p-2.5">
                      <div className="text-xs text-zinc-500">Prix / Comm.</div>
                      <div className="text-sm font-semibold text-white">
                        {item.price_amount} {item.currency_origin} ({item.commission_rate}%)
                      </div>
                    </div>
                    <div className="bg-black border border-violet-500/20 rounded-xl p-2.5">
                      <div className="text-xs text-zinc-500">Clics Traces</div>
                      <div className="text-sm font-semibold text-violet-300">
                        {item.stats?.total_clicks ?? 0}
                      </div>
                    </div>
                    <div className="bg-black border border-violet-500/20 rounded-xl p-2.5">
                      <div className="text-xs text-zinc-500">Gains Approuves</div>
                      <div className="text-sm font-semibold text-emerald-400">
                        ${Number(item.stats?.total_commission_usd ?? 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* HOOKS TIKTOK / REELS */}
                  {Array.isArray(item.hooks) && item.hooks.length > 0 && (
                    <div className="bg-black/80 border border-violet-500/20 rounded-xl p-3 space-y-1">
                      <div className="text-[11px] uppercase tracking-wider text-violet-400 font-semibold">
                        Hook Video IA (TikTok / Reels)
                      </div>
                      <p className="text-xs text-zinc-300 italic">&ldquo;{item.hooks[0]}&rdquo;</p>
                    </div>
                  )}
                </div>

                {/* ACTIONS EN 1 CLIC */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-violet-500/20">
                  <button
                    onClick={() => copyBridgeLink(item.bridge_url, item.slug)}
                    className="text-xs bg-zinc-900 hover:bg-zinc-800 border border-violet-500/30 px-3 py-2 rounded-lg text-violet-300 transition"
                  >
                    {copiedSlug === item.slug ? 'Lien /go copie !' : 'Copier lien /go anti-ban'}
                  </button>

                  <div className="flex items-center gap-2">
                    {item.status !== 'active' && (
                      <button
                        onClick={() => handleAction(item.id, 'approve_and_publish')}
                        className="text-xs bg-violet-600 hover:bg-violet-500 px-3.5 py-2 rounded-lg font-semibold text-white transition"
                      >
                        Approuver & Diffuser (Make)
                      </button>
                    )}
                    <button
                      onClick={() => handleAction(item.id, 'archive')}
                      className="text-xs bg-zinc-900 hover:bg-red-950/60 border border-zinc-700 hover:border-red-500/40 px-3 py-2 rounded-lg text-zinc-400 hover:text-red-300 transition"
                    >
                      Archiver
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}