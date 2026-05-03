# MASTER TODO — TruePriceAI

> Feuille de route exhaustive issue de l'audit complet (90 Q&A mai 2026).
> Légende : ✅ fait · 🔄 en cours · ⏳ prochain · 🔒 bloqué par dépendance · ★ critique

---

## PLAN_LIMITS — Référence par plan

> Source de vérité pour toutes les vérifications d'accès dans le code.

| Limite | FREE | PREMIUM | ENTERPRISE | ENTERPRISE_PRO |
|---|---|---|---|---|
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

## PHASE 1 — Auth, Profil & Abonnements 🔄

### 1A — Clerk Auth 🔄

- ✅ Installer `@clerk/nextjs` v7
- ✅ `middleware.ts` — protège toutes les routes non-publiques
- ✅ Pages `/sign-in` et `/sign-up` avec apparence TruePriceAI
- ✅ `ClerkProvider` configuré (afterSignOutUrl, signInUrl, signUpUrl)
- ✅ `lib/auth.ts` — helpers `requireAuth()`, `requirePlan()`, `getSessionPlan()`
- ✅ `types/clerk.d.ts` — augmentation `CustomJwtSessionClaims` (plan, role)
- ✅ Dashboard placeholder (layout protégé + page accueil)
- ⏳ Webhook Clerk → BD (`apps/web/app/api/webhooks/clerk/route.ts`)
  - `user.created` → `prisma.user.create({ clerkId, email, name, avatarUrl })`
  - `user.created` → créer Stripe Customer + sauvegarder `stripeCustomerId`
  - `user.created` → démarrer période d'essai PREMIUM 14 jours (`isTrialing: true`, `trialEndsAt`)
  - `user.updated` → sync `email`, `name`, `avatarUrl` en BD
  - `user.deleted` → `gdprDeleteRequestedAt = now()` (job suppression J+30)
- ⏳ Tester flow complet sign-up → onboarding → dashboard → sign-out

### 1B — Onboarding post-inscription ⏳

> Collecte les préférences dès l'inscription pour personnaliser l'expérience.

- [ ] Page `/onboarding` — route protégée, redirigée depuis `/dashboard` si `onboardingCompletedAt = null`
- [ ] Étape 1 — Pays et devise (`userCountry`, `preferredCurrency`, `preferredLocale`)
  - Sélecteur pays avec drapeau
  - Devise auto-sélectionnée selon pays (Canada → CAD, USA → USD…)
- [ ] Étape 2 — Profil d'usage (particulier ou entreprise ?)
  - Particulier → dashboard solo
  - Entreprise → proposer création d'organisation (Phase 1F)
- [ ] Étape 3 — Adresse de livraison principale (`UserAddress` label "Domicile")
  - Champs : rue, ville, province/état, code postal, pays
  - Optionnel mais recommandé (calcul taxes précis)
- [ ] Étape 4 — Préférences de notification (email, in-app)
  - `NotificationPreference` : price_alert, stock_alert, report_weekly, changelog
- [ ] Étape 5 — Consentements (`ConsentLog` ANALYTICS + MARKETING)
  - Recueillir avec version de la politique
- [ ] `onboardingStep` incrémenté à chaque étape — permet reprise si abandon
- [ ] `onboardingCompletedAt = now()` à la fin
- [ ] Redirection vers `/dashboard` une fois terminé

### 1C — Base de données — Couche applicative ⏳

- ✅ Schéma Prisma 40+ modèles écrit et validé
- ✅ `db:generate` — Prisma Client généré
- ✅ `db:push` — 40+ tables créées sur Neon
- ⏳ `packages/db/src/index.ts` — exports centralisés
  - `export { prisma }` (singleton avec `globalThis` pour hot-reload Next.js)
  - `export type { User, Organization, PriceSearch, ProductOffer, Discount, Plan, OrgRole }` (et tous les types utiles)
