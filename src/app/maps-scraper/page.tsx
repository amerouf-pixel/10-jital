'use client';

import React from 'react';

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white px-4 py-12 md:px-10">
      <div className="max-w-4xl mx-auto border border-violet-500/30 bg-zinc-950/90 rounded-2xl p-8 space-y-4">
        <span className="text-xs uppercase tracking-widest text-violet-400 font-semibold">10-JITAL Module</span>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Maps Scraper & Local Leads</h1>
        <p className="text-zinc-400 text-sm leading-relaxed">Extraction automatisée des opportunités commerciales locales ciblées.</p>
        <div className="pt-4 flex items-center gap-4">
          <a href="/studio" className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
            Ouvrir le Studio
          </a>
          <a href="/boutique" className="bg-zinc-900 hover:bg-zinc-800 border border-violet-500/30 text-violet-300 px-4 py-2 rounded-xl text-sm font-medium transition">
            Voir la Boutique
          </a>
        </div>
      </div>
    </main>
  );
}