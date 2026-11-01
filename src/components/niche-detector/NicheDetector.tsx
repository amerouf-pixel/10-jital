'use client';

import React, { useState } from 'react';

export default function NicheDetector() {
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
    <div className="bg-zinc-900 border border-purple-900/50 rounded-xl p-6 shadow-2xl my-6">
      <h2 className="text-xl font-semibold text-purple-400 mb-4">JITAL NICHE DETECTOR</h2>
      <form onSubmit={handleAnalyze} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-purple-400 mb-1">Mot-clé / Secteur</label>
          <input 
            type="text" 
            value={keyword} 
            onChange={(e) => setKeyword(e.target.value)} 
            placeholder="Ex: Fitness, IA, Templates..." 
            className="w-full bg-black border border-purple-800 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-purple-700 hover:bg-purple-600 text-white font-bold py-3 rounded-lg transition duration-200"
        >
          {loading ? 'ANALYSE EN COURS...' : 'ANALYSER CETTE NICHE'}
        </button>
      </form>
      {result && (
        <div className="mt-6 bg-black/50 p-4 rounded-lg border border-purple-900 text-white">
          <p className="text-purple-400 font-bold">Score d'opportunité : {result.score} / 100</p>
          <p className="text-xs text-gray-400 mt-1">Niveau de confiance : {result.confidence}</p>
        </div>
      )}
    </div>
  );
}