- ⏳ `packages/db/src/queries/users.ts`
  - `createUser(clerkId, email, name?)` — à l'inscription
  - `getUserByClerkId(clerkId)` — lookup standard
  - `updateUserPlan(userId, plan, expiresAt?)` — après paiement Stripe
  - `incrementSearchCount(userId)` — après chaque recherche
  - `resetSearchCountIfNeeded(userId)` — vérifie si `searchResetAt` < 1er du mois
  - `consumeAiTokens(userId, amount)` — après chaque requête IA
- ⏳ `packages/db/src/queries/organizations.ts`
  - `createOrganization(data)` — avec slug auto-généré
  - `getOrgWithMembers(orgId)` — members + branches + rôles
  - `addMember(orgId, userId, role, branchId?)` — invitation acceptée
  - `removeMember(orgId, userId, removedBy)` — soft delete
  - `isOrgAdmin(orgId, userId)` — garde d'accès
- ⏳ `packages/db/src/queries/searches.ts`
  - `createSearch(data)` — avec quota check intégré
  - `getSearchById(id)` — avec offers + discounts
  - `getUserSearchHistory(userId, limit, cursor)` — paginated
  - `deduplicateSearch(userId, query, withinHours)` — retourne existant si < 6h
  - `cleanExpiredSearches()` — job nettoyage selon `expiresAt`
- ⏳ Brancher `@trueprice-ai/db` dans `apps/web` (`package.json` workspace dep)

### 1D — Stripe — Abonnements Particuliers ⏳

- [ ] Créer produits Stripe :
  - FREE — géré en BD (pas de produit Stripe)
  - PREMIUM — 14,99 $ CAD/mois + 149,90 $ CAD/an
  - ENTERPRISE — 49,99 $ CAD/mois + 479,90 $ CAD/an (ou devis)
  - ENTERPRISE_PRO — devis seulement (pas de checkout en ligne)
- [ ] Variables `.env` : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, price IDs mensuel/annuel
- [ ] `packages/api/src/stripe.ts` — client singleton Stripe
- [ ] `apps/web/app/api/webhooks/stripe/route.ts` — webhook Stripe
  - Vérifier signature HMAC (`stripe.webhooks.constructEvent`)
  - `checkout.session.completed` → créer `Subscription` BD + MAJ `user.plan`
  - `customer.subscription.updated` → MAJ plan + période
  - `customer.subscription.deleted` → rétrograder FREE + annuler essai
  - `invoice.payment_failed` → notifier user (email + in-app)
  - `customer.subscription.trial_will_end` → email 3 jours avant fin essai
- [ ] `apps/web/app/api/checkout/route.ts` — créer Checkout Session
  - Passer `client_reference_id: userId` pour linkage
  - Supporter mensuel et annuel
- [ ] `apps/web/app/api/billing/portal/route.ts` — Stripe Customer Portal (annulation, factures)
- [ ] `apps/web/app/dashboard/abonnement/page.tsx`
  - Plan actuel + badge + date renouvellement / fin essai
  - Barre de progression usage (recherches utilisées / limite)
  - Bouton "Passer à PREMIUM" → Checkout
  - Bouton "Gérer mon abonnement" → Customer Portal
  - Historique factures (via Stripe API)
- [ ] Après paiement → `clerkClient.users.updateUserMetadata({ plan: "PREMIUM" })`
- [ ] Gestion des essais : à `trialEndsAt`, si pas converti → rétrograder FREE automatiquement
- [ ] Adsense désactivé (`adsEnabled = false`) dès plan payant

### 1E — Stripe — Abonnements Organisations ⏳ 🔒 (dépend 1D + 1F)

- [ ] Produit Stripe org : ENTERPRISE — base 49,99 $ CAD/mois · siège suppl. 9,99 $/mois
- [ ] Checkout org avec quantité dynamique (nombre de sièges)
- [ ] `apps/web/app/api/checkout/org/route.ts` — checkout org
- [ ] Webhook → créer `OrgSubscription` BD
- [ ] Dashboard facturation org : sièges utilisés / achetés, factures, ajout sièges

