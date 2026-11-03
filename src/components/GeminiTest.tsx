"use client";

import { useState } from 'react';

export default function GeminiTest() {
  const [prompt, setPrompt] = useState<string>('');
  const [resultat, setResultat] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResultat('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Erreur inconnue');

      setResultat(data.text);
    } catch (err) {
      setResultat('Erreur : ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Tester Gemini</h2>
      <textarea
        rows={4}
        style={{ width: '100%', marginBottom: '10px' }}
        placeholder="Posez votre question..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <br />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Génération en cours...' : 'Envoyer'}
      </button>
      {resultat && (
        <div style={{ marginTop: '20px', whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: '15px' }}>
          {resultat}
        </div>
      )}
    </div>
  );
}