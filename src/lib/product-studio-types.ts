/**
 * 10-JITAL — JITAL PRODUCT STUDIO
 * Types pour la création de produits numériques.
 *
 * ⚠️ Aucune donnée commerciale n'est inventée.
 * Aucun produit n'est publié automatiquement.
 * Aucune clé API n'est requise.
 */

export type ProductStudioType =
  | "ebook"
  | "workbook"
  | "template"
  | "prompt-pack"
  | "creator-kit"
  | "resource-pack"
  | "course"
  | "tool"
  | "other";

export type ProductStudioLanguage = "fr" | "en" | "ar" | "es";

export type ProductStudioStatus = "idea" | "draft" | "ready" | "published";

export interface ProductStudioProject {
  id: string;
  createdAt: string;
  updatedAt: string;
  // Brief
  name: string;
  type: ProductStudioType;
  niche: string;
  audience: string;
  language: ProductStudioLanguage;
  idea: string;
  commercialObjective: string;
  indicativePrice: number | null;
  deliveryFormat: string | null;
  // Contenu généré
  commercialTitle: string | null;
  commercialSubtitle: string | null;
  detailedDescription: string | null;
  benefits: string[] | null;
  tableOfContents: string[] | null;
  sectionsContent: Record<string, string> | null;
  gumroadPresentation: string | null;
  coverIdea: string | null;
  qualityChecklist: string[] | null;
  // Métadonnées
  keywords: string[] | null;
  source: "manual" | "niche-detector" | "opportunity-hunter" | "trend-radar";
  sourceId: string | null;
  status: ProductStudioStatus;
  // Exports
  lastExportAt: string | null;
}

export interface ProductStudioInput {
  name: string;
  type: ProductStudioType;
  niche: string;
  audience: string;
  language: ProductStudioLanguage;
  idea: string;
  commercialObjective: string;
  indicativePrice: number | null;
  deliveryFormat: string | null;
  source?: "manual" | "niche-detector" | "opportunity-hunter" | "trend-radar";
  sourceId?: string | null;
}

export const PRODUCT_STUDIO_TYPES: { value: ProductStudioType; label: string }[] = [
  { value: "ebook", label: "Ebook ou guide PDF" },
  { value: "workbook", label: "Cahier d'activités ou de coloriage" },
  { value: "template", label: "Modèle de document" },
  { value: "prompt-pack", label: "Pack de prompts" },
  { value: "creator-kit", label: "Kit de création numérique" },
  { value: "resource-pack", label: "Pack de ressources graphiques" },
  { value: "course", label: "Formation ou mini-cours" },
  { value: "tool", label: "Outil ou application" },
  { value: "other", label: "Autre" },
];

export const PRODUCT_STUDIO_LANGUAGES: { value: ProductStudioLanguage; label: string }[] = [
  { value: "fr", label: "Français" },
  { value: "en", label: "Anglais" },
  { value: "ar", label: "Arabe" },
  { value: "es", label: "Espagnol" },
];

export const PRODUCT_STATUS_LABELS: Record<ProductStudioStatus, string> = {
  idea: "Idée",
  draft: "Brouillon",
  ready: "Prête à publier",
  published: "Publiée",
};

