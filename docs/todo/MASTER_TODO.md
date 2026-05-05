# MASTER TODO — TruePriceAI

> Feuille de route exhaustive issue de l'audit complet (90 Q&A mai 2026).
> Légende : ✅ fait · 🔄 en cours · ⏳ prochain · 🔒 bloqué par dépendance · ★ critique

---

## ⚠️ CONFIGURATION REQUISE — Variables d'environnement à compléter

> Ces services sont installés et intégrés dans le code mais nécessitent une configuration externe.

- [ ] ★ **Upstash Redis** — `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
  - Créer une DB gratuite sur [console.upstash.com](https://console.upstash.com/)
  - Copier les valeurs REST API dans `.env`
  - Requis pour : cache taux de change (24h), cache scraping (6h), rate limiting tokens IA
- [ ] ★ **Inngest** — `INNGEST_SIGNING_KEY`
  - Créer une app sur [app.inngest.com](https://app.inngest.com/)
  - En dev local : utiliser `npx inngest-cli@latest dev` (sans clé)
  - En prod : copier la Signing Key dans les variables Vercel + `.env`
  - Requis pour : job de scraping asynchrone, crons (alertes, reset quotas, RGPD)

---

## PLAN_LIMITS — Référence par plan

> Source de vérité pour toutes les vérifications d'accès dans le code.

| Limite | FREE | PREMIUM | ENTERPRISE | ENTERPRISE_PRO |
| --- | --- | --- | --- | --- |
| Recherches / mois | 10 | 200 | Illimité | Illimité |
| Historique résultats | 7 jours | 90 jours | 2 ans (730j) | Configurable |
| Marketplaces | 2 | Toutes | Toutes | Toutes |
| Export CSV/PDF | ❌ | ✅ | ✅ | ✅ |
| API publique | ❌ | ❌ | ✅ | ✅ |
| Clés API | 0 | 0 | 5 | Illimité |
| Organisations | ❌ | ❌ | ✅ | ✅ |
| Sièges org | — | — | 10 (puis +/siège) | Illimité |
| Alertes prix | 3 | 20 | Illimité | Illimité |
| Listes produits | 1 | 10 | Illimité | Illimité |
| Tokens IA / mois | 0 | 10 000 | 50 000 | BYOK ou illimité |
| Fournisseurs | ❌ | ❌ | 20 | Illimité |
| Rapports planifiés | ❌ | Hebdo | Hebdo + mensuel | Tous types |
| White-label | ❌ | ❌ | ❌ | ✅ |
| SSO dédié | ❌ | ❌ | ❌ | ✅ |
| Publicités | ✅ affiché | ❌ | ❌ | ❌ |
| Période d'essai | 14j PREMIUM | — | — | — |

---

## PHASE 0 — Fondations ✅

- ✅ Projet Next.js 14 initialisé (TypeScript strict, Tailwind 3.4, shadcn/ui)
- ✅ Design system v1.0 (tokens `tp-*`, navy + cyan, Syne/DM Sans/JetBrains Mono)
- ✅ Landing page marketing complète (11 sections, positionnement international)
- ✅ Migration design system — tous les composants sur `tp-*`
- ✅ GitHub repo public (`github.com/domlemay/trueprice-ai`, branche `master`)
- ✅ Turborepo monorepo (apps/web, apps/worker, packages/db, api, scraper, shared)
- ✅ Neon PostgreSQL connecté (`packages/db`, Prisma 6)
- ✅ `.env` unique à la racine (Clerk + Neon)

---

## PHASE 1 — Auth, Profil & Abonnements ✅

> Complété intégralement — commit `f232d6a` (40 fichiers, +2 572 lignes, mai 2026)

### 1A — Clerk Auth ✅

- ✅ Installer `@clerk/nextjs` v7
- ✅ `middleware.ts` — protège toutes les routes non-publiques
- ✅ Pages `/sign-in` et `/sign-up` avec apparence TruePriceAI
- ✅ `ClerkProvider` configuré (afterSignOutUrl, signInUrl, signUpUrl)
- ✅ `lib/auth.ts` — helpers `requireAuth()`, `requirePlan()`, `getSessionPlan()`
- ✅ `types/clerk.d.ts` — augmentation `CustomJwtSessionClaims` (plan, role)
- ✅ Dashboard placeholder (layout protégé + page accueil)
- ✅ Webhook Clerk → BD (`apps/web/app/api/webhooks/clerk/route.ts`)
  - ✅ `user.created` → `prisma.user.create({ clerkId, email, name, avatarUrl })`
  - ✅ `user.created` → créer Stripe Customer + sauvegarder `stripeCustomerId`
  - ✅ `user.created` → démarrer période d'essai PREMIUM 14 jours (`isTrialing: true`, `trialEndsAt`)
  - ✅ `user.updated` → sync `email`, `name`, `avatarUrl` en BD
  - ✅ `user.deleted` → `gdprDeleteRequestedAt = now()` (job suppression J+30)

### 1B — Onboarding post-inscription ✅

- ✅ Page `/onboarding` — 5 étapes, redirigée depuis `/dashboard` si `onboardingCompletedAt = null`
- ✅ Étape 1 — Pays et devise (`preferredCurrency`, `preferredLocale`, `timezone`)
- ✅ Étape 2 — Profil d'usage (particulier ou entreprise)
- ✅ Étape 3 — Adresse de livraison principale (`UserAddress` label "Domicile") — optionnelle
- ✅ Étape 4 — Préférences de notification (email, in-app)
- ✅ Étape 5 — Consentements (`ConsentLog` ANALYTICS + MARKETING)
- ✅ `POST /api/onboarding/complete` → `completeOnboarding()` (transaction ACID)
- ✅ Redirection vers `/dashboard` une fois terminé

### 1C — Base de données — Couche applicative ✅

- ✅ Schéma Prisma 40+ modèles écrit et validé
- ✅ `db:generate` — Prisma Client généré (v6.19.3)
- ✅ `db:push` — 40+ tables créées sur Neon
- ✅ `packages/db/src/index.ts` — exports centralisés + singleton Prisma
- ✅ `packages/db/src/queries/users.ts` — `createUser`, `getUserByClerkId`, `updateUserPlan`, `completeOnboarding`, `requestAccountDeletion`
- ✅ `packages/db/src/queries/organizations.ts` — CRUD complet + invitations + rôles + succursales
- ✅ `packages/db/src/queries/subscriptions.ts` — `upsertSubscription`, `cancelSubscription`, `upsertOrgSubscription`, `recordAiTokenPurchase`

### 1D — Stripe — Abonnements Particuliers ✅

- ✅ Produits Stripe créés (PREMIUM mensuel/annuel CAD + USD, ENTERPRISE mensuel/annuel CAD + USD)
- ✅ Variables `.env` configurées (8 price IDs + webhook secret)
- ✅ `lib/stripe.ts` — client singleton Stripe
- ✅ `apps/web/app/api/webhooks/stripe/route.ts` — 8 événements gérés
- ✅ `apps/web/app/api/checkout/route.ts` — Checkout Session (trial 14j, Stripe Tax, promo codes)
- ✅ `apps/web/app/api/billing/portal/route.ts` — Stripe Customer Portal
- ✅ `apps/web/app/dashboard/abonnement/page.tsx` + `PricingClient.tsx` — 2 sections : plan personnel + plans organisations (badge PLAN_BADGE par plan, lien facturation org)

### 1E — Stripe — Abonnements Organisations ✅

- ✅ `apps/web/app/api/checkout/org/route.ts` — checkout org (quantité = sièges, metadata `org_subscription`)
- ✅ Webhook org : `checkout.session.completed` + `subscription.updated` + `subscription.deleted`
- ✅ `apps/web/app/dashboard/organisation/[orgId]/facturation/` — `OrgBillingClient.tsx`

### 1F — Organisation & Multi-tenant ✅

- ✅ `apps/web/app/dashboard/organisation/[orgId]/layout.tsx` — breadcrumb + sous-navigation
- ✅ Page aperçu, membres, invitations, succursales, facturation, paramètres
- ✅ `apps/web/app/api/org/create/route.ts` — créer org (plan ENTERPRISE requis)
- ✅ `apps/web/app/api/org/[orgId]/invite/route.ts` — créer invitation (token crypto, 7j)
- ✅ `apps/web/app/api/org/[orgId]/members/[userId]/route.ts` — PATCH rôle + DELETE membre
- ✅ `apps/web/app/api/org/[orgId]/branches/route.ts` — GET + POST succursales
- ✅ `apps/web/app/api/invitations/[token]/accept/route.ts` — ACID (vérif expiry + sièges)
- ✅ `DashboardNav.tsx` — org switcher dropdown (check actif, router.push, "Gérer", "+ Créer")
- ✅ `dashboard/layout.tsx` — server component pur, passe `orgs` + `currentPath` à `DashboardNav`
- ✅ Bascule dark/light (next-themes `useTheme`), toggle FR/EN (localStorage), bouton déconnexion (`useClerk().signOut`)

### 1G — Sécurité & Sessions ✅

- ✅ Page `/dashboard/securite` — sessions actives via `clerkClient.sessions.getSessionList()`
- ✅ Affichage : browser + version, mobile/desktop (icon), ville + pays
- ✅ Section recommandations de sécurité

### 1H — Conformité RGPD / PIPEDA / Loi 25 ✅

- ✅ `CookieBanner.tsx` — localStorage `tp_cookie_consent`, Accept/Decline
- ✅ Pages légales : `/legal/confidentialite` + `/legal/cgu` (versionnées v1.0.0)
- ✅ `apps/web/app/dashboard/profil/confidentialite/PrivacyClient.tsx`
  - ✅ Toggles ANALYTICS/MARKETING → `POST /api/profile/consents` (INSERT only — audit trail)
  - ✅ Export données → `POST /api/profile/export` + `gdprDataExportedAt`
  - ✅ Suppression compte → `POST /api/profile/delete` + `gdprDeleteRequestedAt`
- ✅ Routes API profil : consents, notifications, export, delete
- ✅ `middleware.ts` — `/invitations/(.*)` et `/legal/(.*)` publiques

---

---

## STACK TECHNOLOGIQUE PHASE 2+ — Décisions de recherche (mai 2026)

> Recherche comparative complète effectuée avant implémentation. Décisions finales ci-dessous.

| Composant | Outil choisi | Justification |
| --- | --- | --- |
| Scraping MVP | **Crawlee** (MIT, gratuit) | Playwright + Cheerio intégré, anti-bot, FIFO queue |
| Scraping prod | **Firecrawl** (~19 USD/mois) | API REST, rendu JS, rotation proxy, pas d'infra |
| Découverte sites | **SerpAPI** (100/mois gratuit) | Google Shopping direct, prix structurés |
| Découverte sémantique | **Exa.ai** | Recherche neurale de sites par description produit |
| Extraction IA | **Claude Sonnet + Instructor.js** | Notre stack + Zod structured output |
| Fichiers fournisseurs | **SheetJS + pdf-parse + papaparse** | MIT, tout-en-un PDF/Excel/CSV |
| Taux de change | **Frankfurter** (gratuit, ECB) | Pas de clé, fiable, cache 24h Redis |
| Taxes provinciales | **JSON config DIY** | Taux fixes, pas de SaaS nécessaire |
| Jobs asynchrones | **Inngest** (gratuit MVP) | Serverless-native, parfait Next.js/Vercel |
| Quotas tokens | **@upstash/ratelimit + response.usage** | Précis, Redis Upstash ($0 tier) |
| Cache | **Upstash Redis** ($0 tier) | Compatible Edge, SDK serverless |
| Email | **Resend** (100/j gratuit) | React Email templates, domaine custom |

---

## PHASE 2 — Géolocalisation & Moteur de comparaison 🔄

### 2A — Détection et préférences de localisation ⏳

- [ ] IP geolocation au chargement (`middleware.ts` ou composant serveur)
  - Service : ipapi.co (gratuit jusqu'à 1 000/jour) ou MaxMind GeoLite2 (self-hosted)
  - Extraire : `country`, `region` (province/état), `currency`
  - Stocker en cookie de session signé
  - Sauvegarder dans `User.preferredLocale` / `preferredCurrency` si connecté
- [ ] Préférence manuelle dans `/dashboard/profil/localisation`
  - Pays, devise, timezone, langue (fr-CA / en-CA)
  - Priorité sur détection IP
- ✅ `lib/geo.ts` — `getUserMarket(req)` → `{ country, currency, locale, taxRegion, timezone }` (headers Vercel/Cloudflare)
- [ ] Adresses de livraison (`UserAddress`)
  - CRUD adresses : domicile, bureau, entrepôt, autre
  - Marquer défaut (`isDefault`)
  - Sélection d'adresse au moment de la recherche (impact taxes + livraison)

### 2B — Matrice marché & règles d'accès ⏳

> Ne jamais proposer une marketplace inaccessible depuis le pays de l'utilisateur.

- [ ] `lib/markets.ts` — table `MARKET_MATRIX`
  - Clé : `fromCountry` → liste `Marketplace.slug[]` accessibles
  - Ex : CA → [amazon.ca, bestbuy.ca, costco.ca, apple.ca, walmart.ca, amazon.com, bestbuy.com…]
  - Inclure règles livraison (livraison directe possible ? via transitaire ?)
- [ ] `lib/duties.ts` — règles douanières par paire pays
  - CUSMA CA↔US : franchise 20 $ CAD courrier, 800 $ USD dédouanement simplifié
  - UE → US : TVA remboursable, droits importation
  - Post-Brexit UK : droits spécifiques
  - Lookup dans `DutyRate` BD (avec fallback table statique)
- [ ] `lib/taxes.ts` — calcul taxes locales
  - Lookup dans `TaxRate` BD par `(country, province)`
  - CA/QC : GST 5 % + TVQ 9,975 % = 14,975 %
  - CA/ON : HST 13 %
  - CA/NB, NS, NL, PEI : HST 15 %
  - CA/AB, BC, SK, MB : GST 5 % + taxe provinciale variable
  - USA : Sales Tax par état (0 % à ~10 %) — lookup externe (TaxJar API?)
  - EU : TVA 20 % France, 19 % Allemagne, etc.
- [ ] `lib/tax-rates.ts` — config JSON statique provinces canadiennes (pas de SaaS)

  ```ts
  // taux officiels mai 2026 — mettre à jour manuellement si modification législative
  const CA_RATES = { QC: { gst: 0.05, pst: 0.09975 }, ON: { hst: 0.13 }, AB: { gst: 0.05 }, … }
  ```

- [ ] Seed `TaxRate` BD depuis ce JSON (script `packages/db/src/seed/tax-rates.ts`)
- [ ] USA : Sales Tax par état — table statique (0 % à ~10,25 %) + fallback 0 % si état inconnu
- [ ] Peuplement initial table `DutyRate` BD — CUSMA + UE + standard
- [ ] Sites bloqués/préférés par organisation
  - Interface `/dashboard/organisation/marketplaces`
  - Cocher/décocher marketplaces actives pour l'org
- [ ] Sites bloqués/préférés par user
  - `/dashboard/profil/marketplaces` — personnalisation

### 2C — Taux de change 🔄

> **Outil choisi : Frankfurter** (`https://api.frankfurter.app/latest`) — gratuit, données ECB, pas de clé API