### 1F — Organisation & Multi-tenant ⏳ 🔒 (dépend 1C)

- [ ] `apps/web/app/dashboard/organisation/` — espace org
- [ ] Page création organisation (nom, slug, logo, pays, timezone, devise de référence)
  - Slug auto-généré depuis le nom, modifiable
  - Logo upload → stockage R2/S3
- [ ] Switcher d'organisation dans la navbar
  - Affiche les orgs auxquelles l'user appartient
  - Org courante en cookie de session + `organizationId` dans le contexte
  - "Créer une organisation" si aucune
- [ ] Page membres (`/dashboard/organisation/membres`)
  - Table : avatar, nom, email, rôle, succursale, date adhésion
  - Boutons : modifier rôle, changer succursale, retirer (soft delete)
  - Historique accès des membres si `canViewTeamHistory = true`
- [ ] Page invitations (`/dashboard/organisation/invitations`)
  - Formulaire : email, rôle, succursale optionnelle
  - Générer token unique + envoyer email d'invitation
  - Liste invitations en attente (token, expiry, renvoyer, annuler)
  - Page publique `/invitations/:token` → accepter invitation → créer membership
- [ ] Page succursales (`/dashboard/organisation/succursales`)
  - CRUD succursales (nom, pays, province, ville, timezone, devise, quartier-général)
  - Associer membres à des succursales
- [ ] Permissions par rôle :
  - ADMIN : tout (membres, paramètres, facturation, intégrations, fournisseurs)
  - MANAGER : voir historique équipe, gérer préférences, ajouter fournisseurs
  - MEMBER : usage standard uniquement
- [ ] Vérification `maxSeats` avant chaque ajout de membre — bloquer + proposer upgrade
- [ ] Page paramètres org (`/dashboard/organisation/parametres`)
  - Infos générales, logo, devise de référence, timezone
  - `historyRetentionDays` — configurable par admin org
  - `allowResultSharing` / `allowExternalSharing`

### 1G — Sécurité & Sessions ⏳ 🔒 (dépend 1A)

- [ ] Enregistrer session à chaque connexion (`UserSession` : deviceType, IP, userAgent, expiresAt)
- [ ] Enregistrer/identifier appareils (`UserDevice` : deviceId fingerprint, deviceName)
- [ ] Vérifier limites sessions simultanées (2 web, 1 mobile, 1 desktop)
  - Révoquer la session la plus ancienne si limite dépassée
- [ ] Page `/dashboard/securite`
  - Liste sessions actives (appareil, IP, localisation approximative, "Cette session")
  - Bouton "Révoquer" par session
  - Bouton "Révoquer toutes les autres sessions"
- [ ] Appareils de confiance (`UserDevice.isTrusted`)
  - Appareil marqué de confiance après validation 2FA
  - Liste appareils de confiance + bouton supprimer
- [ ] Enforce 2FA au niveau org (`Organization.enforce2FA`)
  - Bloquer accès si org enforce 2FA et user sans 2FA actif
- [ ] SSO org — ENTERPRISE_PRO uniquement (Phase 7)

### 1H — Conformité RGPD / PIPEDA / Loi 25 ⏳ 🔒 (dépend 1B)

- [ ] Banner cookies au premier chargement
  - Boutons : Accepter tout / Personnaliser / Refuser optionnels
  - `ConsentLog` enregistré (type, granted, ipAddress, version)
  - Version = hash de la politique en vigueur
- [ ] Pages légales : `/confidentialite`, `/cgu`, `/cookies`
  - Chaque page versionnée (changement = nouveau `ConsentLog` requis)
