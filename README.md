# TruePriceAI

> **Comparez les vrais coûts. Trouvez le meilleur prix, tous marchés confondus.**

TruePriceAI calcule le **vrai coût total** d'un produit sur n'importe quel marché — taux de change, taxes locales, droits de douane, livraison et rabais inclus. En temps réel.

---

## Pourquoi TruePriceAI ?

Le prix affiché n'est jamais le prix final. Un produit à 299 $ USD peut revenir à 520 $ CAD une fois le change, les douanes, les taxes provinciales et la livraison ajoutés — ou être moins cher que l'équivalent local. TruePriceAI fait ce calcul automatiquement pour tous les marchés accessibles depuis votre pays.

**Ce que l'app détecte et affiche :**
- Prix actuels sur plusieurs marketplaces (Amazon.ca, Amazon.com, Best Buy, Apple Store, Walmart…)
- Rabais automatiques, codes promo, offres conditionnelles (Prime, Club, quantité minimale…)
- Date de fin des promotions quand disponible
- Vrai coût total calculé : change + taxes + douanes + livraison + frais de courtage
- Meilleure offre recommandée selon le marché accessible depuis votre pays

---

## État du projet — Mai 2026

| Phase | Statut | Description |
|---|---|---|
| 0 — Fondations | ✅ Complet | Next.js 14, design system, monorepo Turborepo |
| 1A — Auth | 🔄 En cours | Clerk v7, pages sign-in/sign-up, dashboard |
| 1B — Base de données | ⏳ Prochain | Prisma + Neon, première migration |
| 1C — Stripe | ⏳ À venir | Abonnements FREE / PREMIUM / ENTERPRISE |
| 2 — Géolocalisation | ⏳ À venir | Détection marché, logique par pays |
| 3 — Scraping & Prix | ⏳ À venir | Sources de prix, rabais, calcul vrai coût |
| 4 — Export & API | ⏳ À venir | CSV, PDF, API publique |
| 5 — IA | ⏳ À venir | Recommandations GPT-4o, alertes prix |

---

## Stack technique

```
apps/
  web/        Next.js 14 · TypeScript strict · Tailwind 3.4 · shadcn/ui · Framer Motion
  worker/     Service de scraping (Phase 3)

packages/
  db/         Prisma 6 · Neon PostgreSQL
  api/        tRPC (Phase 2)
  scraper/    Logique de scraping partagée (Phase 3)
  shared/     Types & constantes partagés
```

**Services tiers :**
- Auth : Clerk v7
- Paiements : Stripe (à venir)
- Base de données : Neon (PostgreSQL serverless)
- Cache : Upstash Redis (Phase 3)
- IA : OpenAI GPT-4o (Phase 5)

---

## Installation locale

```bash
# 1. Cloner
git clone https://github.com/domlemay/trueprice-ai.git
cd trueprice-ai

# 2. Installer les dépendances (toutes les workspaces)
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# → remplir les clés Clerk et l'URL Neon dans .env

# 4. Lancer le dev
npm run dev
# → http://localhost:3000
```

### Variables d'environnement requises (`.env`)

```env
# Clerk — https://dashboard.clerk.com/
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Neon — https://neon.tech/
DATABASE_URL=postgresql://...
```

---

## Commandes utiles

```bash
npm run dev          # Lance tous les workspaces (Turbo)
npm run build        # Build de production
npm run typecheck    # Vérification TypeScript (0 erreurs)
npm run lint         # ESLint

# Base de données (depuis packages/db/)
npm run db:generate  # Génère le Prisma Client
npm run db:push      # Applique le schéma sur Neon (dev)
npm run db:migrate   # Migration versionnée (production)
npm run db:studio    # Prisma Studio (UI visuelle)
```

---

## Design system

Palette : **cyan `#00D4C8`** + **navy `#0A1628`** · Mode sombre par défaut
Tokens : `tp-*` (jamais `brand-*`)
Fonts : Syne (display) · DM Sans (body) · JetBrains Mono (prix/code)

Voir `docs/design-system/README.md` pour les règles complètes.

---

## Structure des données — Rabais & Promotions

Chaque recherche de prix retourne des `ProductOffer` (une par marketplace). Chaque offre peut avoir plusieurs `Discount` :

```
PriceSearch
└── ProductOffer[]          (une par marketplace)
    ├── priceOriginal       prix barré
    ├── priceCurrent        prix après rabais automatiques
    ├── truePriceTotal      vrai coût total (change + taxes + douanes + livraison)
    └── Discount[]
        ├── type            AUTOMATIC | COUPON | CONDITIONAL | MEMBERSHIP | SALE | BUNDLE | CASHBACK
        ├── label           "Coupon 15 %" · "Membres Prime" · "Achetez-en 2, économisez 10 %"
        ├── percentOff      15
        ├── condition       "Abonnement Amazon Prime requis"
        ├── code            "SAVE15" (si code promo)
        ├── expiresAt       2026-06-15 (si connue)
        └── isAutoApplied   true | false
```

---

## Feuille de route complète

Voir [`docs/todo/MASTER_TODO.md`](docs/todo/MASTER_TODO.md)

---

## Licence

Propriétaire — © 2026 TruePriceAI. Tous droits réservés.
