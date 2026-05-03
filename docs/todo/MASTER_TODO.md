# MASTER TODO — TruePriceAI

> Feuille de route complète. Mise à jour au fil des sessions.
> Légende : ✅ fait · 🔄 en cours · ⏳ prochain · 🔒 bloqué par dépendance

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

## PHASE 1 — Auth & Abonnements 🔄

### 1A — Clerk Auth 🔄

- ✅ Installer `@clerk/nextjs` v7
- ✅ `middleware.ts` — protège toutes les routes non-publiques
- ✅ Pages `/sign-in` et `/sign-up` avec apparence TruePriceAI
- ✅ `ClerkProvider` configuré (afterSignOutUrl, signInUrl, signUpUrl)
- ✅ `lib/auth.ts` — helpers `requireAuth()`, `requirePlan()`, `getSessionPlan()`
- ✅ `types/clerk.d.ts` — augmentation `CustomJwtSessionClaims` (plan, role)
- ✅ Dashboard placeholder (layout protégé + page accueil)
- ⏳ Sync webhook Clerk → BD (`user.created` → `prisma.user.create`)
  - Créer `apps/web/app/api/webhooks/clerk/route.ts`
  - Créer Stripe Customer à ce moment
  - Sauvegarder `clerkId`, `email` en BD
- ⏳ Webhook `user.updated` → sync email/avatar en BD
- ⏳ Webhook `user.deleted` → soft delete + `gdprDeleteRequestedAt`
- ⏳ Flow d'onboarding post-inscription (étapes, préférences, langue)
- ⏳ Tester le flow complet sign-up → onboarding → dashboard → sign-out

### 1B — Base de données (Prisma + Neon) ⏳

- ✅ Schéma Prisma complet écrit — 40+ modèles (voir section SCHÉMA BD ci-dessous)
- ⏳ `npm run db:generate` — génère le Prisma Client
- ⏳ `npm run db:push` — applique le schéma sur Neon (première création)
- ⏳ `packages/db/src/index.ts` — exporter tous les types et le client Prisma
- ⏳ Brancher `@trueprice-ai/db` dans `apps/web` (`import { prisma } from "@trueprice-ai/db"`)
- ⏳ Créer `packages/db/src/queries/users.ts` — helpers DB users
- ⏳ Créer `packages/db/src/queries/organizations.ts` — helpers organisations

### 1C — Stripe (Particuliers) ⏳

- [ ] Créer compte Stripe + 3 produits : FREE (logique BD), PREMIUM 14,99 $ CAD/mois, ENTERPRISE 49,99 $ CAD/mois
- [ ] Ajouter clés Stripe dans `.env` (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, price IDs)
- [ ] `packages/api/src/stripe.ts` — client Stripe singleton
- [ ] `apps/web/app/api/webhooks/stripe/route.ts` — gestionnaire webhook Stripe
  - `checkout.session.completed` → activer abonnement
  - `customer.subscription.updated` → MAJ plan
  - `customer.subscription.deleted` → rétrograder FREE
  - `invoice.payment_failed` → notifier user
- [ ] `apps/web/app/api/checkout/route.ts` — créer Checkout Session Stripe
- [ ] `apps/web/app/dashboard/abonnement/page.tsx` — gestion abonnement
  - Plan actuel + date expiry
  - Bouton upgrade → Stripe Checkout
  - Bouton annuler → Stripe Customer Portal
- [ ] Après paiement → `clerkClient.users.updateUserMetadata({ plan: "PREMIUM" })`
- [ ] Lier `stripeCustomerId` au `userId` Clerk en BD

### 1D — Organisation & Multi-tenant (ENTERPRISE) ⏳

- [ ] Création d'une organisation (nom, logo, slug, fuseau horaire, devise)
- [ ] Rôles : ADMIN / MANAGER / MEMBER
- [ ] Gestion des succursales (`Branch`) — pays, province, timezone, devise
- [ ] Invitations par email avec token → rôle + succursale pré-assignés
- [ ] Switcher d'organisation dans la navbar (user peut appartenir à plusieurs orgs)
- [ ] Limite de sièges (`maxSeats`) — bloquer au-delà sans upgrade
- [ ] `OrgSubscription` — abonnement Stripe par organisation (prix par siège supplémentaire)
- [ ] Dashboard admin organisation :
  - Liste membres + rôle + succursale
  - Historique accès (si `canViewTeamHistory = true`)
  - Soft delete membre (`removedAt` / `removedBy`)