- ✅ `lib/exchange.ts` — `getExchangeRate(from, to)` avec cache Redis 24h + persist BD
- ✅ `lib/redis.ts` — client Upstash Redis singleton
- [ ] Job Inngest `refresh-exchange-rates` — quotidien (données ECB mises à jour 1×/jour)
- [ ] Peuplement initial : CAD/USD, CAD/EUR, CAD/GBP, USD/EUR, USD/GBP (paires principales)

### 2D — Moteur de comparaison de prix 🔄 ★

- ✅ `app/dashboard/recherche/page.tsx` + `SearchClient.tsx` — UI complète avec quota, polling, segment bar
- ✅ `app/api/search/route.ts` — POST : quota → déduplication → create → Inngest/fallback sync
- ✅ `app/api/search/[id]/route.ts` — GET : polling résultats par searchId
- ✅ `inngest/scrape-search.ts` — Fonction `scrape/price-search` (retries: 3, délègue à `runScrapePipeline`)
- ✅ `lib/scrape-pipeline.ts` — pipeline autonome (scraping 6 sources → résolution marketplace → calcul → save)
- ✅ `app/api/inngest/route.ts` — Endpoint Inngest
- ✅ `lib/calculator.ts` — `calculateTruePrice()` complet (change + douanes CUSMA + taxes provinciales)
- ✅ `lib/duties.ts` — franchise 20 $ CAD, frais courtage DHL/UPS/FedEx par tranche
- ✅ `lib/tax-rates.ts` — toutes provinces CA, 50 États US, EU — JSON statique
- ✅ `packages/db/src/queries/searches.ts` — CRUD searches + quota check + déduplication
- ⏳ Seed BD `Marketplace` — Amazon.ca/.com, Best Buy CA/US, Apple CA/US (bloquant pour offres non-null)
- [ ] `lib/input-parsers.ts` — détection ASIN/SKU/URL/UPC depuis la query
- [ ] Sélecteur adresse de livraison dans la barre de recherche
- [ ] Sélecteur marketplaces (filtrer selon marché user)
- [ ] Vérification stock suffisant (`stockSufficient = stockQty >= searchQuantity`)
- [ ] Modes de livraison à afficher par marketplace :
  - Standard (expédition)
  - Pickup en magasin (si `Marketplace.supportsPickup`)
  - Instacart (si `Marketplace.supportsInstacart`)
  - DoorDash (si applicable)
