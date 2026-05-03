# TruePriceAI — Documentation Projet

## Vision

**TruePriceAI** est une application web SaaS de comparaison de prix intelligente Canada vs USA.

Elle calcule le **vrai coût total** d'un produit en intégrant :
- Taux de change CAD/USD en temps réel (API Banque du Canada)
- Taxes applicables (TPS/TVQ/HST/Sales Tax US)
- Frais de douane et import (seuils ACEUM/CUSMA)
- Frais de livraison estimés

**Tagline :** "Payez le vrai prix. Pas le prix canadien."

---

## Le problème qu'on résout

Les Canadiens paient en moyenne **20 à 40% de plus** que les Américains pour les mêmes produits. Les raisons :
- Conversion manuelle approximative
- Douanes inconnues → surprises à la livraison
- Aucun outil ne calcule le coût *total* réel
- Recherche manuelle sur chaque site séparément

---

## Fonctionnalités clés

### Mode Particulier
- Recherche par UPC, EAN, MPN, ASIN ou texte libre
- Comparaison temps réel de 15+ boutiques CA et US
- Calcul automatique du coût total réel (change + douanes + taxes + livraison)
- Alertes de prix (notification quand un seuil est atteint)
- Boutiques favorites
- Assistant IA (GPT-4o) pour questions douanières

### Mode Entreprise
- **Sous-mode A — Veille concurrentielle :** surveillance des prix publics des concurrents
- **Sous-mode B — Procurement B2B :** import CSV/Excel de listes produits, comparaison fournisseurs, suggestion du plan d'achat optimal
- Export WooCommerce / Shopify / JSON / XML
- Gestion d'équipe (5 utilisateurs en Pro)

---

## Plans tarifaires

| Plan | Prix | Pour qui |
|---|---|---|
| Gratuit | 0 $ | Particuliers (5 recherches/jour) |
| Premium | 5 $/mois ou 29 $/an | Particuliers (illimité + IA) |
| Entreprise Starter | 49 $/mois | PME (500 produits/mois) |
| Entreprise Pro | 149 $/mois | Grandes équipes (illimité, 5 users) |
| Entreprise Custom | Sur mesure | Grandes entreprises (API, SSO) |

---

## Boutiques supportées

**Canada :** Amazon.ca · Best Buy Canada · Walmart Canada · Costco Canada · Canadian Tire · The Source · Bureau en Gros · Leon's · Home Depot Canada

**USA :** Amazon.com · Best Buy US · Walmart US · Costco US · Home Depot US · B&H Photo

---

## Marché cible

- **Primaire :** Consommateurs canadiens qui achètent de l'électronique, du matériel informatique, des appareils
- **Secondaire :** PME et acheteurs B2B qui s'approvisionnent aux USA
- **Géographie :** Canada (Québec prioritaire, puis Ontario, BC)

---

## Roadmap

### Phase actuelle (Mai 2026)
- [x] Landing page marketing complète
- [x] Design system v1.0 (dark navy + cyan)

### Court terme (Juin 2026)
- [ ] Auth (Clerk) + Billing (Stripe)
- [ ] Base de données (Prisma/Supabase)
- [ ] Résolution de codes produit (UPC/MPN/ASIN)
- [ ] Taux de change temps réel

### Moyen terme (Juillet–Août 2026)
- [ ] Moteur de scraping (Playwright + BullMQ)
- [ ] Module de calcul de coût réel
- [ ] Frontend Particulier complet
- [ ] Alertes de prix

### Long terme (Q4 2026)
- [ ] Frontend Entreprise (B2B)
- [ ] Assistant IA
- [ ] Lancement public
- [ ] App mobile (React Native)

---

## Contacts

- Email : bonjour@trueprice.ai
- GitHub : [github.com/domlemay/trueprice-ai](https://github.com/domlemay/trueprice-ai)

*Mise à jour : 2026-05-03*