- [ ] Permissions granulaires par rôle (canViewTeamHistory, etc.)
- [ ] Page `/dashboard/organisation/settings`

### 1E — Sécurité & Sessions ⏳

- [ ] Tracking sessions actives (`UserSession`) — deviceType, IP, userAgent
- [ ] Appareils de confiance (`UserDevice`) — enregistrer après 2FA
- [ ] Limites de sessions : 2 web simultanées, 1 mobile, 1 desktop
- [ ] Page `/dashboard/securite` — liste sessions actives + révoquer
- [ ] Interface appareils de confiance (liste, supprimer)
- [ ] Enforce 2FA au niveau organisation (`enforce2FA`)
- [ ] SSO organisationnel (`ssoProvider` : okta, azure_ad, google_workspace) — ENTERPRISE_PRO
- [ ] Whitelist IP organisationnelle (`ipWhitelist`) — ENTERPRISE_PRO

### 1F — Conformité RGPD / PIPEDA / Loi 25 ⏳

- [ ] Banner cookies + `ConsentLog` (FUNCTIONAL / ANALYTICS / MARKETING)
- [ ] Page `/confidentialite` + `/cookies` avec versionnage
- [ ] Bouton "Exporter mes données" → `gdprDataExportedAt`
- [ ] Bouton "Supprimer mon compte" → `gdprDeleteRequestedAt` + job de suppression 30 j
- [ ] Préférences de notification multi-canal (`NotificationPreference`)
  - Canaux : IN_APP, EMAIL, SMS, PUSH_MOBILE, PUSH_DESKTOP
  - Types : price_alert, stock_alert, report_weekly, report_monthly, changelog

---

## PHASE 2 — Géolocalisation & Logique marché ⏳

> Crucial : l'app est internationale. Un acheteur au Canada ne peut pas acheter sur Amazon.com
> (pas de livraison directe, droits de douane, etc.). La logique de comparaison doit être
> adaptée au pays d'origine du user.

### 2A — Détection de la localisation ⏳

- [ ] IP geolocation au chargement — détecter pays + région (ipapi.co, MaxMind GeoLite2)
  - Stocker en cookie de session + Clerk publicMetadata si connecté
- [ ] Préférence manuelle — le user peut forcer son pays dans les settings
- [ ] Langue/devise — dériver la devise par défaut du pays (CAD, USD, EUR, GBP…)
- [ ] `lib/geo.ts` — helper `getUserMarket()` retourne `{ country, currency, locale, taxRegion }`
- [ ] Adresses livraison sauvegardées (`UserAddress`) — domicile, bureau, entrepôt
- [ ] Calculer taxes selon province/état de livraison (pas juste le pays)

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

- [ ] `lib/markets.ts` — table pays → marketplaces disponibles
- [ ] `lib/duties.ts` — règles douanières par paire (taux, franchises, exemptions)
- [ ] `TaxRate` BD — table GST/TVQ/HST/TVA par pays+province, source gouvernementale
- [ ] `DutyRate` BD — codes HS, taux, accords (CUSMA, UE, standard)
- [ ] `ExchangeRate` BD — cache taux de change (TTL 1h, source : frankfurter/openexchangerates)
- [ ] Adapter résultats au marché détecté (ne jamais proposer livraison impossible)
- [ ] Sites bloqués/préférés par organisation (`OrgBlockedSite`, `OrgPreferredSite`)
- [ ] Sites bloqués/préférés par user (`UserBlockedSite`, `UserPreferredSite`)

### 2C — Moteur de comparaison de prix ⏳