- [ ] Affichage résultats
  - Segment bar horizontal (cyan = base, bleu = livraison, vert = taxes, ambre = douanes)
  - Meilleure offre mise en avant (halo cyan + badge MEILLEUR)
  - Sort par `truePriceTotal` ascendant
  - Filtre : en stock seulement, livraison directe seulement
- [ ] Limitation par plan (garde dans l'endpoint + message upgrade dans l'UI)
- [ ] Compteur usage dans le dashboard (x / 10 recherches ce mois)

### 2E — Rabais & Promotions ⏳ ★ CRUCIAL

> `ProductOffer` → `Discount[]` — 7 types à détecter et afficher.

- [ ] `lib/discounts.ts` — `applyDiscounts(offer, userContext)` → `priceFinal`
  - Identifier rabais auto-appliqués (`isAutoApplied: true`) → toujours appliqués
  - Identifier rabais conditionnels (membership, qty, bundle)
  - Calculer `priceAfterBestDiscount` = priceCurrent - rabais cumulables applicables
  - Avertir si meilleur prix nécessite condition non remplie (pas membre Prime)
- [ ] Affichage UI par type :
  - AUTOMATIC : badge vert "Rabais automatique"
  - COUPON : badge + code à copier (`code` affiché) + bouton copier
  - CONDITIONAL : badge orange + condition explicite (`condition` + `minQty`)
  - MEMBERSHIP : badge violet + icône membership + condition
  - SALE : badge rouge + compte à rebours si `expiresAt` < 72h
  - BUNDLE : badge bleu + détail du bundle
  - CASHBACK : badge cyan + info différé
- [ ] Indicateur "Se termine le [date]" amber si `expiresAt` < 72h
- [ ] Prix barré `priceOriginal` si différent de `priceCurrent`
- [ ] `priceLowest30d` affiché pour contexte (plus bas sur 30 jours)
- [ ] Note si rabais nécessite action (`isAutoApplied = false`) — ex: "Cliquez Coupon avant d'acheter"

### 2F — Catalogue produits ⏳ 🔒 (dépend 3A)

> Les produits sont créés à la volée lors du scraping, puis enrichis.

- [ ] `lib/product-catalog.ts`
  - `findOrCreateProduct(name, upc?, ean?)` — recherche par UPC/EAN d'abord, puis fuzzy name
  - `createVariant(productId, asin, sku, attributes)` — créer variant si nouveau ASIN
  - `mergeProducts(productId1, productId2)` — fusion doublons
