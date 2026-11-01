/**
 * 10-JITAL — JITAL NICHE DETECTOR
 * Logique métier : détection et classement de niches commerciales.
 *
 * ⚠️ Aucune donnée commerciale n'est inventée.
 * Aucune clé API n'est requise ni exposée.
 * Le score est calculé uniquement à partir des indicateurs disponibles
 * et documentés. Les sources externes ne sont pas connectées par défaut.
 */

export type NicheCategory =
  | "digital-products"
  | "ebooks"
  | "print-on-demand"
  | "affiliation"
  | "physical-accessories"
  | "creator-tools"
  | "software"
  | "other";

export interface NicheInput {
  keyword: string;
  sector: string;
  productType: string;
  market: string;
  category: NicheCategory;
}

export interface NicheAnalysis {
  id: string;
  createdAt: string;
  input: NicheInput;
  keywords: {
    observed: string[];
    suggested: string[];
  };
  competition: {
    competitors: string[];
    sources: string[];
    note: string;
    sufficient: boolean;
  };
  score: {
    value: number | null;
    max: number;
    level: "low" | "medium" | "high";
    confidence: "low" | "medium" | "high";
    criteria: Array<{
      name: string;
      weight: number;
      score: number | null;
      note: string;
    }>;
    missingData: string[];
  };
  sources: Array<{
    name: string;
    type: "user" | "system" | "external";
    verified: boolean;
    collectedAt: string;
  }>;
}

const CATEGORY_LABELS: Record<NicheCategory, string> = {
  "digital-products": "Produits numériques",
  ebooks: "E-books et livres",
  "print-on-demand": "Impression à la demande",
  affiliation: "Affiliation",
  "physical-accessories": "Accessoires et produits physiques",
  "creator-tools": "Outils pour créateurs",
  software: "Logiciels et applications",
  other: "Autres niches",
};

/**
 * Retourne la liste des catégories disponibles.
 */
export function getCategories(): { value: NicheCategory; label: string }[] {
  return Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value: value as NicheCategory,
    label,
  }));
}

/**
 * Génère un identifiant unique simple.
 */
