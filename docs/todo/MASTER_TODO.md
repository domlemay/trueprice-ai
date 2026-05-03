# MASTER TODO — TruePriceAI

> Feuille de route complète. Mise à jour au fil des sessions.
> Légende : ✅ fait · 🔄 en cours · ⏳ prochain · 🔒 bloqué par dépendance

---

## PHASE 0 — Fondations ✅

- ✅ Projet Next.js 14 initialisé (TypeScript strict, Tailwind 3.4, shadcn/ui)
- ✅ Design system v1.0 (tokens `tp-*`, navy + cyan, Syne/DM Sans/JetBrains Mono)
- ✅ Landing page marketing complète (11 sections)
- ✅ Migration design system — tous les composants sur `tp-*`
- ✅ GitHub repo public (`github.com/domlemay/trueprice-ai`, branche `master`)
- ✅ Turborepo monorepo (apps/web, apps/worker, packages/db, api, scraper, shared)
- ✅ Neon PostgreSQL connecté (`packages/db`, Prisma 6)
- ✅ `.env` unique à la racine (Clerk + Neon)

---

## PHASE 1 — Auth & Abonnements 🔄

### 1A — Clerk Auth 🔄

- ✅ Installer `@clerk/nextjs` v7
- ✅ `middleware.ts` — protège toutes les routes non-publiques
- ✅ Pages `/sign-in` et `/sign-up` avec apparence TruePriceAI
- ✅ `ClerkProvider` configuré (afterSignOutUrl, signInUrl, signUpUrl)
- ✅ `lib/auth.ts` — helpers `requireAuth()`, `requirePlan()`, `getSessionPlan()`
- ✅ `types/clerk.d.ts` — augmentation `CustomJwtSessionClaims` (plan, role)
- ✅ Dashboard placeholder (layout protégé + page accueil)
- ⏳ Entrer les vraies clés Clerk dans `.env` (pk_test_*** / sk_test_***)
- ⏳ Sync webhook Clerk → BD (créer user en BD au `user.created`)
- ⏳ Tester le flow complet sign-up → dashboard → sign-out

### 1B — Base de données (Prisma + Neon) ⏳

Voir section **SCHÉMA BD** ci-dessous pour le détail complet.

- ⏳ Ajouter `plan` + `planExpiresAt` au modèle `User`
- ⏳ Créer modèle `Subscription` (Stripe)
- ⏳ Créer modèle `UsageLog`
- ⏳ Créer modèle `ApiKey` (Entreprise)
- ⏳ `prisma migrate dev --name init` — première migration sur Neon
- ⏳ `packages/db/src/index.ts` — exporter tous les modèles + types utiles
- ⏳ Brancher `@trueprice-ai/db` dans `apps/web` (`import { prisma } from "@trueprice-ai/db"`)

### 1C — Stripe ⏳

Voir section **STRIPE** ci-dessous pour le détail.

---

## PHASE 2 — Géolocalisation & Logique marché ⏳

> Crucial : l'app est internationale. Un acheteur au Canada ne peut pas acheter sur Amazon.com
> (pas de livraison directe, droits de douane, etc.). La logique de comparaison doit être
> adaptée au pays d'origine du user.

### 2A — Détection de la localisation ⏳

- [ ] **IP geolocation** au chargement — détecter pays + région (ex: ipapi.co, MaxMind GeoLite2)
  - Stocker en cookie de session + Clerk publicMetadata si connecté
- [ ] **Préférence manuelle** — le user peut forcer son pays dans les settings
- [ ] **Langue/devise** — dériver la devise par défaut du pays (CAD, USD, EUR, GBP…)
- [ ] `lib/geo.ts` — helper `getUserMarket()` retourne `{ country, currency, locale, taxRegion }`

### 2B — Matrice marché par pays ⏳

> Règle fondamentale : comparer UNIQUEMENT les marketplaces accessibles depuis le pays du user.