- [ ] Page `/dashboard/profil/confidentialite`
  - Préférences consentement (modifier ANALYTICS, MARKETING)
  - Bouton "Exporter mes données" → archive JSON → `gdprDataExportedAt`
  - Bouton "Supprimer mon compte" → confirmation → `gdprDeleteRequestedAt = now()`
    - Afficher délai 30 jours, possibilité d'annuler
- [ ] Job suppression RGPD (`JOBS section`) — supprimer définitivement J+30 après demande
- [ ] Préférences notifications (`/dashboard/profil/notifications`)
  - Toggle par type (price_alert, stock_alert, report_weekly, report_monthly, changelog)
  - Toggle par canal (EMAIL, IN_APP, SMS si activé, PUSH si app mobile)
  - `NotificationPreference` créée/MAJ en BD

---

## PHASE 2 — Géolocalisation & Moteur de comparaison ⏳

### 2A — Détection et préférences de localisation ⏳

- [ ] IP geolocation au chargement (`middleware.ts` ou composant serveur)
  - Service : ipapi.co (gratuit jusqu'à 1 000/jour) ou MaxMind GeoLite2 (self-hosted)
  - Extraire : `country`, `region` (province/état), `currency`
  - Stocker en cookie de session signé
  - Sauvegarder dans `User.preferredLocale` / `preferredCurrency` si connecté
- [ ] Préférence manuelle dans `/dashboard/profil/localisation`
  - Pays, devise, timezone, langue (fr-CA / en-CA)
  - Priorité sur détection IP
- [ ] `lib/geo.ts` — `getUserMarket(req)` → `{ country, currency, locale, taxRegion, timezone }`
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
- [ ] Peuplement initial table `TaxRate` BD — script seed avec taux officiels
- [ ] Peuplement initial table `DutyRate` BD — CUSMA + UE + standard
- [ ] Sites bloqués/préférés par organisation
  - Interface `/dashboard/organisation/marketplaces`
  - Cocher/décocher marketplaces actives pour l'org
- [ ] Sites bloqués/préférés par user
  - `/dashboard/profil/marketplaces` — personnalisation

### 2C — Taux de change ⏳

- [ ] `lib/exchange.ts` — `getExchangeRate(from, to)` → Decimal
  - D'abord chercher dans `ExchangeRate` BD (si `validUntil` > now)
  - Sinon fetch API externe (Frankfurter, Open Exchange Rates, ou Fixer.io)
  - Sauvegarder en BD avec `validUntil = now + 1h`
  - Source prioritaire : Frankfurter (gratuit, pas de clé)
- [ ] Job cron refresh taux de change (toutes les heures) — voir section JOBS
- [ ] Peuplement initial : CAD/USD, CAD/EUR, CAD/GBP, USD/EUR, USD/GBP (paires principales)

### 2D — Moteur de comparaison de prix ⏳ ★

- [ ] Barre de recherche principale (`/dashboard/recherche` ou `/ (dashboard home)`)
  - Input texte : mot-clé, URL produit, UPC, ASIN, SKU fournisseur
  - Détection automatique du type (`InputType`) par pattern matching
  - Sélecteur quantité (impact volume discounts + stock check)
  - Sélecteur adresse de livraison (parmi `UserAddress`)
  - Sélecteur marketplaces (filtrer parmi celles actives pour le marché user)
- [ ] Parsers d'input (`lib/input-parsers.ts`)
  - URL Amazon → extraire ASIN (`/dp/B0XXXX`)
  - URL Best Buy → extraire SKU
  - URL Apple → extraire model code
  - Barcode scanner (mobile) → UPC/EAN
  - UPC lookup → Open Food Facts ou UPCitemdb pour enrichissement produit
- [ ] Endpoint `POST /api/search` (protégé, plan-limited)
  - Vérifier quota `searchCountMonth < PLAN_LIMITS[plan].searchesPerMonth`
  - Vérifier déduplication (`deduplicateSearch` — si même query < 6h, retourner existant)
  - Créer `PriceSearch` en BD avec contexte géo
  - Déclencher job scraping (async)
  - Incrémenter `searchCountMonth`
  - Retourner `searchId` pour polling
- [ ] Pipeline de calcul vrai coût (`lib/calculator.ts`)
  - `priceInUserCurrency = priceCurrent × exchangeRate`
  - `dutyAmount = priceInUserCurrency × dutyRate` (si > franchise)
  - `taxAmount = (priceInUserCurrency + dutyAmount + shippingCost) × taxRate`
  - `brokerageFee` — estimation selon transporteur et valeur (table statique DHL/UPS/FedEx)
  - `truePriceTotal = priceInUserCurrency + shippingCost + dutyAmount + taxAmount + brokerageFee`
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

### 2G — Favoris & Listes produits ⏳ 🔒 (dépend 2D)

- [ ] Bouton "Favori" ♡ sur chaque carte produit
  - Créer/supprimer `Favorite` avec tags optionnels
  - Page `/dashboard/favoris` — grille de favoris avec dernière recherche de prix
- [ ] Listes produits (`ProductList`)
  - Page `/dashboard/listes`
  - Créer liste (nom, type : STANDARD / RECURRING / PROJECT, tags)
  - Ajouter/retirer items (produit existant ou requête libre)
  - Réordonner items par drag-and-drop
  - Partager liste avec équipe (`isShared`) — ENTERPRISE
- [ ] Listes récurrentes (RECURRING)
  - Configurer `recurrenceDays` (7 = hebdo, 30 = mensuel, etc.)
  - `autoNotify = true` → notif quand nouvelle recherche disponible
  - Job cron lance les recherches automatiquement à `nextRunAt` (voir JOBS)
- [ ] Listes projet (PROJECT)
  - Ex: "Montage PC gaming" — tous les composants avec vrai coût total cumulé
  - Afficher somme `truePriceTotal` de tous les items

### 2H — Alertes prix & stock ⏳ 🔒 (dépend 2D + système notif)

- [ ] Interface alertes prix (`/dashboard/alertes`)
  - Créer alerte : produit, prix cible, devise, marketplaces à surveiller
  - Limite selon plan (FREE: 3, PREMIUM: 20, ENTERPRISE: illimité)
  - Afficher alertes actives + déclenchées
- [ ] Interface alertes stock
  - Créer alerte de retour en stock (produit + marketplaces)
- [ ] Job cron vérification alertes (toutes les heures) — voir JOBS
- [ ] Envoi notification quand déclenché : `triggeredAt = now()` + `isActive = false`
  - Canal selon `NotificationPreference` : email, in-app, SMS, push

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

| Méthode | Coût | Fiabilité | Priorité |
|---|---|---|---|
| Amazon PA API | Gratuit (affilié) | ⭐⭐⭐⭐⭐ | 1 — Amazon |
| Rainforest API | ~50 $/mois | ⭐⭐⭐⭐⭐ | Alt Amazon |
| PriceAPI.com | ~30 $/mois | ⭐⭐⭐⭐ | Multi-source |
| Best Buy API | Gratuit (clé) | ⭐⭐⭐⭐ | Best Buy |
| Walmart Open API | Gratuit (clé) | ⭐⭐⭐⭐ | Walmart |
| Apple JSON API | Gratuit (public) | ⭐⭐⭐⭐⭐ | Apple |
| Playwright | Infra only | ⭐⭐⭐ | Fallback |

- [ ] Évaluer et choisir méthode pour chaque marketplace avant Phase 3B
- [ ] Créer comptes affiliés / API keys pour les services choisis
- [ ] Ajouter clés API scraping dans `.env`

### 3B — Sources par marketplace ⏳ 🔒 (dépend 3A)

**Canada :**
- [ ] Amazon.ca — Amazon PA API (ASIN, prix, prime, stock)
  - Parser : price, originalPrice, primeEligible, isInStock, discounts (coupon clipper, lightning deal)
- [ ] Best Buy Canada — `https://api.bestbuy.ca/search` (JSON non documenté mais stable)
  - Parser : regularPrice, salePrice, isAvailable, skuId
- [ ] Costco.ca — Playwright (pas d'API publique)
  - Parser : price, memberPrice, isAvailable
- [ ] Apple Store Canada — `https://www.apple.com/shop/buy-iphone` JSON interne
  - Parser : price, monthlyPrice, tradeInValue, educationPrice
- [ ] Walmart.ca — Playwright ou partenaire API

**USA :**
- [ ] Amazon.com — PA API (même compte affilié, `marketplace: "www.amazon.com"`)
- [ ] Best Buy US — `https://api.bestbuy.com/v1` (clé gratuite)
- [ ] Apple Store US — API JSON (même structure que CA)
- [ ] Walmart.com — Walmart Open API (clé gratuite)

**Europe :**
- [ ] Amazon.fr / .de / .co.uk — PA API (marketplace EU)
- [ ] Étendre selon demande utilisateurs (Google Trends pour prioriser)

### 3C — Infrastructure de scraping (`apps/worker`) ⏳ 🔒 (dépend 3B)

- [ ] `apps/worker` — service Node.js standalone
  - Consumer de queue (BullMQ ou Cloudflare Queues)
  - Playwright headless pour sites sans API
  - Rate limiting respectueux par marketplace
- [ ] Queue de jobs scraping (`packages/api/src/queue.ts`)
  - `enqueueScrapeJob(searchId, marketplaces[])` — déclenché par `/api/search`
  - Un job par marketplace pour parallélisation
  - Retry x3 avec backoff exponentiel
- [ ] Cache Redis (Upstash) pour résultats scraping
  - Clé : `price:{marketplace}:{asin_or_sku}` · TTL : 6h
  - Clé : `exchange:{from}:{to}` · TTL : 1h
  - Si cache hit → retourner sans scraper + flag `cached: true`
- [ ] Fallback : si scraping échoue → retourner cache + `stale: true`
- [ ] Monitoring parsers (`MarketplaceStatusLog`)
  - Enregistrer chaque échec
  - Si taux d'échec > 10 % sur 1h → `Marketplace.status = DEGRADED`
  - Si 100 % échec → `Marketplace.status = DOWN` + alerte admin

### 3D — Parsing des rabais par source ⏳ 🔒 (dépend 3C)

| Source | Rabais détectés | Méthode |
|---|---|---|
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

- [ ] Upload fichier (`SupplierFileImport`)
  - Types : INVOICE, CATALOG, PURCHASE_ORDER, PRICE_LIST, PRODUCT_LIST
  - Formats supportés : PDF, Excel (.xlsx), CSV, Word
  - Upload sécurisé vers R2/S3 — URL stockée en BD
  - Champ `documentDate` : date du document (pas de l'upload)
- [ ] Parser IA (GPT-4o)
  - Extraire produits, prix, quantités, dates
  - `parsedBy: "ai"` + `rowCount` nb produits extraits
  - `errorLog` si extraction partielle
  - Validation humaine possible (interface de revue)
- [ ] Statuts du traitement : `pending → processing → done / error`
- [ ] Notification quand import terminé (in-app + email)
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

- [ ] `lib/ai.ts` — client OpenAI singleton
  - Respecter `aiTokensLimit` avant chaque appel
  - Décompter `aiTokensUsed` après chaque appel
  - Si `byokApiKey` présent (ENTERPRISE_PRO) → utiliser cette clé
- [ ] Résumé intelligent post-recherche (`PriceSearch.aiSummary`)
  - "La meilleure offre est Amazon.com à 1 142 $ CAD tout inclus. Vous économisez 356 $ vs Best Buy Canada. Attention : livraison 3-5 jours, douanes CUSMA applicables au-dessus de 20 $."
- [ ] Catégorisation automatique produits (`Product.category`, `aiCategoryConfidence`)
- [ ] Parser IA fichiers fournisseurs (Phase 3F)
- [ ] Conversation contextuelle sur un résultat (`AiConversation`)
  - Interface chat dans le panneau résultat
  - Context injecté : `PriceSearch` + `ProductOffer[]` + user market
  - Exemples : "Est-ce que les droits de douane sont applicables ?" / "Quel est le meilleur moment pour acheter ?"
- [ ] Suggestions produits alternatifs moins chers (cross-search IA)

### 5B — Gestion tokens IA ⏳

- [ ] Dashboard usage IA (`/dashboard/ia`)
  - Compteur tokens utilisés / limite ce mois
  - Barre de progression
  - Historique conversations + tokens utilisés
  - Reset date (`aiTokensResetAt` — 1er du mois)
- [ ] Achat tokens supplémentaires (particuliers) — Stripe one-time payment
  - Pack 10K tokens · Pack 50K tokens · Pack 200K tokens
  - `AiTokenPurchase` enregistré en BD
- [ ] Achat tokens org (ENTERPRISE) — `OrgAiTokenPurchase`
- [ ] BYOK (ENTERPRISE_PRO)
  - Page saisie clé API OpenAI personnelle
  - `byokApiKey` chiffré AES-256 avant stockage
  - Si BYOK activé → pas de décompte tokens TruePriceAI
- [ ] Réinitialisation mensuelle automatique compteurs (job cron — voir JOBS)

### 5C — Alertes intelligentes ⏳ 🔒 (dépend 2H + 5A)

- [ ] Email hebdomadaire "Meilleures offres pour vous" (basé sur favoris + listes)
- [ ] Prédiction tendance de prix (IA sur `PriceHistory` — montant 30j)
  - "Le prix de cet article a tendance à baisser avant Black Friday"
- [ ] Suggestion "Attendre ou acheter maintenant ?" basée sur tendance

---

## PHASE 6 — Notifications ⏳ 🔒 (dépend 1H)

> Système de notification multi-canal unifié. Tous les envois passent par `lib/notifications.ts`.

### 6A — Service email ⏳

- [ ] Choisir service email : **Resend** (recommandé — bonne DX, 100 emails/j gratuit)
  - Alternative : SendGrid, Postmark
- [ ] Configurer domaine `@truepricai.ca` dans Resend (SPF, DKIM, DMARC)
- [ ] Ajouter `RESEND_API_KEY` dans `.env`
- [ ] `lib/email.ts` — `sendEmail(to, template, data)` via Resend SDK
- [ ] Templates email (React Email) :
  - Invitation organisation
  - Alerte prix déclenchée
  - Alerte stock déclenchée
  - Rapport hebdomadaire / mensuel
  - Fin d'essai imminente (3j avant)
  - Paiement échoué
  - Confirmation suppression compte (RGPD)
  - Export données prêt
  - Partage de résultat reçu
  - Bienvenue post-inscription
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

> Toutes les tâches automatisées. Service : Cloudflare Workers Cron, Vercel Cron, ou BullMQ scheduler.

| Job | Fréquence | Description |
|---|---|---|
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

- [ ] Choisir le service cron (Vercel Cron pour MVP, Cloudflare Workers pour scale)
- [ ] `apps/worker/src/jobs/` — un fichier par job
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
- ⏳ `packages/db/src/index.ts` — exports + singleton client
- ⏳ `packages/db/src/queries/` — helpers par domaine
- ⏳ Seed initial : TaxRate + DutyRate (taux officiels)
- ⏳ Seed initial : Marketplace (Amazon.ca/.com, Best Buy CA/US, Apple CA/US, Walmart, Costco)
- ⏳ `npm run db:migrate` — migration versionnée (avant production)

---

## STRIPE — Flux complets ⏳

```
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
