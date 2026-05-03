# TruePriceAI — Todo & Roadmap

> Dernière mise à jour : **2026-05-03**

---

## Légende
- ✅ Complété
- 🔄 En cours
- ⏳ À faire (prioritaire)
- 💡 Idée / Backlog
- ❌ Annulé / Reporté

---

## PHASE 0 — Setup & Landing Page

| Tâche | Statut | Date |
|---|---|---|
| Initialiser le projet Next.js 14 + TypeScript + Tailwind | ✅ | 2026-05-02 |
| Configurer tsconfig.json strict | ✅ | 2026-05-02 |
| Configurer postcss.config.js | ✅ | 2026-05-02 |
| Créer .gitignore + .gitattributes | ✅ | 2026-05-02 |
| Créer le dépôt GitHub | ✅ | 2026-05-02 |
| Installer Tailwind v3 + tailwindcss-animate | ✅ | 2026-05-02 |
| Installer framer-motion + lucide-react + Radix UI | ✅ | 2026-05-02 |
| Créer composants UI de base (button, badge, accordion) | ✅ | 2026-05-02 |
| Landing page — Section Navbar (sticky + mobile) | ✅ | 2026-05-02 |
| Landing page — Section Hero (mockup app + search) | ✅ | 2026-05-02 |
| Landing page — Section SocialProof | ✅ | 2026-05-02 |
| Landing page — Section ProblemSolution | ✅ | 2026-05-02 |
| Landing page — Section Features | ✅ | 2026-05-02 |
| Landing page — Section DemoVisual | ✅ | 2026-05-02 |
| Landing page — Section Pricing (toggle mensuel/annuel) | ✅ | 2026-05-02 |
| Landing page — Section Testimonials | ✅ | 2026-05-02 |
| Landing page — Section FAQ (accordion) | ✅ | 2026-05-02 |
| Landing page — Section CTAFinal | ✅ | 2026-05-02 |
| Landing page — Footer | ✅ | 2026-05-02 |

---

## PHASE 0.5 — Design System v1.0

| Tâche | Statut | Date |
|---|---|---|
| Définir palette `tp.*` (cyan + navy + sémantiques) | ✅ | 2026-05-03 |
| Mettre à jour tailwind.config.ts avec tous les tokens | ✅ | 2026-05-03 |
| Mettre à jour globals.css (dark theme + Google Fonts) | ✅ | 2026-05-03 |
| Migrer button.tsx vers tokens `tp-*` | ✅ | 2026-05-03 |
| Migrer badge.tsx vers tokens `tp-*` | ✅ | 2026-05-03 |
| Migrer accordion.tsx (dark + fix ElementRef déprécié) | ✅ | 2026-05-03 |
| Migrer Navbar.tsx | ✅ | 2026-05-03 |
| Migrer Hero.tsx | ✅ | 2026-05-03 |
| Migrer Pricing.tsx | ✅ | 2026-05-03 |
| Migrer SocialProof.tsx | ✅ | 2026-05-03 |
| Migrer ProblemSolution.tsx | ✅ | 2026-05-03 |
| Migrer Features.tsx | ✅ | 2026-05-03 |
| Migrer DemoVisual.tsx | ✅ | 2026-05-03 |
| Migrer Testimonials.tsx | ✅ | 2026-05-03 |
| Migrer FAQ.tsx | ✅ | 2026-05-03 |
| Migrer CTAFinal.tsx | ✅ | 2026-05-03 |
| Migrer Footer.tsx | ✅ | 2026-05-03 |
| Créer handoff/MIGRATION.md (recette complète) | ✅ | 2026-05-03 |
| Créer structure Docs/ (projet, dev, ui, claude, todo) | ✅ | 2026-05-03 |
| Push feat/design-migration → merge master → GitHub | ✅ | 2026-05-03 |

---

## PHASE 1 — Auth & Billing

| Tâche | Statut |
|---|---|
| Créer comptes : Clerk, Stripe, Supabase, Upstash | ⏳ |
| Intégrer Clerk (signup / login / org) | ⏳ |
| Webhook Clerk → sync users dans DB | ⏳ |
| Intégrer Stripe (products, prices, subscriptions) | ⏳ |
| Webhook Stripe → update plan dans DB | ⏳ |
| Page pricing avec checkout Stripe | ⏳ |
| Portail client Stripe | ⏳ |
| Middleware auth Next.js (routes protégées) | ⏳ |
| Guards plan (free vs premium vs enterprise) | ⏳ |
| Setup Turborepo + monorepo apps/ + packages/ | ⏳ |
| Docker Compose (PostgreSQL + Redis) | ⏳ |