function generateId(): string {
  return `niche-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Extrait des mots-clés suggérés à partir des informations utilisateur.
 * Ce sont des suggestions générées par le logiciel, pas des volumes de recherche.
 */
function suggestKeywords(input: NicheInput): string[] {
  const base = [input.keyword, input.sector, input.productType, input.category];
  const suggestions = new Set<string>();
  for (const term of base) {
    if (term.trim()) suggestions.add(term.trim());
  }
  // Expressions composées simples (suggestions logicielles, non des données de recherche)
  if (input.keyword.trim() && input.market.trim()) {
    suggestions.add(`${input.keyword.trim()} ${input.market.trim()}`);
  }
  if (input.productType.trim() && input.category) {
    suggestions.add(`${input.productType.trim()} ${CATEGORY_LABELS[input.category]}`);
  }
  return Array.from(suggestions).slice(0, 10);
}

/**
 * Calcule le score d'opportunité uniquement à partir des indicateurs disponibles.
 * Retourne null si les données sont insuffisantes.
 */
function calculateScore(input: NicheInput): {
  value: number | null;
  max: number;
  level: "low" | "medium" | "high";
  confidence: "low" | "medium" | "high";
  criteria: Array<{
    name: string;
    weight: number;
    score: number | null;
    note: string;
  }>;
  missingData: string[];
} {
  const max = 100;
  const criteria = [
    {
      name: "Complétude des informations",
      weight: 40,
      score: null as number | null,
      note: "",
    },
    {
      name: "Précision du mot-clé principal",
      weight: 25,
      score: null as number | null,
      note: "",
    },
    {
      name: "Cohérence secteur / type de produit",
      weight: 20,
      score: null as number | null,
      note: "",
    },
    {
      name: "Marché et catégorie définis",
      weight: 15,
      score: null as number | null,
      note: "",
    },
  ];

  const missingData: string[] = [];

  // Complétude : tous les champs remplis
  const allFilled =
    input.keyword.trim() &&
    input.sector.trim() &&
    input.productType.trim() &&
    input.market.trim() &&
    input.category !== "other";
  criteria[0].score = allFilled ? 40 : Math.round((Object.values(input).filter((v: any) => String(v).trim()).length / 5) * 40);
  if (!allFilled) missingData.push("Tous les champs de recherche ne sont pas remplis");

  // Précision du mot-clé : longueur raisonnable, pas trop générique
  const kw = input.keyword.trim();
  if (!kw) {
    criteria[1].score = 0;
    missingData.push("Mot-clé principal manquant");
  } else if (kw.length < 3) {
    criteria[1].score = 10;
    missingData.push("Mot-clé trop court pour une analyse fiable");
  } else if (kw.length > 50) {
    criteria[1].score = 15;
    missingData.push("Mot-clé trop long, peu précis");
  } else {
    criteria[1].score = 25;
  }

  // Cohérence secteur / produit : basique, si les deux sont remplis et différents de "Autres"
  if (!input.sector.trim() || !input.productType.trim()) {
    criteria[2].score = 0;
    missingData.push("Secteur ou type de produit manquant");
  } else {
    criteria[2].score = 20;
  }

  // Marché et catégorie
  if (!input.market.trim()) {
    criteria[3].score = 0;
    missingData.push("Marché / pays non précisé");
  } else {
    criteria[3].score = input.category === "other" ? 7 : 15;
    if (input.category === "other") missingData.push("Catégorie non spécifiée (Autres)");
  }

  const total = criteria.reduce((sum, c) => sum + (c.score || 0), 0);
  const hasCriticalMissing = missingData.length > 0;

  let value: number | null;
  let level: "low" | "medium" | "high";
  let confidence: "low" | "medium" | "high";

  if (!allFilled || !kw.trim() || !input.sector.trim() || !input.productType.trim() || !input.market.trim()) {
    value = null;
    level = "low";
    confidence = "low";
  } else if (total >= 70) {
    value = total;
    level = "high";
    confidence = "high";
  } else if (total >= 40) {
    value = total;
    level = "medium";
    confidence = "medium";
  } else {
    value = total;
    level = "low";
    confidence = "low";
  }

  return {
    value,
    max,
    level,
    confidence,
    criteria,
    missingData,
  };
}

/**
 * Analyse une niche à partir des informations utilisateur.
 * Aucune source externe n'est consultée par défaut.
 */
export function analyzeNiche(input: NicheInput): NicheAnalysis {
  const id = generateId();
  const now = new Date().toISOString();
  const score = calculateScore(input);

  return {
    id,
    createdAt: now,
    input,
    keywords: {
      observed: [], // Aucun mot-clé observé sans source externe
      suggested: suggestKeywords(input),
    },
    competition: {
      competitors: [], // Aucun concurrent sans source externe
      sources: [],
      note: "Aucune source externe connectée. Données insuffisantes pour l'analyse de la concurrence.",
      sufficient: false,
    },
    score,
    sources: [
      {
        name: "Saisie utilisateur",
        type: "user",
        verified: false,
        collectedAt: now,
      },
      {
        name: "Système 10-JITAL (local)",
        type: "system",
        verified: false,
        collectedAt: now,
      },
    ],
  };
}

/**
 * Sauvegarde une analyse dans le stockage local JSON côté serveur.
 * À utiliser uniquement depuis une API route (Node.js fs).
 */
export function saveAnalysis(analysis: NicheAnalysis): void {
  // Cette fonction est un placeholder côté serveur.
  // L'écriture réelle est gérée par l'API route via products-server pattern.
  throw new Error("saveAnalysis doit être appelée depuis l'API route côté serveur");
}

/**
 * Vérifie si une analyse a des données suffisantes pour produire un score fiable.
 */
export function hasSufficientData(analysis: NicheAnalysis): boolean {
  return analysis.score.value !== null && analysis.score.confidence !== "low";
}