| Pays user | Marketplace principale | Comparé avec | Logique douanière |
|---|---|---|---|
| 🇨🇦 Canada | Amazon.ca / BestBuy.ca | Amazon.com + Best Buy US | CUSMA, franchise 20 $ CAD |
| 🇺🇸 USA | Amazon.com / Walmart.com | Amazon.ca + alternatives CA | Rare (import depuis CA) |
| 🇫🇷 France | Amazon.fr | Amazon.com + prix CA | TVA 20%, droits UE |
| 🇬🇧 UK | Amazon.co.uk | Amazon.com | Post-Brexit droits |
| 🇩🇪 Allemagne | Amazon.de | Amazon.com | TVA 19%, droits UE |
| autres | Amazon local | Amazon.com | Droits généraux |

- [ ] `lib/markets.ts` — table de correspondance pays → marketplaces disponibles
- [ ] `lib/duties.ts` — règles douanières par paire de marchés (taux, franchises, exemptions)
- [ ] Adapter les résultats de recherche au marché détecté (ne jamais proposer une livraison impossible)

### 2C — Moteur de comparaison de prix ⏳

- [ ] Interface de recherche (barre de recherche + résultats)
- [ ] Endpoint API `/api/search` (protégé, limité par plan)
- [ ] **Pipeline de calcul** — `lib/calculator.ts`
  - Taux de change en temps réel (ex-rates API, Open Exchange Rates, ou Fixer.io)
  - Taxes locales selon pays + région (GST/TVQ, HST, TVA, Sales Tax US par état…)
  - Droits de douane selon paire de marchés (`lib/duties.ts`)
  - Frais de livraison estimés (poids volumétrique, distance, transporteur)
  - Frais de courtage en douane (DHL, UPS, FedEx — souvent sous-estimés)
- [ ] Affichage résultat — segment bar (cyan base, bleu livraison, vert taxes, ambre douanes)
- [ ] Vérifier les limites `PLAN_LIMITS` avant chaque recherche
- [ ] Sauvegarder chaque recherche dans `PriceSearch` (BD)
- [ ] Compteur d'utilisation mensuelle dans le dashboard

### 2D — Rabais & Promotions ⏳ ★ CRUCIAL

> Chaque offre doit exposer tous les rabais disponibles : montant, condition, date de fin.
> Schéma BD : `ProductOffer` → `Discount[]` (déjà défini dans `schema.prisma`).

**Ce qu'on doit détecter et stocker par offre :**

- [ ] **Rabais automatiques** — appliqués sans action (prix déjà réduit dans le panier)
- [ ] **Coupons** — coupon Amazon à "clipper", codes promo à saisir au checkout
  - Afficher le code si disponible
  - Indiquer si l'action est requise avant l'achat (`isAutoApplied: false`)
- [ ] **Offres conditionnelles** — "Achetez-en 2, économisez 10 %", "Avec échange", "Reconditionné certifié"
  - Stocker la condition lisible dans `condition` (ex: "Quantité minimale : 2 unités")
  - Stocker `minQty` si applicable
- [ ] **Offres membres** — Amazon Prime, Costco Gold Star, Best Buy Totaltech…
  - Type `MEMBERSHIP`, `condition` = "Abonnement Amazon Prime requis"
  - Afficher clairement que c'est réservé aux membres
- [ ] **Promotions temporaires** — Flash sale, Black Friday, vente de liquidation
  - `expiresAt` quand connue (scraper la date de fin affichée sur la page)
  - `startsAt` pour les promotions futures annoncées
- [ ] **Cashback** — programmes de remboursement différé (Rakuten, carte de crédit, etc.)
- [ ] **Bundles** — "Achat groupé avec accessoires à -20 %"

**Affichage UI des rabais (Phase 2D) :**

- [ ] Badge "RABAIS" cyan sur la carte offre si au moins un discount actif
- [ ] Liste déroulante des rabais avec icône par type :
  - 🏷️ Coupon / Code promo
  - ⚡ Vente flash (avec compte à rebours si `expiresAt` proche)
  - 👑 Membres seulement
  - 📦 Offre conditionnelle (avec la condition explicite)
  - 💰 Cashback