---

## PHASE 2 — Core Data

| Tâche | Statut |
|---|---|
| Schéma Prisma (tous les models) | ⏳ |
| Migrations Prisma + seeds (stores, taxes, provinces) | ⏳ |
| API tRPC : router product, store, search | ⏳ |
| Intégration UPCitemdb API | ⏳ |
| Intégration Bank of Canada API (taux de change) | ⏳ |
| Cron refresh taux de change (toutes les heures) | ⏳ |
| Classe ProductResolver (résolution UPC/MPN/ASIN) | ⏳ |
| Tests unitaires : ProductResolver | ⏳ |

---

## PHASE 3 — Scraping Engine

| Tâche | Statut |
|---|---|
| Setup BullMQ + Redis queues | ⏳ |
| Base scraper class (retry, error, proxy rotation) | ⏳ |
| Scraper Amazon.ca | ⏳ |
| Scraper Amazon.com | ⏳ |
| Scraper Best Buy Canada | ⏳ |
| Scraper Walmart Canada | ⏳ |
| Scraper Walmart US | ⏳ |
| Scraper Canadian Tire | ⏳ |
| Scraper Costco Canada | ⏳ |
| Job orchestrateur (lance tous les scrapers en parallèle) | ⏳ |
| Cache Redis résultats (TTL 1h) | ⏳ |
| BullMQ Board (monitoring jobs) | ⏳ |

---

## PHASE 4 — Calculs Financiers

| Tâche | Statut |
|---|---|
| Module CostCalculator (TypeScript class) | ⏳ |
| Table taux douane par catégorie HS | ⏳ |
| Table taxes par province canadienne | ⏳ |
| Estimation frais livraison (poids/région) | ⏳ |
| Calcul exemption ACEUM/CUSMA | ⏳ |
| Tests unitaires extensifs CostCalculator | ⏳ |
| API endpoint : POST /calculate-cost | ⏳ |

---

## PHASE 5 — Frontend Particulier

| Tâche | Statut |
|---|---|
| Layout principal (navbar app, sidebar, footer) | ⏳ |
| Page recherche : barre + suggestions | ⏳ |
| Composant ProductCard | ⏳ |
| Page détail produit (fiche complète) | ⏳ |
| Composant PriceComparisonTable | ⏳ |
| Composant CostBreakdownModal | ⏳ |
| Page mes alertes (CRUD) | ⏳ |
| Page boutiques favorites | ⏳ |
| Dashboard utilisateur | ⏳ |

---

## PHASE 6 — Frontend Entreprise

| Tâche | Statut |
|---|---|
| Onboarding entreprise (choix mode) | ⏳ |
| Module Compétition : dashboard veille prix | ⏳ |
| Module Compétition : graphique historique (Recharts) | ⏳ |
| Module Procurement : import CSV/Excel | ⏳ |
| Module Procurement : suggestion plan optimal | ⏳ |
| Module Export : WooCommerce, Shopify, JSON | ⏳ |
| Gestion équipe (inviter membres, rôles) | ⏳ |

---

## PHASE 7 — Assistant IA

| Tâche | Statut |
|---|---|
| Interface chat (ChatWindow component) | ⏳ |
| Intégration OpenAI GPT-4o | ⏳ |
| Injection contexte résultats de recherche | ⏳ |
| Prompts système (douanes CA, comparaison, B2B) | ⏳ |
| Historique conversation (DB + state) | ⏳ |
| Guard plan premium | ⏳ |

---

## PHASE 8 — Alertes & Notifications

| Tâche | Statut |
|---|---|
| Cron check alertes (toutes les 4h) | ⏳ |
| Logique trigger alerte (prix < seuil) | ⏳ |
| Templates email (React Email + Resend) | ⏳ |
| Notifications in-app | ⏳ |

---

## PHASE 9 — Polish & Perf

| Tâche | Statut |
|---|---|
| SEO : metadata, sitemap, robots.txt | ⏳ |
| Performance : lazy loading, image optimization | ⏳ |
| Internationalisation FR/EN (next-intl) | ⏳ |
| Accessibilité (ARIA, keyboard nav) | ⏳ |
| Tests E2E critiques (Playwright) | ⏳ |
| Déploiement Vercel production | ⏳ |

---

## Backlog / Idées

| Idée | Priorité |
|---|---|
| Renommer branche `master` → `main` | 💡 Faible |
| App mobile React Native | 💡 Long terme |
| Extension navigateur (scan code-barres) | 💡 Long terme |
| API publique pour partenaires | 💡 Long terme |
| Mode hors-ligne (PWA) | 💡 Long terme |
