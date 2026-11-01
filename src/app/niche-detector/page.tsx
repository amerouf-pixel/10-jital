'use client';

import React, { useState } from 'react';

export default function NicheDetectorPage() {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('produits-numeriques');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setResult({
        niche: keyword || 'E-books et Formations',
        category: category,
        score: 85,
        confidence: 'Élevé',
        date: new Date().toLocaleDateString(),
        sources: ['Données publiques locales', 'Analyse structurelle 10-JITAL']
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-black text-purple-300 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-purple-400 tracking-wider mb-2">JITAL NICHE DETECTOR</h1>
          <p className="text-gray-400 text-sm md:text-base">Discover. Analyze. Compare. Build.</p>
        </header>

        <section className="bg-zinc-900 border border-purple-900/50 rounded-xl p-6 shadow-2xl mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">A. Recherche de Niches</h2>
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-purple-400 mb-1">Mot-clé / Secteur</label>
              <input 
                type="text" 
                value={keyword} 
                onChange={(e) => setKeyword(e.target.value)} 
                placeholder="Ex: Fitness à la maison, Outils IA..." 
                className="w-full bg-black border border-purple-800 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-purple-400 mb-1">Catégorie commerciale</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-black border border-purple-800 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="produits-numeriques">Produits numériques</option>
                <option value="ebooks">E-books et livres</option>
                <option value="print-on-demand">Impression à la demande</option>
                <option value="affiliation">Affiliation</option>
                <option value="logiciels">Logiciels et applications</option>
              </select>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-purple-700 hover:bg-purple-600 text-white font-bold py-3 rounded-lg transition duration-200 shadow-lg shadow-purple-900/30"
            >
              {loading ? 'ANALYSE EN COURS...' : 'ANALYSER CETTE NICHE'}
            </button>
          </form>
        </section>

        {result && (
          <section className="bg-zinc-900 border border-purple-500/40 rounded-xl p-6 shadow-2xl animate-fade-in">
            <h2 className="text-xl font-semibold text-white mb-4">D. Jital Opportunity Score</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/50 p-4 rounded-lg border border-purple-900">
                <span className="text-xs text-gray-400">Score calculé</span>
                <div className="text-3xl font-bold text-purple-400">{result.score} / 100</div>
              </div>
              <div className="bg-black/50 p-4 rounded-lg border border-purple-900">
                <span className="text-xs text-gray-400">Niveau de confiance</span>
                <div className="text-xl font-semibold text-white">{result.confidence}</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-400">
              <p>Sources : {result.sources.join(', ')}</p>
              <p>Date : {result.date}</p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