export function generateProductStudioId(): string {
  return `ps-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyProject(input: ProductStudioInput): ProductStudioProject {
  const now = new Date().toISOString();
  return {
    id: generateProductStudioId(),
    createdAt: now,
    updatedAt: now,
    name: input.name,
    type: input.type,
    niche: input.niche,
    audience: input.audience,
    language: input.language,
    idea: input.idea,
    commercialObjective: input.commercialObjective,
    indicativePrice: input.indicativePrice,
    deliveryFormat: input.deliveryFormat,
    commercialTitle: null,
    commercialSubtitle: null,
    detailedDescription: null,
    benefits: null,
    tableOfContents: null,
    sectionsContent: null,
    gumroadPresentation: null,
    coverIdea: null,
    qualityChecklist: null,
    keywords: null,
    source: input.source ?? "manual",
    sourceId: input.sourceId ?? null,
    status: "idea",
    lastExportAt: null,
  };
}

/**
 * Génère le contenu initial d'un produit à partir du brief.
 * Mode local déterministe — aucun modèle d'IA externe n'est appelé.
 */
export function generateProjectContent(project: ProductStudioProject): ProductStudioProject {
  const now = new Date().toISOString();
  const { name, type, niche, audience, language, idea, commercialObjective, indicativePrice } = project;

  const langLabels: Record<ProductStudioLanguage, string> = {
    fr: "français",
    en: "anglais",
    ar: "arabe",
    es: "espagnol",
  };

  const typeLabels: Record<ProductStudioType, string> = {
    ebook: "Ebook ou guide PDF",
    workbook: "Cahier d'activités ou de coloriage",
    template: "Modèle de document",
    "prompt-pack": "Pack de prompts",
    "creator-kit": "Kit de création numérique",
    "resource-pack": "Pack de ressources graphiques",
    course: "Formation ou mini-cours",
    tool: "Outil ou application",
    other: "Produit numérique",
  };

  const commercialTitle = `${name} — ${typeLabels[type]}`;
  const commercialSubtitle = `Un ${typeLabels[type].toLowerCase()} conçu pour ${audience} dans le domaine ${niche}.`;

  const detailedDescription = `Ce produit numérique (${typeLabels[type]}) est destiné à ${audience} et aborde le domaine ${niche}. ${idea}. Objectif : ${commercialObjective}. Rédigé en ${langLabels[language]}.`;

  const benefits = [
    "Contenu immédiatement utilisable",
    `Adapté au public : ${audience}`,
    `Domaine couvert : ${niche}`,
    `Langue : ${langLabels[language]}`,
    "Format prêt à l'emploi",
  ];

  const tableOfContents = [
    "Introduction et présentation",
    "Contenu principal — partie 1",
    "Contenu principal — partie 2",
    "Cas pratiques et exemples",
    "Conclusion et prochaines étapes",
    "Ressources complémentaires",
  ];

  const sectionsContent: Record<string, string> = {
    "Introduction et présentation": `Bienvenue dans ${name}. Ce ${typeLabels[type].toLowerCase()} vous accompagne dans le domaine ${niche}, destiné à ${audience}.`,
    "Contenu principal — partie 1": `Fondamentaux de ${idea} pour ${audience}.`,
    "Contenu principal — partie 2": `Application pratique : ${commercialObjective}.`,
    "Cas pratiques et exemples": "Exemples concrets adaptés à votre domaine.",
    "Conclusion et prochaines étapes": "Synthèse et actions à mettre en œuvre.",
    "Ressources complémentaires": "Liens et références pour aller plus loin.",
  };

  const priceText = indicativePrice !== null ? `${indicativePrice} MAD` : "À définir";
  const gumroadPresentation = `# ${commercialTitle}

${commercialSubtitle}

## Ce produit contient

Un ${typeLabels[type].toLowerCase()} rédigé en ${langLabels[language]}, destiné à ${audience} dans le domaine ${niche}.

## Ce que vous allez apprendre

${benefits.map((b) => `- ${b}`).join("\n")}

## Prix

${priceText}

## Ce qui est inclus

- Le produit numérique complet
- Accès aux mises à jour mineures
`;

  const qualityChecklist = [
    "Vérifier l'orthographe et la grammaire",
    "Valider la cohérence du contenu avec le brief",
    "Tester le format de livraison",
    "Vérifier les droits d'utilisation des ressources",
    "Préparer la couverture et les visuels",
    "Rédiger la fiche commerciale",
    "Définir un prix de départ",
    "Tester sur ordinateur et mobile",
  ];

  return {
    ...project,
    updatedAt: now,
    commercialTitle,
    commercialSubtitle,
    detailedDescription,
    benefits,
    tableOfContents,
    sectionsContent,
    gumroadPresentation,
    coverIdea: `Couleur dominante : violet. Thème : ${niche}. Visuel épuré avec le titre "${name}" en avant-plan.`,
    qualityChecklist,
    keywords: [name, niche, type, audience, commercialObjective].filter(Boolean),
    status: "draft",
  };
}
