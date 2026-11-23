import type { CurrencyCode } from "@/lib/currency";
export interface Product {
  id: string;
  title?: string;
  name: string;
  description: string;
  price: number;
  currency: CurrencyCode;
  category: string;
  image: string;
  affiliateUrl?: string;
  badge?: string;
  inStock?: boolean;
  rating: number;
  reviews?: number;
}

export const demoProducts: Product[] = [
  {
    id: "prod-001",
    title: "Doudoune Veste Homme — Chaud Hiver Blouson Zippé",
    name: "Doudoune Veste Homme — Chaud Hiver Blouson Zippé",
    description: "Doudoune d'hiver pour homme, rembourrage épais, fermeture zippée et coupe ajustée.",
    price: 13.25,
    currency: "EUR",
    category: "Mode & Hiver",
    image: "https://m.media-amazon.com/images/I/718H-NJ12UL._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.fr/dp/B0FTDRH6G4?tag=10jital-21",
    badge: "Populaire",
    inStock: true,
    rating: 4.8,
    reviews: 124
  },
  {
    id: "prod-002",
    title: "Manteau de Motard à Col Montant — Style Moto Cuir",
    name: "Manteau de Motard à Col Montant — Style Moto Cuir",
    description: "Veste de moto bomber à col montant, effet cuir, manches longues, automne-hiver.",
    price: 20.40,
    currency: "EUR",
    category: "Mode & Hiver",
    image: "https://m.media-amazon.com/images/I/71aDOzgc-EL._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.fr/dp/B0CJBWNQKR?tag=10jital-21",
    badge: "Tendance",
    inStock: true,
    rating: 4.6,
    reviews: 98
  },
  {
    id: "prod-003",
    title: "Veste Homme Automne/Hiver — Impression Lettres",
    name: "Veste Homme Automne/Hiver — Impression Lettres",
    description: "Veste avec impression typographique, fermeture éclair, poches latérales, coupe normale.",
    price: 21.74,
    currency: "EUR",
    category: "Mode & Hiver",
    image: "https://m.media-amazon.com/images/I/61jQjUifDeL._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.fr/dp/B0H7X3ND5C?tag=10jital-21",
    badge: "Nouveauté",
    inStock: true,
    rating: 4.7,
    reviews: 156
  },
  {
    id: "prod-004",
    title: "Manteau de Pluie Femme — Imperméable Coupe-vent",
    name: "Manteau de Pluie Femme — Imperméable Coupe-vent",
    description: "Imperméable féminin léger coupe-vent à capuche, étanche et pliable.",
    price: 2.96,
    currency: "EUR",
    category: "Imperméable",
    image: "https://m.media-amazon.com/images/I/61m7WdZi-3L._AC_SL1500_.jpg",
    affiliateUrl: "https://www.amazon.fr/dp/B0FX4YH3C1?tag=10jital-21",
    badge: "Essentiel",
    inStock: true,
    rating: 4.9,
    reviews: 215
  }
];

export const DEMO_PRODUCTS = demoProducts;

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  image: string;
}

export interface PriceAlert {
  id: string;
  productName: string;
  targetPrice: number;
  currentPrice: number;
  currency: "EUR" | "USD" | "MAD";
  active: boolean;
  createdAt: string;
}

export const DEMO_BLOG_POSTS: BlogPost[] = [
  {
    id: "1",
    title: "Guide ultime pour affronter l'hiver en toute élégance",
    excerpt: "Découvrez les tendances de manteaux et chaussures pour cette saison.",
    content: "Découvrez notre sélection de vêtements et accessoires pour l'hiver.",
    author: "10-JITAL",
    date: "2026-10-30",
    category: "Mode",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80"
  }
];

export const DEMO_PRICE_ALERTS: PriceAlert[] = [];


export const DEMO_BLOG_POSTS: any[] = [];
export type Product = any;
export type BlogPost = any;
export const getDemoProducts = async () => DEMO_PRODUCTS;
