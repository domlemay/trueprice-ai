# TruePriceAI — Documentation Développeurs

## Stack technique

### Frontend
| Technologie | Version | Rôle |
|---|---|---|
| Next.js | 14 (App Router) | Framework React SSR/SSG |
| TypeScript | 5.7 | Typage strict (noImplicitAny) |
| Tailwind CSS | 3.4 | Styles utilitaires |
| shadcn/ui | latest | Composants UI (Radix primitives) |
| framer-motion | 11+ | Animations |
| Zustand | latest | State management |
| TanStack Query | latest | Data fetching + cache |
| React Hook Form + Zod | latest | Formulaires et validation |
| next-intl | latest | i18n (FR/EN) |

### Backend
| Technologie | Version | Rôle |
|---|---|---|
| Node.js + Bun | latest | Runtime |
| Hono.js | latest | API REST légère |
| tRPC | latest | API typée end-to-end |
| Clerk | latest | Auth (users + organisations) |
| Stripe | latest | Paiements + subscriptions |
| BullMQ + Redis | latest | Queue jobs (scraping async) |
| Resend + React Email | latest | Emails transactionnels |

### Base de données
| Service | Usage |
|---|---|
| PostgreSQL (Supabase) | DB principale (users, produits, prix) |
| Redis (Upstash) | Cache (TTL 1h), rate limiting, BullMQ |
| Meilisearch / Typesense | Index produits full-text |

### Infrastructure
| Service | Usage |
|---|---|
| Vercel | Frontend + API (Next.js natif) |
| Railway / Render | Workers scraping (Node.js persistent) |
| Supabase | PostgreSQL managed |
| Upstash | Redis serverless |
| Cloudflare R2 | Images / médias |
| GitHub Actions | CI/CD |
| Sentry | Error tracking |

---

## Structure du monorepo

```
trueprice-ai/
├── app/                    # Next.js App Router
│   ├── (marketing)/        # Pages publiques (landing, pricing)
│   ├── (app)/              # App authentifiée (dashboard, search)
│   └── api/                # Route handlers + webhooks
├── components/
│   ├── landing/            # Composants landing page
│   └── ui/                 # Composants shadcn/ui
├── lib/
│   └── utils.ts            # cn() helper
├── docs/                   # Design system (assets, tokens, preview)
├── handoff/                # Notes de migration entre versions
├── Docs/                   # Documentation générale du projet
└── media/                  # Assets branding (SVGs, logos)
```

### Structure future (monorepo complet)
```
trueprice-ai/
├── apps/
│   ├── web/                # Next.js app principale
│   └── worker/             # Service scraping (Node.js séparé)
└── packages/
    ├── db/                 # Prisma schema + migrations
    ├── api/                # tRPC routers partagés
    ├── scraper/            # Logique scraping + cost calculator
    └── shared/             # Types, constants partagés
```

---

## Setup local

### Prérequis
- Node.js 20+
- npm 10+

### Installation
```bash
git clone https://github.com/domlemay/trueprice-ai.git
cd trueprice-ai
npm install
npm run dev
```

L'app tourne sur http://localhost:3000

### Variables d'environnement
Copier `.env.example` → `.env.local` et remplir :

```bash
# Auth — Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Paiements — Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Database
DATABASE_URL=
DIRECT_URL=

# Redis
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

# APIs externes
UPCITEMDB_API_KEY=
OPENAI_API_KEY=
RESEND_API_KEY=
BANK_OF_CANADA_API_URL=https://www.bankofcanada.ca/valet

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Conventions de code

### TypeScript
- Toujours `strict: true` — zéro `any`
- Types explicites sur toutes les fonctions
- `interface` pour les objets, `type` pour les unions/intersections

### Composants React
- Server Components par défaut
- `"use client"` seulement si : hooks, événements, animations, state
- Props typées avec `interface`, pas de props implicites

### Nommage
- Fichiers composants : `PascalCase.tsx`
- Fichiers utilitaires : `camelCase.ts`
- Constantes : `SCREAMING_SNAKE_CASE`
- Variables/fonctions : `camelCase`

### Git
- Branches : `feat/`, `fix/`, `chore/`, `docs/`
- Commits : Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`)
- Merge via PR avec message de merge signé

---

## APIs intégrées

| API | Usage | Doc |
|---|---|---|
| Bank of Canada Valet | Taux de change CAD/USD | [bankofcanada.ca](https://www.bankofcanada.ca/valet/docs) |
| UPCitemdb | Lookup UPC → infos produit | [upcitemdb.com](https://www.upcitemdb.com/api/explorer) |
| OpenAI GPT-4o | Assistant IA | [platform.openai.com](https://platform.openai.com) |
| Clerk | Auth + organisations | [clerk.com/docs](https://clerk.com/docs) |
| Stripe | Subscriptions | [stripe.com/docs](https://stripe.com/docs) |
| Resend | Emails | [resend.com/docs](https://resend.com/docs) |

---

## Schéma DB (à venir — Phase 2)

Modèles Prisma principaux :
- `User` — profil, plan, province
- `Organisation` — compte entreprise, membres
- `Product` — UPC, EAN, MPN, ASIN, infos produit
- `PriceRecord` — prix par boutique, horodatage scraping
- `Store` — boutiques (CA + US, retail + B2B)
- `PriceAlert` — alertes utilisateur
- `B2BProductList` + `B2BListItem` — listes enterprise
- `ExchangeRate` — historique taux de change

*Mise à jour : 2026-05-03*