- [ ] Indicateur "Se termine le [date]" en amber/warning si `expiresAt` < 72h
- [ ] Prix barré `priceOriginal` visible quand différent de `priceCurrent`
- [ ] Prix "après meilleur rabais" calculé = `priceCurrent` - rabais applicables empilables
- [ ] Note claire si un rabais nécessite une action (cliquer, s'abonner, entrer un code)

**Sources de rabais à scraper :**

| Source | Type de rabais | Méthode de détection |
|---|---|---|
| Amazon (CA/US/EU) | Coupon clipper, Prime, Lightning deal, % off | Sélecteurs CSS dédiés + badge "Coupon" |
| Best Buy | Vente, membre Totaltech, bundle | Balises JSON-LD + badges promo |
| Apple Store | Remboursement avec échange, éducation | Section "façons d'économiser" |
| Walmart | Rollback, clearance, pack | Badge + prix barré |
| Costco | Membre seulement, coupon mensuel | PDF coupon + prix affiché |

**Logique de calcul avec rabais :**

```
priceFinal = priceCurrent
           - sum(discounts où isAutoApplied = true)
           - meilleur(discounts cumulables où condition remplie)

truePriceTotal = (priceFinal × exchangeRate)
              + shippingCost
              + dutyAmount
              + taxAmount
              + brokerageFee
```

- [ ] `lib/discounts.ts` — `applyDiscounts(offer, userContext)` → prix final
- [ ] Avertir l'user si le meilleur prix nécessite une condition qu'il ne remplit pas (ex: pas membre Prime)

---

## PHASE 3 — Scraping / Sources de prix ⏳

> La recherche de prix est le cœur du produit. Plusieurs approches à évaluer selon coût/fiabilité.

### 3A — Méthodes d'acquisition des prix (choisir selon budget)

| Méthode | Coût | Fiabilité | Complexité | Recommandation |
|---|---|---|---|---|
| **Amazon Product Advertising API** | Gratuit (besoin compte affilié) | ⭐⭐⭐⭐⭐ | Faible | ✅ Priorité 1 pour Amazon |
| **Rainforest API** (Amazon proxy) | ~50 $/mois | ⭐⭐⭐⭐⭐ | Très faible | ✅ Si pas affilié |
| **PriceAPI.com** | ~30 $/mois | ⭐⭐⭐⭐ | Très faible | ✅ Multi-source |
| **Scraping Playwright** | Infra seulement | ⭐⭐⭐ | Élevée | ⚠️ Risque blocage |
| **Google Shopping API** | Variable | ⭐⭐⭐⭐ | Moyenne | ✅ Pour enrichissement |

### 3B — Sources par marché

**Canada :**
- [ ] Amazon.ca — API affilié ou Rainforest API
- [ ] Best Buy Canada — JSON API publique (non documentée)
- [ ] Costco.ca — scraping (pas d'API)
- [ ] Apple Store Canada — API JSON structurée (stable)
- [ ] Walmart.ca — API partenaire ou scraping

**USA :**
- [ ] Amazon.com — Amazon PA API (même compte affilié, marketplace US)
- [ ] Best Buy US — API publique (clé gratuite)
- [ ] Apple Store US — API JSON (même structure que CA)
- [ ] Walmart.com — API Walmart Open (gratuite, clé requise)

**Europe / autres :**
- [ ] Amazon.fr / .de / .co.uk — Amazon PA API (marketplace EU)
- [ ] Étendre selon la demande utilisateurs

### 3C — Infrastructure scraping (`apps/worker`)

- [ ] `apps/worker` — service Node.js avec Playwright
- [ ] Cache Redis (Upstash) — TTL 6h par URL produit, TTL 1h pour taux de change
- [ ] Queue de jobs (BullMQ ou Cloudflare Queues) — ne pas bloquer la requête HTTP
- [ ] Fallback : si scraping échoue → retourner prix en cache + flag `stale: true`
- [ ] Monitoring des parsers (alerte si taux d'échec > 10 %)

### 3D — Inputs de recherche supportés

- [ ] Nom de produit / mots-clés (recherche fuzzy)
- [ ] Code UPC / EAN / barcode
- [ ] URL produit (Amazon, Best Buy, Apple, etc.) → extraire ASIN ou product ID
- [ ] Modèle exact (ex: "iPhone 16 Pro 256GB Natural Titanium")
- [ ] ASIN Amazon (recherche directe)

---

## PHASE 4 — Export & API publique ⏳

- ⏳ Export CSV / PDF (PREMIUM+)
- ⏳ API REST publique (`/api/v1/price`) — clé API, rate limiting
- ⏳ Dashboard API Keys (Entreprise)
- ⏳ Documentation API (swagger / readme)

---

## PHASE 5 — IA ⏳

- ⏳ Résumé intelligent du meilleur achat (GPT-4o)
- ⏳ Suggestion de produits alternatifs moins chers
- ⏳ Alertes prix (email quand le prix baisse)

---

---

## SCHÉMA BD — Détail complet ⏳

> Fichier : `packages/db/prisma/schema.prisma`
> Tous les modèles à créer ou compléter avant `prisma migrate dev`.

### `users` — À COMPLÉTER

Ajouter aux champs existants (`id`, `clerkId`, `email`, `name`) :

```prisma
plan             Plan     @default(FREE)
planExpiresAt    DateTime?
stripeCustomerId String?  @unique
searchCountMonth Int      @default(0)  // reset chaque 1er du mois
searchResetAt    DateTime @default(now())
role             Role     @default(USER)
createdAt        DateTime @default(now())
updatedAt        DateTime @updatedAt
```

Enums à ajouter :

```prisma
enum Plan { FREE  PREMIUM  ENTERPRISE }
enum Role { USER  ADMIN }
```

---

### `subscriptions` — À CRÉER

```prisma
model Subscription {
  id                   String             @id @default(cuid())
  userId               String             @unique
  user                 User               @relation(fields: [userId], references: [id], onDelete: Cascade)

  stripeSubscriptionId String             @unique
  stripePriceId        String
  stripeCustomerId     String

  plan                 Plan
  status               SubscriptionStatus
  currentPeriodStart   DateTime
  currentPeriodEnd     DateTime
  cancelAtPeriodEnd    Boolean            @default(false)
  canceledAt           DateTime?

  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt

  @@map("subscriptions")
}

enum SubscriptionStatus {
  TRIALING
  ACTIVE
  PAST_DUE
  CANCELED
  UNPAID
  INCOMPLETE
}
```

---

### `price_searches` — À COMPLÉTER

Ajouter aux champs existants :

```prisma
category         String?   // ex: "electronics", "clothing"
productName      String?
imageUrl         String?
dutyCategoryCode String?   // code CUSMA
provinceCA       String?   // province de livraison (pour les taxes)
cached           Boolean   @default(false)
```

---

### `usage_logs` — À CRÉER

```prisma
model UsageLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  action    String   // "search", "export_csv", "export_pdf", "api_call"
  metadata  Json?    // { query, priceCAD, priceUSD, ... }
  createdAt DateTime @default(now())

  @@map("usage_logs")
}
```

---

### `api_keys` — À CRÉER (Entreprise)

```prisma
model ApiKey {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String
  keyHash     String   @unique  // SHA-256 de la clé, jamais la clé en clair
  prefix      String            // ex: "tp_live_xxxx" — affiché dans le dashboard
  lastUsedAt  DateTime?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  @@map("api_keys")
}
```

---

### Checklist migration BD

- [ ] Mettre à jour `packages/db/prisma/schema.prisma` avec tous les modèles ci-dessus
- [ ] `npm run db:generate` (génère le Prisma Client)
- [ ] `npm run db:push` (applique le schéma sur Neon sans migration)
  - Utiliser `db:push` en développement, `db:migrate` en production
- [ ] Exporter les types utiles depuis `packages/db/src/index.ts`
  - `export type { User, Subscription, PriceSearch, Plan, Role } from "@prisma/client"`
- [ ] Créer `packages/db/src/queries/users.ts` — helpers DB pour les users
- [ ] Créer `packages/db/src/queries/subscriptions.ts` — helpers Stripe/abonnements
- [ ] Webhook Clerk `user.created` → `prisma.user.create({ clerkId, email })`

---

---

## STRIPE — Intégration complète ⏳

### Compte & Produits Stripe

- [ ] Créer un compte Stripe (ou utiliser l'existant)
- [ ] Créer 3 produits dans Stripe Dashboard :
  - **FREE** — 0 $/mois (pas de produit Stripe, géré en BD)
  - **PREMIUM** — 14,99 $ CAD/mois (ou annuel)
  - **ENTREPRISE** — 49,99 $ CAD/mois (ou annuel + contact sales)
- [ ] Récupérer les `price_id` Stripe pour chaque plan
- [ ] Ajouter dans `.env` :
  ```
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
  STRIPE_PRICE_ID_PREMIUM=price_...
  STRIPE_PRICE_ID_ENTERPRISE=price_...
  ```

### Code à créer

- [ ] `packages/api/src/stripe.ts` — client Stripe singleton
- [ ] `apps/web/app/api/webhooks/stripe/route.ts` — gestionnaire webhook Stripe
  - Événements à gérer :
    - `checkout.session.completed` → activer abonnement
    - `customer.subscription.updated` → mettre à jour plan
    - `customer.subscription.deleted` → rétrograder à FREE
    - `invoice.payment_failed` → notifier l'utilisateur
- [ ] `apps/web/app/api/checkout/route.ts` — créer une Checkout Session Stripe
- [ ] `apps/web/app/dashboard/abonnement/page.tsx` — page gestion abonnement
  - Afficher plan actuel
  - Bouton upgrade (→ Stripe Checkout)
  - Bouton annuler (→ Stripe Customer Portal)
- [ ] Lier `stripeCustomerId` au `userId` Clerk dans la BD
- [ ] Après paiement réussi → `clerkClient.users.updateUserMetadata(userId, { publicMetadata: { plan: "PREMIUM" } })`
  - Ceci met à jour les session claims → `getSessionPlan()` reflète le nouveau plan

### Intégration Clerk ↔ Stripe

```
User s'inscrit (Clerk)
    ↓ webhook Clerk user.created
    ↓ Créer user en BD (clerkId, email)
    ↓ Créer Stripe Customer (email)
    ↓ Sauvegarder stripeCustomerId en BD + Clerk publicMetadata

User upgrade vers Premium
    ↓ Stripe Checkout (price_id PREMIUM)
    ↓ webhook Stripe checkout.session.completed
    ↓ Créer/MAJ Subscription en BD
    ↓ MAJ user.plan = PREMIUM en BD
    ↓ MAJ Clerk publicMetadata { plan: "PREMIUM" }
    ↓ getSessionPlan() retourne "PREMIUM" dès la prochaine requête
```

---

## Notes techniques

- **Clerk session claims** — les `publicMetadata` sont inclus dans le JWT Clerk. Après une mise à jour via l'API Clerk, l'utilisateur doit rafraîchir sa session (ou attendre le prochain refresh du token, ~1 min).
- **CUSMA / ALENA** — les franchises douanières : 0 $ pour la plupart des marchandises numériques, 20 $ CAD franchise personnelle (courrier), 800 $ USD dédouanement simplifié.
- **Taxes provinciales** — GST 5 % + TVQ 9,975 % (QC), HST 15 % (NB/NS/NL/PEI), etc. Table JSON à maintenir.
- **Rate limiting** — utiliser Upstash Redis (`@upstash/ratelimit`) pour les endpoints API.