- [ ] Enrichissement produit via UPC lookup (UPCitemdb API ou Open Food Facts)
  - Remplir `brand`, `description`, `imageUrl`, `category` si absents
- [ ] Catégorisation IA (`aiCategoryConfidence`) — GPT-4o assignation catégorie
  - Job asynchrone post-création produit
  - `category` + `subcategory` + `aiCategoryConfidence`
- [ ] `PriceHistory` — enregistrer prix à chaque scraping
  - `recordPriceHistory(variantId, marketplaceId, price, currency)`
  - Utilisé pour `priceLowest30d`, graphique historique, alertes

### 2G — Favoris & Listes produits 🔄

- ✅ `packages/db/src/queries/favorites.ts` — `addFavorite`, `removeFavorite`, `getUserFavorites`, `updateFavoriteTags`
- ✅ `app/api/favorites/route.ts` — GET list + POST create
- ✅ `app/api/favorites/[id]/route.ts` — DELETE + PATCH tags
- ✅ `app/dashboard/favoris/page.tsx` + `FavorisClient.tsx` — grille favoris, suppression, lien recherche, tags
- [ ] Bouton "Favori" ♡ sur chaque carte résultat de recherche (lier au POST /api/favorites)
- [ ] Listes produits (`ProductList`)
  - Page `/dashboard/listes`
  - Créer liste (nom, type : STANDARD / RECURRING / PROJECT, tags)
  - Ajouter/retirer items, drag-and-drop, partage équipe
- [ ] Listes récurrentes (RECURRING) — cron `run-recurring-lists`
- [ ] Listes projet (PROJECT) — somme `truePriceTotal` cumulée

### 2H — Alertes prix & stock 🔄

- ✅ `packages/db/src/queries/alerts.ts` — `ALERT_LIMITS`, quota check, CRUD price + stock alerts
- ✅ `app/api/alerts/route.ts` — GET (price + stock) + POST avec quota
- ✅ `app/api/alerts/[id]/route.ts` — DELETE + PATCH (toggle actif)
- ✅ `app/dashboard/alertes/page.tsx` + `AlertesClient.tsx` — UI complète (toggle, delete, empty states, plan badge)
- [ ] Job cron `check-price-alerts` — vérif toutes les heures → voir JOBS
- [ ] Job cron `check-stock-alerts` — vérif toutes les heures → voir JOBS
- [ ] Envoi notification quand déclenché : `triggeredAt = now()` + `isActive = false`
  - Canal selon `NotificationPreference` : email (Resend), in-app, SMS, push

### 2I — Partage & Collaboration ⏳ 🔒 (dépend 2D)

- [ ] Bouton "Partager" sur un résultat de recherche
  - Partage interne : sélectionner membre équipe → créer `SharedResult` + notifier
  - Partage externe : générer lien avec `shareToken` + `expiresAt` (7j par défaut)
  - Option message accompagnant le partage
- [ ] Page publique `/share/:token` (non protégée)
  - Afficher résultat de recherche en lecture seule
  - CTA inscription si non connecté
  - Respecter `expiresAt` (rediriger si expiré)
  - Marquer `viewedAt` au premier accès
- [ ] `allowExternalSharing` vérifiée (org peut bloquer le partage externe)
- [ ] Signalement prix erronés (`PriceReport`)
  - Bouton "Signaler un prix incorrect" sur chaque offre
  - Formulaire : prix réel observé + note
  - Admin reçoit notification

### 2J — Rapports & Analytiques ⏳ 🔒 (ENTERPRISE, dépend 2D)

- [ ] Page `/dashboard/rapports`
  - Sélecteur période (semaine / mois / trimestre / personnalisé)
  - KPIs : nb recherches, économies détectées, dépenses évitées, top marketplaces
  - Graphique économies cumulées (basé sur `truePriceTotal` vs prix local)
  - Table top produits recherchés par l'équipe
  - Table membres les plus actifs (si MANAGER/ADMIN)
- [ ] Rapport économies : somme `(priceLocal - truePriceTotal)` sur la période
- [ ] Export CSV rapport (`Report.data` → CSV)
- [ ] Export PDF rapport (avec logo org si white-label)
- [ ] Rapport planifié (`Report` BD)
  - Hebdomadaire : envoi email vendredi soir
  - Mensuel : envoi email 1er du mois
  - Config dans `/dashboard/organisation/rapports`
- [ ] Job cron génération rapports — voir JOBS

---

## PHASE 3 — Scraping & Sources de prix ⏳ ★

### 3A — Méthodes d'acquisition ⏳

> **Stratégie double-couche :** MVP = Crawlee (MIT, self-hosted) · Production = Firecrawl API (~19 USD/mois, zero-infra) · Découverte = SerpAPI + Exa.ai

| Méthode | Coût | Fiabilité | Priorité |
| --- | --- | --- | --- |
| Amazon PA API | Gratuit (affilié) | ⭐⭐⭐⭐⭐ | 1 — Amazon |
| Best Buy API | Gratuit (clé) | ⭐⭐⭐⭐ | Best Buy |
| Apple JSON API | Gratuit (public) | ⭐⭐⭐⭐⭐ | Apple |
| Walmart Open API | Gratuit (clé) | ⭐⭐⭐⭐ | Walmart |
| **Crawlee** (Playwright) | Infra only (MVP) | ⭐⭐⭐⭐ | Fallback + Costco |
| **Firecrawl** API | ~19 USD/mois (prod) | ⭐⭐⭐⭐⭐ | Fallback prod |
| **SerpAPI** Shopping | 100 req/mois gratuit | ⭐⭐⭐⭐ | Découverte prix |
| **Exa.ai** | Pay-per-use | ⭐⭐⭐⭐ | Découverte sites |

- [ ] Créer comptes affiliés Amazon PA API (CA + US + EU)
- [ ] Créer clés : Best Buy CA, Best Buy US, Walmart Open API, SerpAPI, Exa.ai
- [ ] Créer compte Firecrawl (activer en prod quand volume > 50 scrapes/jour)
- [ ] Ajouter toutes les clés dans `.env` : `SERPAPI_KEY`, `EXA_API_KEY`, `FIRECRAWL_API_KEY`, `AMAZON_PA_*`

### 3B — Sources par marketplace 🔄

**Canada :**

