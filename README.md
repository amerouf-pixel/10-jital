# 10-JITAL

Application web de découverte et de présentation de produits, avec une vitrine de produits tendance et des liens vers les offres affiliées. Le dépôt contient également une interface d’administration et une API de produits.

**Démo :** [10-jital.vercel.app](https://10-jital.vercel.app)

## Fonctionnalités visibles

- Affichage des produits et de leurs informations (image, catégorie, description et prix).
- Accès à la boutique depuis la page d’accueil.
- Liens vers les offres des produits.
- Chargement des produits via l’API `/api/products`.
- Mode démonstration configurable.

## Technologies

Next.js, React, TypeScript, Supabase, Tailwind CSS et Vercel Analytics. Le projet comprend aussi des dépendances pour Three.js et Google GenAI.

## Installation et lancement

Prérequis : Node.js et npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Ouvrir ensuite [http://localhost:3000](http://localhost:3000).

Pour lancer les vérifications ou préparer une version de production :

```bash
npm run lint
npm run build
npm start
```

## Configuration

Consulter `.env.example` pour les variables disponibles. Le mode démonstration est activé par défaut. Les clés et secrets réels doivent être renseignés uniquement dans `.env.local` ou dans la configuration sécurisée de l’hébergeur — ne jamais les committer.

Les clés d’affiliation et les tâches de vérification des prix sont désactivées ou non configurées par défaut ; vérifiez les intégrations avant de les activer.

## Déploiement

Le site public est hébergé sur Vercel. Pour un autre déploiement, configurer les variables d’environnement nécessaires et suivre les commandes de build Next.js ci-dessus.