- [ ] Interface de recherche (barre de recherche + résultats)
- [ ] Endpoint API `/api/search` (protégé, limité par plan)
- [ ] `lib/calculator.ts` — pipeline de calcul vrai coût
  - Taux de change en temps réel (cache BD `ExchangeRate`, TTL 1h)
  - Taxes locales selon pays + région
  - Droits de douane (`DutyRate` ou `CustomDutyRate` organisation)
  - Frais de livraison estimés (poids, distance, transporteur)
  - Frais de courtage en douane
- [ ] Affichage résultat — segment bar (cyan base, bleu livraison, vert taxes, ambre douanes)
- [ ] Vérifier `PLAN_LIMITS` avant chaque recherche
- [ ] Sauvegarder `PriceSearch` + `ProductOffer[]` en BD
- [ ] Compteur mensuel `searchCountMonth` + reset le 1er du mois
- [ ] Déduplication — si même query + même user < 6h, réutiliser le résultat (`deduplicatedFromId`)
- [ ] Mode sandbox pour tests (flag `isSandbox`)
- [ ] Modes de livraison : standard, pickup, Instacart, DoorDash (selon marketplace)

### 2D — Rabais & Promotions ⏳ ★ CRUCIAL

> Schéma BD : `ProductOffer` → `Discount[]` (défini dans `schema.prisma`).

**Rabais à détecter et stocker par offre :**

- [ ] AUTOMATIC — appliqués sans action (prix déjà réduit)
- [ ] COUPON — code promo à saisir, coupon Amazon à clipper (`code`, `isAutoApplied: false`)
- [ ] CONDITIONAL — "Achetez-en 2, économisez 10 %", avec échange (`condition`, `minQty`)
- [ ] MEMBERSHIP — Amazon Prime, Costco Gold Star, Best Buy Totaltech
- [ ] SALE — Flash sale, Black Friday, liquidation (`expiresAt`, `startsAt`)
- [ ] BUNDLE — Achat groupé avec accessoires
- [ ] CASHBACK — Rakuten, carte de crédit (remboursement différé)

**Affichage UI (Phase 2D) :**

- [ ] Badge "RABAIS" cyan si au moins un discount actif
- [ ] Liste déroulante rabais avec icône par type
- [ ] Compte à rebours si `expiresAt` < 72h (amber/warning)
- [ ] Prix barré `priceOriginal` si différent de `priceCurrent`
- [ ] Prix "après meilleur rabais" calculé (`priceAfterBestDiscount`)
- [ ] Note claire si rabais nécessite une action
- [ ] `lib/discounts.ts` — `applyDiscounts(offer, userContext)` → prix final

**Logique calcul avec rabais :**

```
priceFinal = priceCurrent
           - sum(discounts où isAutoApplied = true)
           - meilleur(discounts cumulables où condition remplie)

truePriceTotal = (priceFinal × exchangeRate)
              + shippingCost + dutyAmount + taxAmount + brokerageFee
```

### 2E — Favoris & Listes produits ⏳

- [ ] `Favorite` — marquer un produit favori avec tags et notes
- [ ] `ProductList` — listes nommées (STANDARD / RECURRING / PROJECT)
  - Récurrentes : épicerie hebdo, commandes mensuelles (`recurrenceDays`, `nextRunAt`)
  - Projet : montage PC, rénovation, etc.
- [ ] Interface listes dans le dashboard
- [ ] Partage de liste avec l'équipe (`isShared`)
- [ ] Auto-notification à `nextRunAt` si `autoNotify = true`

### 2F — Alertes prix & stock ⏳

- [ ] `PriceAlert` — alerte quand prix < cible sur marketplace(s) choisie(s)
- [ ] `StockAlert` — alerte quand produit revient en stock
- [ ] Canaux de notification : email, in-app, SMS, push (selon `NotificationPreference`)
- [ ] Dashboard alertes actives + historique déclenchements
- [ ] Job de vérification périodique (cron, toutes les heures)

### 2G — Partage & Collaboration ⏳

- [ ] `SharedResult` — partager un résultat de recherche avec un collègue
  - Partage interne (membre équipe)
  - Partage externe par lien avec token + expiry (`shareToken`, `expiresAt`)
