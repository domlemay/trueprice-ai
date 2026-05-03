# CLAUDE.md — TruePriceAI

> Instructions persistantes pour toute session Claude (Code ou autre) dans ce repo.

## Le projet

**TruePriceAI** (truepricai.ca) — SaaS canadien de comparaison de prix Canada vs USA. Calcule le **vrai coût total** d'un produit (taux de change, taxes provinciales, douanes CUSMA, livraison).

- **Tagline :** *Payez le vrai prix. Pas le prix canadien.*
- **Stack :** Next.js 14 · TypeScript · Tailwind · shadcn/ui · Framer Motion · Lucide
- **Langue UI :** Français canadien (vous), anglais secondaire

## Système de design — source de vérité

📂 **`docs/design-system/SKILL.md`** ← lis ce fichier en début de session pour les règles complètes
📂 **`docs/design-system/README.md`** ← foundations détaillées (voix, type, couleur, motion)
📂 **`docs/design-system/colors_and_type.css`** ← tokens CSS complets

### Règles non-négociables

1. **Palette v1.0 (mai 2026) :** cyan `#00D4C8` + navy `#0A1628`. **L'ancienne palette rouge `#D91F26` est obsolète** — ne jamais l'utiliser pour de nouvelles UI. Si tu vois `brand-red` dans du code, c'est du legacy à migrer.
2. **Mode sombre par défaut.** Le mode clair existe mais est secondaire.
3. **Typo :** Syne (display), DM Sans (body), JetBrains Mono (prix/code). **Jamais** Inter, Roboto, Arial.
4. **Pas de violet, pas de gradient orange/rose.** Le seul gradient autorisé est un radial blur cyan subtil sur le hero.
5. **Glow cyan** = signature. Réservé aux éléments featured/AI/CTA hover. Ne pas en mettre partout.

### Voix & copy

- **Vous** (formel) — sentence case pour les titres, UPPERCASE pour les labels avec tracking `+0.08em` à `+0.12em`.
- **Format devise :** `1 142 $ CAD` (espace fine, dollar après, suffixe majuscule). **Jamais** `$1,142 CAD`.
- **Séparateur de milliers :** espace insécable. **Jamais** virgule.
- **Emoji :** uniquement 🇨🇦 / 🇺🇸 / 🍁. Jamais en icône feature.
- **Évite** : *révolutionnaire*, *magique*. **Préfère** : *intelligent*, *réel*, *vrai*, *précis*, *automatique*.

### Composants & patterns

- **CTA primary :** `bg-tp-cyan-500 text-tp-navy-700` + hover `-translate-y-0.5 + shadow-tp-glow`
- **Card :** `bg-tp-navy-card border border-tp-cyan-500/15 rounded-xl shadow-md`. Hover bump à `border-tp-cyan-500/35`.
- **Best-price / featured :** halo cyan + bg cyan-tinté + badge `MEILLEUR`
- **Cost breakdown :** segment bar horizontal (cyan = base, blue = livraison, green = taxes, amber = douanes)
- **Plan badges :** pill UPPERCASE — gris FREE, cyan PREMIUM, ambre ENTREPRISE

### Iconographie

Lucide en stroke 1.75. Couleur `tp-cyan-500` ou opacité du blanc. Tailles 16/20/24/32. Toujours `aria-label` sur boutons icon-only.

### Don'ts rapides

- ❌ `brand-red`, `brand-red-dark`, `brand-red-light` (palette legacy)
- ❌ `gradient-text` rouge (à remplacer par `gradient-text` cyan défini dans `globals.css`)
- ❌ Inter / Roboto / Arial / Segoe UI
- ❌ Emoji en icône
- ❌ Animations bouncy / rotate-jiggle (ease-out 150–250ms suffit)
- ❌ Commas comme séparateur de milliers en français

## Quand on me demande de "designer" qqch

Lis `docs/design-system/ui_kits/` pour voir les exemplars (marketing / particulier / entreprise). Reprends les patterns existants avant d'inventer.

## Ressources externes

- Logos : `docs/design-system/assets/*.svg`
- Tokens cross-platform : `docs/design-system/tokens.json`
- Drop-in Flutter : `docs/design-system/platform/app_theme.dart`