- ✅ Amazon.ca — `lib/scrapers/amazon-pa.ts` (PA API, Sig V4 maison, key-gated)
- ✅ Best Buy Canada — `lib/scrapers/bestbuy-ca.ts` (API JSON public)
- [ ] Costco.ca — Crawlee/Playwright (pas d'API publique)
- ✅ Apple Store Canada — `lib/scrapers/apple-store.ts` (JSON interne Apple, FAMILY_MAP 25+ regex)
- [ ] Walmart.ca — Walmart Open API ou Crawlee fallback

**USA :**

- ✅ Amazon.com — `lib/scrapers/amazon-pa.ts` (`marketplace: "www.amazon.com"`)
- ✅ Best Buy US — `lib/scrapers/bestbuy-us.ts` (key-gated `BESTBUY_US_API_KEY`)
- ✅ Apple Store US — `lib/scrapers/apple-store.ts` (même fichier que CA)
- [ ] Walmart.com — Walmart Open API (clé gratuite)

**Europe :**

- [ ] Amazon.fr / .de / .co.uk — PA API (marketplace EU)
- [ ] Étendre selon demande utilisateurs (Google Trends pour prioriser)

### 3C — Infrastructure de scraping 🔄

> **Jobs : Inngest** (serverless-native, steps retryables, UI dashboard gratuit, parfait Vercel)

- ✅ `packages/shared/src/inngest.ts` — client Inngest singleton (`new Inngest({ id: "trueprice-ai" })`)
- ✅ `apps/web/app/api/inngest/route.ts` — endpoint Inngest (serve handler)
- ✅ `apps/web/inngest/scrape-search.ts` — fonction `scrape/price-search` (retries: 3)
- ✅ `apps/web/lib/scrape-pipeline.ts` — pipeline partagé (scraping → marketplaces → calcul → sauvegarde)
- ✅ Fallback synchrone : si `INNGEST_SIGNING_KEY` absent → `void runScrapePipeline(...)` en background
- ✅ `dev:inngest` script — `npx inngest-cli@latest dev -u http://localhost:3000/api/inngest` (port 8288)
- ✅ `dev:full` script (root) — Next.js + Inngest CLI simultanément via `concurrently`
- [ ] Cache Upstash Redis par SKU (`price:{marketplace}:{sku}` · TTL 6h) — Redis optionnel en dev
- [ ] Crawlee (`PlaywrightCrawler`) pour Costco.ca / Walmart — Phase ultérieure
- [ ] Firecrawl API fallback (`USE_FIRECRAWL=true`) — activer si volume > 50 scrapes/jour
- [ ] Monitoring parsers (`MarketplaceStatusLog`) — `Marketplace.status = DEGRADED/DOWN` si taux échec > 10 %

### 3D — Parsing des rabais par source ⏳ 🔒 (dépend 3C)

| Source | Rabais détectés | Méthode |
| --- | --- | --- |
| Amazon (CA/US/EU) | Coupon clipper, Prime, Lightning deal, % off | CSS `.coupon-badge`, `.a-price-savings`, JSON-LD |
| Best Buy | Sale, Totaltech member, bundle | `regularPrice` vs `salePrice`, badges JSON |
| Apple | Tradeup, éducation, remboursement | Section "façons d'économiser" JSON |
| Walmart | Rollback, clearance, pack | Badge `.price-savings`, JSON structured data |
| Costco | Membre seulement, coupon PDF mensuel | Prix affiché vs prix catalogue |

- [ ] Parser de discounts par marketplace dans `packages/scraper/`
- [ ] Détecter `expiresAt` : scraper la date affichée (ex: "Deal ends in 2h 15m")
- [ ] Détecter `startsAt` pour promos futures annoncées
- [ ] Détecter `isAutoApplied` : coupon Amazon = false, % off affiché = true

### 3E — Gestion fournisseurs (ENTERPRISE) ⏳ 🔒 (dépend 1F)

- [ ] Page `/dashboard/organisation/fournisseurs`
- [ ] Ajouter fournisseur (nom, site, pays, devise, contact)
- [ ] Conditions commerciales :
  - Escompte global en % (`globalDiscountPct`)
  - Paiement à X jours (`paymentTermsDays`)
  - Compte de crédit (`hasCreditAccount`)
  - Commande minimale (`minimumOrderAmount`)
- [ ] Tarifs de livraison :
  - Franco de port si > X $ (`freeShippingThreshold`)
  - Tarif fixe (`shippingRateFlat`)
  - Barème par montant (`shippingRateTable` JSON : `[{maxAmount, rate}]`)
- [ ] Escomptes par catégorie (`SupplierCategoryDiscount`) — table éditable
- [ ] Dégressivité volume (`SupplierVolumeDiscount`) — table qty/amount → %
- [ ] Taux douaniers personnalisés (`CustomDutyRate`) — override pour ce fournisseur
- [ ] Niveau d'intégration (`SupplierIntegrationLevel`) :
  - API/EDI : URL + credentials chiffrés dans `integrationConfig`
  - SCRAPING : URL portail + credentials chiffrés
  - FILE : import manuel
  - MANUAL : saisie directe
- [ ] Intégrer `ProductOffer.supplierId` — offres fournisseur dans résultats de comparaison
- [ ] `lastSyncAt` + statut de synchronisation

### 3F — Import fichiers fournisseurs ⏳ 🔒 (dépend 3E + 5A)

> **Parsers :** `SheetJS` (xlsx/xls), `pdf-parse` (PDF texte), `papaparse` (CSV) + Claude Sonnet pour extraction structurée via Instructor.js

- [ ] Upload fichier (`SupplierFileImport`)
  - Types : INVOICE, CATALOG, PURCHASE_ORDER, PRICE_LIST, PRODUCT_LIST
  - Formats supportés : PDF, Excel (.xlsx/.xls), CSV — upload vers R2/S3
  - `documentDate` : date du document (pas de l'upload)
- [ ] `packages/scraper/src/file-parsers/` :
  - `parseExcel(buffer)` → `string[][]` via SheetJS (`xlsx`)
  - `parseCsv(text)` → `string[][]` via papaparse
  - `parsePdf(buffer)` → `string` via pdf-parse
- [ ] Pipeline Inngest `files/parse-supplier-file` :
  - Step 1 : télécharger fichier depuis R2, détecter format, parser en texte brut
  - Step 2 : envoyer texte + schéma Zod à Claude Sonnet via Instructor.js
  - Step 3 : valider output Zod → créer `ProductOffer[]` en BD
  - `parsedBy: "ai"` + `rowCount` + `errorLog` si extraction partielle
- [ ] Statuts : `pending → processing → done / error`
- [ ] Notification Inngest quand terminé (in-app + email)
- [ ] Interface de révision manuelle si `errorLog` non vide
- [ ] Historique imports par fournisseur

---

## PHASE 4 — API publique & Export ⏳ 🔒 (dépend 3A)

### 4A — API REST publique v1 ⏳

- [ ] `packages/api/src/routes/v1/` — endpoints REST
- [ ] `GET /api/v1/search` — lancer une recherche de prix
  - Auth : `Authorization: Bearer tp_live_xxxx`
  - Rate limiting : Upstash Redis (`@upstash/ratelimit`)
  - Quotas selon plan + `isSandbox`
- [ ] `GET /api/v1/search/:id` — récupérer résultats
- [ ] `GET /api/v1/products/:id` — détail produit + historique prix
- [ ] `GET /api/v1/rates` — taux de change temps réel (depuis `ExchangeRate` BD)
- [ ] `GET /api/v1/taxes` — taux de taxes par pays/province
- [ ] Versionnage URL (`/v1/`) + header `API-Version`
- [ ] Documentation API (Swagger/OpenAPI auto-généré)
- [ ] README API dans dashboard (`/dashboard/api/documentation`)

### 4B — Gestion des clés API ⏳ 🔒 (dépend 1F ENTERPRISE)

- [ ] Page `/dashboard/api/cles`
  - Créer clé : nom + `isSandbox` toggle
  - Afficher prefix `tp_live_abc1` ou `tp_test_abc1` (clé complète affichée 1 seule fois)
  - Stocker `keyHash = SHA-256(fullKey)` en BD — jamais la clé en clair
  - `lastUsedAt` affiché
  - Bouton révoquer (`isActive = false`)
- [ ] Limite selon plan (ENTERPRISE: 5 clés, ENTERPRISE_PRO: illimité)
- [ ] Mode sandbox : clés `tp_test_*` → résultats fictifs, pas de quota consommé

### 4C — Export CSV & PDF ⏳ 🔒 (dépend 2D — PREMIUM+)

- [ ] Bouton "Exporter" sur chaque résultat de recherche
- [ ] Export CSV : colonnes marketplace, prix brut, devise, change, livraison, taxes, douanes, `truePriceTotal`
- [ ] Export PDF : mise en page avec logo TruePriceAI, segment bar, meilleure offre mise en avant
- [ ] Export rapport (Phase 2J) : CSV + PDF
- [ ] Bloquer export si plan FREE + message upgrade

### 4D — Webhooks outbound ⏳ 🔒 (dépend ENTERPRISE)

- [ ] Page `/dashboard/organisation/webhooks`
  - Créer webhook : URL destination + events souscrits
  - Events disponibles : `search.completed`, `alert.triggered`, `batch.done`, `report.ready`, `member.joined`, `member.removed`
  - Secret HMAC auto-généré (chiffré en BD, affiché une seule fois)
- [ ] Envoi webhook : POST vers URL + headers `X-TruePriceAI-Signature` (HMAC-SHA256)
- [ ] Retry 3× avec backoff exponentiel si échec (status != 2xx)
- [ ] Log des envois (succès/échec)

---

## PHASE 5 — IA ⏳ 🔒 (dépend 3A)

### 5A — Fonctionnalités IA ⏳

> **Stack IA :** Claude Sonnet (`claude-sonnet-4-6`) + **Instructor.js** (Zod structured output) — pas d'OpenAI, cohérence totale avec notre modèle

- [ ] `lib/ai.ts` — client Anthropic + Instructor.js singleton

  ```ts
  import Anthropic from "@anthropic-ai/sdk";
  import Instructor from "@instructor-ai/anthropic";
  const client = Instructor({ client: new Anthropic(), mode: "TOOLS" });
  ```

- [ ] Middleware quota avant chaque appel IA :
  - Vérifier `aiTokensUsed < aiTokensLimit` via `@upstash/ratelimit`
  - Si BYOK (ENTERPRISE_PRO) → utiliser `byokApiKey` déchiffré, pas de quota
  - Après appel : décompter `response.usage.input_tokens + output_tokens` → `consumeAiTokens()`
- [ ] `lib/ai-extractor.ts` — extraction structurée produit via Instructor + Zod
  - Schéma Zod : `{ name, brand, price, currency, sku, availability, discounts[] }`
  - Utilisé par scraper (pages HTML → données structurées) et parseur fichiers
- [ ] Résumé intelligent post-recherche (`PriceSearch.aiSummary`)
  - "La meilleure offre est Amazon.com à 1 142 $ CAD tout inclus. Vous économisez 356 $ vs Best Buy Canada."
- [ ] Catégorisation automatique produits (job Inngest `products/categorize`, toutes les 6h)
- [ ] Conversation contextuelle sur un résultat (`AiConversation`)
  - Streaming SSE via `streamText` · context : `PriceSearch` + `ProductOffer[]` + user market
- [ ] Suggestions produits alternatifs (SerpAPI + Exa.ai pour trouver variantes moins chères)

### 5B — Gestion tokens IA ⏳

> **Enforcement :** `@upstash/ratelimit` (sliding window mensuel) + `response.usage` pour décompte précis

- [ ] `lib/ai-quota.ts` — `checkAndConsumeTokens(userId, estimatedTokens)`
  - `@upstash/ratelimit` : window 30j, limite selon plan (PREMIUM: 10K, ENTERPRISE: 50K)
  - Si quota dépassé → 429 avec message upgrade
- [ ] `consumeAiTokens(userId, amount)` — enregistre en BD après chaque appel (audit)
- [ ] Dashboard usage IA (`/dashboard/ia`)
  - Compteur tokens utilisés / limite ce mois (barre de progression)
  - Historique appels + tokens par opération
  - Reset date (`aiTokensResetAt` — 1er du mois)
- [ ] Achat tokens supplémentaires — Stripe Payment Intent (one-time)
  - Pack 10K · Pack 50K · Pack 200K — webhook `payment_intent.succeeded` déjà géré
- [ ] Achat tokens org (ENTERPRISE) — `OrgAiTokenPurchase`
- [ ] BYOK (ENTERPRISE_PRO)
  - `byokApiKey` chiffré AES-256-GCM avant stockage
  - Si BYOK → utiliser cette clé Anthropic, zéro quota TruePriceAI consommé
- [ ] Job Inngest `tokens/reset-monthly` — 1er du mois : `aiTokensUsed = 0`

### 5C — Alertes intelligentes ⏳ 🔒 (dépend 2H + 5A)

- [ ] Email hebdomadaire "Meilleures offres pour vous" (basé sur favoris + listes)
- [ ] Prédiction tendance de prix (IA sur `PriceHistory` — montant 30j)
  - "Le prix de cet article a tendance à baisser avant Black Friday"
- [ ] Suggestion "Attendre ou acheter maintenant ?" basée sur tendance

---

## PHASE 6 — Notifications ⏳ 🔒 (dépend 1H)

> Système de notification multi-canal unifié. Tous les envois passent par `lib/notifications.ts`.

### 6A — Service email ⏳ ★ PROCHAINE ÉTAPE

- ✅ Service choisi : **Resend** (100 emails/j gratuit, React Email, domaine custom)
- [ ] Créer compte Resend + ajouter `RESEND_API_KEY` dans `.env`
- [ ] Configurer domaine `@truepricai.ca` dans Resend (SPF, DKIM, DMARC)
- [ ] `lib/email.ts` — `sendEmail(to, template, data)` via Resend SDK
- [ ] Templates email (React Email) :
  - Alerte prix déclenchée ← priorité (lié à 2H)
  - Alerte stock déclenchée ← priorité (lié à 2H)
  - Invitation organisation
  - Fin d'essai imminente (3j avant)
  - Paiement échoué
  - Bienvenue post-inscription
  - Confirmation suppression compte (RGPD)
  - Export données prêt
  - Rapport hebdomadaire / mensuel
  - Partage de résultat reçu
  - Changelog (si PREMIUM+)

### 6B — Notifications in-app ⏳

- [ ] `NotificationPreference` consultée avant tout envoi
- [ ] Cloche 🔔 dans navbar avec badge nombre non lus
- [ ] Panel notifications coulissant (liste chronologique)
- [ ] Types : alerte prix, alerte stock, partage reçu, invitation, rapport prêt, changelog
- [ ] Marquer lu / tout marquer lu

### 6C — SMS ⏳ (optionnel, Phase ultérieure)

- [ ] Service : Twilio (0,0079 $ CA/SMS)
- [ ] Uniquement pour alertes prix/stock critiques (opt-in explicite)
- [ ] Vérification numéro de téléphone avant activation

### 6D — Push notifications ⏳ (app mobile/desktop — Phase ultérieure)

- [ ] Web push (desktop) via Web Push API
- [ ] Mobile push si app mobile (Expo Push ou FCM)

---

## PHASE 7 — Intégrations Enterprise ⏳ 🔒 (ENTERPRISE)

### 7A — Intégrations POS / ERP / BI ⏳

- [ ] Page `/dashboard/organisation/integrations`
  - Liste intégrations disponibles avec logo + statut
  - Bouton "Connecter" par intégration
- [ ] POS supportés : Lightspeed, Square, Shopify, Clover, LS Retail, MaîtreD, Veloce, ACOMBA, Alice
  - Config : URL, credentials chiffrés (`integrationConfig`)
  - Sync : produits, prix d'achat, historique commandes
- [ ] ERP supportés : SAP, NetSuite, Dynamics365, QuickBooks, Sage, Odoo, FreshBooks, Wave, Xero
  - Sync : fournisseurs, factures, bons de commande
- [ ] BI supportés : Google Sheets, Power BI, Tableau, Looker
  - Export automatique des données de recherche/rapports
- [ ] `lastSyncAt` + `lastSyncStatus` + `lastSyncError` par intégration
- [ ] Job cron sync intégrations (configurable par intégration — voir JOBS)

### 7B — Chiffrement des données sensibles ⏳ ★

> Données à chiffrer avant stockage BD : `integrationConfig`, `byokApiKey`, `ssoConfig`, `webhook.secret`, `supplier.integrationConfig`

- [ ] `packages/shared/src/encrypt.ts`
  - `encrypt(plaintext)` → ciphertext (AES-256-GCM)
  - `decrypt(ciphertext)` → plaintext
  - Clé de chiffrement dans `.env` : `ENCRYPTION_KEY` (256 bits, jamais en BD)
- [ ] Appliquer chiffrement dans toutes les queries concernées
- [ ] Rotation de clé : script de re-chiffrement

### 7C — SSO organisationnel ⏳ 🔒 (ENTERPRISE_PRO)

- [ ] Providers : Okta, Azure AD, Google Workspace
- [ ] `Organization.ssoProvider` + `Organization.ssoConfig` (chiffré)
- [ ] Middleware SAML/OIDC dans Clerk ou implémentation custom
- [ ] Flow : user du domaine org → redirigé vers IdP → token → session TruePriceAI
- [ ] `Organization.enforce2FA` — si SSO, 2FA géré par l'IdP

### 7D — White-label ⏳ 🔒 (ENTERPRISE_PRO)

- [ ] `Organization.customDomain` — `prix.acme.com` → pointe vers TruePriceAI
- [ ] `Organization.whitelabelConfig` — logo, couleurs primaire/secondaire, favicon
- [ ] `Organization.brandingConfig` — template email custom, footer custom
- [ ] Dashboard admin white-label : upload logo, sélecteur couleurs, preview

---

## PHASE 8 — Administration Plateforme ⏳ 🔒 (Role: ADMIN)

> Panel interne pour l'équipe TruePriceAI — non visible par les users.

### 8A — Dashboard admin ⏳

- [ ] Route `/admin` — protégée par `Role: ADMIN`
- [ ] KPIs plateforme :
  - Nb users actifs (day/week/month)
  - Nb recherches totales
  - Revenus MRR (via Stripe)
  - Répartition plans (FREE/PREMIUM/ENTERPRISE)
  - Top marketplaces utilisées
- [ ] Gestion utilisateurs
  - Recherche par email/clerkId
  - Voir plan, dates, historique
  - Changer plan manuellement (override)
  - Désactiver compte
- [ ] Gestion organisations
  - Liste orgs avec plan, nb membres, `stripeCustomerId`
  - Voir et modifier paramètres org

### 8B — Référentiels ⏳

- [ ] Gestion marketplaces (`Marketplace`)
  - CRUD : ajouter, activer/désactiver, config scraping
  - Forcer statut (`status = DOWN`)
- [ ] Gestion taux de taxes (`TaxRate`) — mise à jour manuelle + source officielle
- [ ] Gestion taux douaniers (`DutyRate`) — mise à jour manuelle
- [ ] Gestion changelogs (`Changelog`) — créer/publier notes de version
  - Audience : ALL / PREMIUM_PLUS / ENTERPRISE_ONLY

### 8C — Monitoring ⏳

- [ ] Logs erreurs scraping par marketplace
- [ ] Statut queue jobs (BullMQ dashboard ou page custom)
- [ ] Signalements prix (`PriceReport`) — liste + modération
- [ ] Tickets support (`SupportTicket`) — liste + assignation + réponse
  - Notification email à l'admin quand nouveau ticket

---

## PHASE 9 — Support, Changelog & Statut ⏳

### 9A — Support intégré ⏳

- [ ] Page `/dashboard/support`
  - Formulaire nouveau ticket (sujet, description, priorité)
  - Liste tickets ouverts/résolus avec statut
- [ ] Créer `SupportTicket` en BD + notifier admin (email)
- [ ] Flow admin : voir ticket → répondre → changer statut (open → in_progress → resolved)

### 9B — Changelog in-app ⏳

- [ ] API `GET /api/changelogs` — filtrée selon plan user
- [ ] Panel changelog dans dashboard (liste versions avec body markdown)
- [ ] Badge "Nouveau" sur la cloche si changelog non lu (`ChangelogRead`)
- [ ] `ChangelogRead` créé au moment de la lecture
- [ ] Admin peut publier changelog depuis Phase 8B

### 9C — Page de statut publique ⏳

- [ ] Page `/status` (non protégée)
  - Statut de chaque marketplace (OPERATIONAL / DEGRADED / DOWN)
  - Historique incidents (30 derniers jours via `MarketplaceStatusLog`)
  - Indicateur global (tout opérationnel / incident en cours)
- [ ] Abonnement aux updates de statut (email optionnel)

---

## JOBS & CRONS — Tâches planifiées ⏳

> Toutes les tâches automatisées. **Service : Inngest** (serverless-native, Next.js/Vercel, dashboard UI, retry automatique).

| Job | Fréquence | Description |
| --- | --- | --- |
| `refresh-exchange-rates` | Toutes les heures | Fetch taux de change + MAJ `ExchangeRate` BD |
| `check-price-alerts` | Toutes les heures | Vérifier `PriceAlert` actives → notifier si prix cible atteint |
| `check-stock-alerts` | Toutes les heures | Vérifier `StockAlert` actives → notifier si retour en stock |
| `run-recurring-lists` | Quotidien | Relancer recherches pour listes où `nextRunAt <= now` |
| `reset-search-counts` | 1er du mois | `searchCountMonth = 0` + `searchResetAt = now` (tous users) |
| `reset-ai-tokens` | 1er du mois | `aiTokensUsed = 0` + `aiTokensResetAt = now` (users + orgs) |
| `expire-trial-plans` | Quotidien | Si `trialEndsAt < now` et pas converti → plan FREE |
| `clean-expired-searches` | Quotidien | Supprimer `PriceSearch` où `expiresAt < now` |
| `gdpr-delete-users` | Quotidien | Supprimer users où `gdprDeleteRequestedAt < now - 30j` |
| `send-weekly-reports` | Vendredi 18h | Générer + envoyer rapports hebdo aux orgs abonnées |
| `send-monthly-reports` | 1er du mois 8h | Générer + envoyer rapports mensuels |
| `ai-categorize-products` | Toutes les 6h | Catégoriser produits sans `category` via GPT-4o |
| `sync-integrations` | Configurable | Sync POS/ERP selon config par intégration |
| `monitor-marketplace-health` | Toutes les 30min | Vérifier taux échec scraping → MAJ `Marketplace.status` |
| `purge-expired-invitations` | Quotidien | Supprimer `OrganizationInvitation` expirées |
| `send-trial-ending-emails` | Quotidien | Email si `trialEndsAt` dans 3 jours |

- ✅ Service choisi : **Inngest** (crons + scheduled functions, serverless-native)
- ⏳ `apps/web/inngest/jobs/` — fichiers cron Inngest (à implémenter par priorité)
- [ ] Logging de chaque exécution (`UsageLog` action = "cron:*")
- [ ] Alertes admin si job échoue 3× de suite

---

## SCHÉMA BD — État ✅ COMPLET & MIGRÉ

> `packages/db/prisma/schema.prisma` — écrit + pushé sur Neon (mai 2026)

### Checklist

- ✅ 15 enums définis
- ✅ 40+ modèles définis
- ✅ Relations bidirectionnelles vérifiées
- ✅ `db:generate` — Prisma Client généré (v6.19.3)
- ✅ `db:push` — tables créées sur Neon (neondb, us-east-1, 5,75s)
- ✅ `packages/db/src/index.ts` — exports + singleton client (queries users, orgs, subscriptions, searches, favorites, alerts)
- ✅ `packages/db/src/queries/` — helpers par domaine complets
- ⏳ Seed `Marketplace` — Amazon.ca/.com, Best Buy CA/US, Apple CA/US (bloquant pour `marketplaceId` non-null)
- ⏳ Seed `TaxRate` + `DutyRate` — taux officiels (déjà dans `lib/tax-rates.ts` JSON statique)
- ⏳ `npm run db:migrate` — migration versionnée (avant production)

---

## STRIPE — Flux complets ⏳

```text
User s'inscrit (Clerk)
    ↓ webhook Clerk user.created
    ↓ User créé en BD + Stripe Customer + stripeCustomerId sauvegardé
    ↓ isTrialing = true, trialEndsAt = now + 14j, trialPlan = PREMIUM

User upgrade → PREMIUM
    ↓ Stripe Checkout (price_id PREMIUM)
    ↓ webhook checkout.session.completed
    ↓ Subscription BD créée, user.plan = PREMIUM, isTrialing = false
    ↓ Clerk publicMetadata { plan: "PREMIUM" }
    ↓ adsEnabled = false

Fin d'essai sans conversion
    ↓ job cron quotidien : trialEndsAt < now et pas de Subscription active
    ↓ user.plan = FREE, isTrialing = false, adsEnabled = true

Paiement échoué
    ↓ webhook invoice.payment_failed
    ↓ email notif + in-app "Paiement échoué — mettez à jour votre carte"
    ↓ status = PAST_DUE (accès maintenu 7j puis rétrogradé)
```

---

## Notes techniques

- **Clerk session claims** — `publicMetadata` dans JWT. Refresh ~1 min après MAJ API Clerk.
- **Chiffrement** — AES-256-GCM pour : `integrationConfig`, `byokApiKey`, `ssoConfig`, `webhook.secret`, `supplier.integrationConfig`. Clé `ENCRYPTION_KEY` dans `.env`, jamais en BD.
- **Déduplication** — même `(userId, query)` < 6h → `PriceSearch.deduplicatedFromId` + pas de quota consommé.
- **Soft deletes** — uniquement `OrganizationMembership.removedAt` et `User.gdprDeleteRequestedAt`. Pas de soft delete généralisé.
- **Sessions** — max 2 web, 1 mobile, 1 desktop simultanées. Révocation depuis `/dashboard/securite`.
- **History retention** — selon plan (FREE: 7j, PREMIUM: 90j, ENTERPRISE: `historyRetentionDays` = 2 ans).
- **Taxes** — calculées selon adresse de livraison (province/état), pas juste le pays.
- **CUSMA** — franchise 20 $ CAD courrier, 800 $ USD dédouanement simplifié. Frais courtage DHL/FedEx/UPS estimés.
- **Rate limiting API** — Upstash Redis `@upstash/ratelimit` par clé API + par IP.
- **Ads** — `User.adsEnabled = true` (FREE), `false` dès premier paiement. Réactivé si plan rétrogradé.
- **Multi-org** — user peut appartenir à plusieurs orgs. `organizationId` courant stocké en cookie de session.