- [ ] Page publique `/share/:token` — résultat partagé (lecture seule)
- [ ] Signalement de prix erronés (`PriceReport`) — feedback communauté

### 2H — Rapports & Analytiques ⏳ (ENTERPRISE)

- [ ] `Report` — rapports hebdomadaires / mensuels / personnalisés
  - Type "savings" : économies réalisées vs prix local
  - Envoi par email planifié
- [ ] Dashboard analytique organisation :
  - Volume de recherches par membre / période
  - Économies cumulées
  - Marketplaces les plus utilisées
  - Top produits recherchés
- [ ] Export CSV / PDF depuis rapport (PREMIUM+)
- [ ] `AuditLog` — toutes les actions admin org (member.added, settings.changed, export.done)

---

## PHASE 3 — Scraping / Sources de prix ⏳

> La recherche de prix est le cœur du produit.

### 3A — Méthodes d'acquisition des prix

| Méthode | Coût | Fiabilité | Recommandation |
|---|---|---|---|
| Amazon Product Advertising API | Gratuit (affilié) | ⭐⭐⭐⭐⭐ | ✅ Priorité 1 Amazon |
| Rainforest API (proxy Amazon) | ~50 $/mois | ⭐⭐⭐⭐⭐ | ✅ Si pas affilié |
| PriceAPI.com | ~30 $/mois | ⭐⭐⭐⭐ | ✅ Multi-source |
| Scraping Playwright | Infra seulement | ⭐⭐⭐ | ⚠️ Risque blocage |
| Google Shopping API | Variable | ⭐⭐⭐⭐ | ✅ Enrichissement |

### 3B — Sources par marché

**Canada :**
- [ ] Amazon.ca — API affilié ou Rainforest API
- [ ] Best Buy Canada — JSON API publique
- [ ] Costco.ca — scraping (pas d'API)
- [ ] Apple Store Canada — API JSON structurée
- [ ] Walmart.ca — API partenaire ou scraping

**USA :**
- [ ] Amazon.com — Amazon PA API (même compte affilié, marketplace US)
- [ ] Best Buy US — API publique (clé gratuite)
- [ ] Apple Store US — API JSON (même structure que CA)
- [ ] Walmart.com — API Walmart Open (gratuite, clé requise)

**Europe / autres :**
- [ ] Amazon.fr / .de / .co.uk — Amazon PA API (marketplace EU)
- [ ] Étendre selon demande utilisateurs

### 3C — Infrastructure scraping (`apps/worker`)

- [ ] `apps/worker` — service Node.js avec Playwright
- [ ] Cache Redis (Upstash) — TTL 6h par URL produit, TTL 1h taux de change
- [ ] Queue de jobs (BullMQ ou Cloudflare Queues)
- [ ] Fallback : si scraping échoue → retourner cache + flag `stale: true`
- [ ] Monitoring parsers (alerte si taux d'échec > 10 %)
- [ ] `Marketplace.status` — OPERATIONAL / DEGRADED / DOWN + `MarketplaceStatusLog`
- [ ] Page de statut publique `/status`

### 3D — Inputs de recherche supportés

- [ ] Nom de produit / mots-clés (recherche fuzzy)
- [ ] Code UPC / EAN / barcode
- [ ] URL produit (Amazon, Best Buy, Apple…) → extraire ASIN ou product ID
- [ ] Modèle exact (ex : "iPhone 16 Pro 256GB Natural Titanium")
- [ ] ASIN Amazon (recherche directe)
- [ ] SKU fournisseur (Enterprise — cross-ref avec catalogue fournisseur)

### 3E — Gestion fournisseurs (ENTERPRISE) ⏳

> Permet aux entreprises de comparer leurs prix d'achat fournisseur vs les prix du marché.

- [ ] `OrganizationSupplier` — profil fournisseur par organisation
  - Conditions commerciales : escompte global, paiement à X jours, commande minimale
  - Tarifs de livraison : fixe, barème, seuil franco
  - Taux de douane personnalisés (`CustomDutyRate`)
- [ ] `SupplierCategoryDiscount` — escomptes par catégorie de produit
- [ ] `SupplierVolumeDiscount` — dégressivité selon quantité
- [ ] Interface gestion fournisseurs dans dashboard org
- [ ] `ProductOffer.supplierId` — intégrer offres fournisseurs dans les résultats

### 3F — Import fichiers fournisseurs ⏳

- [ ] `SupplierFileImport` — INVOICE / CATALOG / PURCHASE_ORDER / PRICE_LIST / PRODUCT_LIST
- [ ] Upload sécurisé (S3/R2) — URL stockée, jamais le fichier en BD
- [ ] Parser IA — GPT-4o extrait les données structurées du PDF/Excel/CSV
  - `parsedBy: "ai"` avec log d'erreur si échec
- [ ] Interface d'upload dans dashboard fournisseur
- [ ] Statuts : pending → processing → done / error
- [ ] Intégration niveau 4 : API/EDI, Scraping portail, File import, Manuel
  - `integrationLevel`, `integrationConfig` (config chiffrée)
  - `lastSyncAt` + `priceListDate`

---

## PHASE 4 — Export & API publique ⏳

- [ ] Export CSV / PDF (PREMIUM+) — résultat de recherche, rapport économies
- [ ] API REST publique (`/api/v1/price`) — clé API, rate limiting (Upstash)
- [ ] Clés API avec prefix `tp_live_*` / `tp_test_*` — hash SHA-256 en BD, jamais en clair
- [ ] Mode sandbox (`isSandbox`) — clés de test pour intégrations
- [ ] Dashboard API Keys (`ApiKey`) — créer, nommer, révoquer, voir `lastUsedAt`
- [ ] Versionnage API (`apiVersion: "v1"`)
- [ ] Documentation API (swagger / readme)
- [ ] Rate limiting par plan (Upstash Redis `@upstash/ratelimit`)

---

## PHASE 5 — IA ⏳

### 5A — Fonctionnalités IA

- [ ] `AiConversation` + `AiMessage` — conversations contextuelles sur un résultat
- [ ] Résumé intelligent du meilleur achat (`aiSummary` sur `PriceSearch`)
- [ ] Suggestion de produits alternatifs moins chers
- [ ] Catégorisation automatique des produits (`aiCategoryConfidence`)
- [ ] Parser IA pour imports fichiers fournisseurs (Phase 3F)

### 5B — Gestion des tokens IA ⏳

- [ ] Compteur tokens par user (`aiTokensUsed`, `aiTokensLimit`, `aiTokensResetAt`)
- [ ] Compteur tokens par organisation (`aiTokensUsed`, `aiTokensLimit`)
- [ ] Achat de tokens supplémentaires (`AiTokenPurchase`, `OrgAiTokenPurchase`) via Stripe
- [ ] BYOK (Bring Your Own Key) — ENTERPRISE_PRO — `byokApiKey` chiffré
  - User apporte sa propre clé OpenAI → pas de décompte tokens TruePriceAI
- [ ] Dashboard usage IA (tokens utilisés / limit, historique conversations)

### 5C — Alertes prix intelligentes ⏳

- [ ] Alerte email quand prix baisse (PriceAlert déclenche notification)
- [ ] Résumé hebdomadaire des meilleures offres (basé sur favoris + listes)
- [ ] Prédiction tendance de prix (IA sur `PriceHistory`)

---

## PHASE 6 — Support, Changelog & Statut ⏳

- [ ] `SupportTicket` — formulaire de support intégré dans le dashboard
  - Statuts : open → in_progress → resolved → closed
  - Priorités : low / normal / high / urgent
  - Lié au user et/ou organisation
- [ ] `Changelog` — notes de mise à jour intégrées dans l'app
  - Audience : ALL / PREMIUM_PLUS / ENTERPRISE_ONLY
  - `ChangelogRead` — tracking "vu" par user (badge "Nouveau")
- [ ] Page `/status` publique (statut des marketplaces, incidents)
  - `MarketplaceStatusLog` — historique incidents
- [ ] Notifications in-app changelog non lus

---

## PHASE 7 — White-label & SSO (ENTERPRISE_PRO) ⏳

- [ ] `whitelabelConfig` — logo, couleurs, domaine personnalisé
- [ ] `customDomain` — sous-domaine client (ex: `prix.acme.com`)
- [ ] `brandingConfig` — thème complet
- [ ] SSO : Okta, Azure AD, Google Workspace (`ssoProvider`, `ssoConfig`)
- [ ] IP Whitelist organisationnelle
- [ ] Contrat SLA dédié + support prioritaire

---

---

## SCHÉMA BD — État actuel ✅ ÉCRIT

> Fichier : `packages/db/prisma/schema.prisma`
> Schéma complet écrit en session mai 2026. **Prochaine étape : `db:push` sur Neon.**

### Enums définis

| Enum | Valeurs |
|---|---|
| `Plan` | FREE · PREMIUM · ENTERPRISE · ENTERPRISE_PRO |
| `Role` | USER · ADMIN |
| `OrgRole` | ADMIN · MANAGER · MEMBER |
| `SubscriptionStatus` | TRIALING · ACTIVE · PAST_DUE · CANCELED · UNPAID · INCOMPLETE |
| `DiscountType` | AUTOMATIC · COUPON · CONDITIONAL · MEMBERSHIP · SALE · BUNDLE · CASHBACK |
| `NotificationChannel` | IN_APP · EMAIL · SMS · PUSH_MOBILE · PUSH_DESKTOP |
| `IntegrationType` | 10 POS + 6 ERP + 4 BI + WEBHOOK + CUSTOM (20+ valeurs) |
| `DeviceType` | WEB · MOBILE · DESKTOP |
| `SiteStatus` | OPERATIONAL · DEGRADED · DOWN |
| `InputType` | KEYWORD · URL · UPC · ASIN · MODEL · SKU |
| `ListType` | STANDARD · RECURRING · PROJECT |
| `SupplierIntegrationLevel` | API · SCRAPING · FILE · MANUAL |
| `FileImportType` | INVOICE · CATALOG · PURCHASE_ORDER · PRICE_LIST · PRODUCT_LIST |
| `ConsentType` | FUNCTIONAL · ANALYTICS · MARKETING |
| `ChangelogAudience` | ALL · PREMIUM_PLUS · ENTERPRISE_ONLY |

### Modèles définis (40+)

**Utilisateur & Auth**
- `User` — profil complet, plan, tokens IA, compteurs, RGPD, onboarding
- `UserAddress` — adresses livraison (domicile, bureau, entrepôt)
- `UserSession` — sessions actives par appareil (IP, userAgent, trusted)
- `UserDevice` — appareils de confiance enregistrés
- `NotificationPreference` — préférences canal/type par user
- `ConsentLog` — consentements cookies/analytics/marketing versionnés

**Abonnements & Facturation**
- `Subscription` — abonnement Stripe individuel
- `AiTokenPurchase` — achats de tokens IA à la carte (individuel)

**Organisation**
- `Organization` — profil org, plan, SSO, 2FA, white-label, tokens IA
- `Branch` — succursales (pays, province, timezone, devise)
- `OrganizationMembership` — user ↔ org ↔ branche, rôle, soft delete
- `OrganizationInvitation` — invitations par email avec token
- `OrgSubscription` — abonnement Stripe org (sièges inclus + prix supplémentaire)
- `OrgAiTokenPurchase` — achats tokens IA org

**Fournisseurs**
- `OrganizationSupplier` — fournisseur avec conditions commerciales + config intégration
- `SupplierCategoryDiscount` — escomptes par catégorie
- `SupplierVolumeDiscount` — dégressivité quantité
- `SupplierFileImport` — imports factures/catalogues/listes (IA parser)

**Sites & Marketplaces**
- `Marketplace` — Amazon.ca, BestBuy.ca, Apple Store, etc. + config scraping + statut
- `MarketplaceStatusLog` — historique incidents marketplace
- `OrgPreferredSite` / `OrgBlockedSite` — préférences par organisation
- `UserPreferredSite` / `UserBlockedSite` — préférences par user

**Produits**
- `Product` — catalogue enrichi (UPC, EAN, ISBN, specs JSON, catégorie IA)
- `ProductVariant` — ASIN, SKU, attributs de variation (couleur, taille, etc.)

**Recherche & Comparaison**
- `PriceSearch` — requête de recherche avec contexte géo, tags, résumé IA
- `ProductOffer` — offre par marketplace/fournisseur, vrai coût calculé, stock/livraison
- `Discount` — rabais par offre (7 types, condition, code, expiry, stackable)
- `PriceHistory` — historique prix par produit/variant/marketplace

**Fonctionnalités User**
- `ProductList` — listes standard/récurrentes/projets avec auto-notify
- `ProductListItem` — items de liste (produit ou requête libre)
- `Favorite` — favoris avec tags et notes
- `PriceAlert` — alerte prix cible par marketplace(s)
- `StockAlert` — alerte retour en stock

**Collaboration & Partage**
- `SharedResult` — partage interne équipe + lien externe avec expiry
- `PriceReport` — signalement de prix erronés

**IA & Conversations**
- `AiConversation` — conversation IA sur un résultat de recherche
- `AiMessage` — messages de la conversation (user/assistant), modèle, tokens

**Taxes & Douanes**
- `TaxRate` — taux officiels par pays/province (GST, TVQ, HST, TVA…)
- `DutyRate` — taux douaniers par paire pays + code HS + accord
- `CustomDutyRate` — taux douaniers personnalisés par org/fournisseur
- `ExchangeRate` — cache taux de change (TTL 1h)

**Intégrations & API**
- `Integration` — POS / ERP / BI par organisation
- `Webhook` — inbound/outbound avec events, secret HMAC
- `ApiKey` — clés API hash SHA-256, prefix, sandbox, expiry

**Rapports & Audit**
- `Report` — rapports hebdo/mensuels/personnalisés avec envoi email
- `UsageLog` — log toutes les actions (search, export, api_call…)
- `AuditLog` — audit trail admin organisation

**Support & Communication**
- `SupportTicket` — tickets support avec priorité + statut
- `Changelog` — notes de mise à jour par audience
- `ChangelogRead` — tracking lu/non lu par user

### Checklist migration

- ✅ Schéma écrit — `packages/db/prisma/schema.prisma`
- ⏳ `npm run db:generate` — génère le Prisma Client
- ⏳ `npm run db:push` — crée les tables sur Neon (première fois, dev)
- ⏳ `packages/db/src/index.ts` — exporter `prisma`, types, helpers
- ⏳ Importer `@trueprice-ai/db` dans `apps/web`
- ⏳ Webhook Clerk `user.created` → `prisma.user.create`
- ⏳ `npm run db:migrate` — migration versionnée (avant production)

---

## STRIPE — Intégration complète ⏳

### Flux Clerk ↔ Stripe ↔ BD

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

- **Clerk session claims** — `publicMetadata` inclus dans le JWT. Refresh ~1 min après MAJ via API Clerk.
- **CUSMA / ALENA** — franchise : 0 $ biens numériques, 20 $ CAD courrier personnel, 800 $ USD dédouanement simplifié.
- **Taxes provinciales** — GST 5 % + TVQ 9,975 % (QC), HST 15 % (NB/NS/NL/PEI), etc. Table `TaxRate` en BD.
- **Rate limiting** — Upstash Redis (`@upstash/ratelimit`) pour endpoints API.
- **Chiffrement** — `integrationConfig`, `byokApiKey`, `ssoConfig`, `webhook.secret` → chiffrés at rest (AES-256 ou vault externe).
- **Soft deletes** — `OrganizationMembership.removedAt` + `User.gdprDeleteRequestedAt` uniquement. Pas de soft delete généralisé.
- **Limites sessions** — 2 sessions web simultanées, 1 mobile, 1 desktop. Révocation possible depuis `/dashboard/securite`.
- **History retention** — Organisation : `historyRetentionDays` (défaut 730 j = 2 ans). Searches individuelles : selon plan.
