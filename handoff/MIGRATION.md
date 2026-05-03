# TruePriceAI — Design System Migration v1.0

> Recette de migration des composants `brand.*` (rouge canadien) vers le design system `tp.*` (dark navy + cyan).
> Appliquée à partir du 2026-05-03.

## Pourquoi cette migration ?

Le design system initial utilisait des couleurs de type "PrixAlerte.ca" (rouge canadien `#D91F26`, fond blanc).
TruePriceAI v1.0 adopte un thème **dark navy** avec un accent **cyan tech** (`#00D4C8`), aligné sur la charte graphique officielle du projet (voir `media/trueprice-brand/`).

---

## Correspondance des tokens

### Couleurs — Accents

| Ancien token | Nouveau token | Valeur hex |
|---|---|---|
| `brand-red` | `tp-cyan-500` | `#00D4C8` |
| `brand-red-dark` | `tp-cyan-600` | `#00A89E` |
| `brand-red-light` | `tp-cyan-300` | `#4DFFF8` |
| `brand-navy` | `tp-navy-700` | `#0A1628` |
| `brand-navy-light` | `tp-navy-600` | `#0D2140` |

### Couleurs — Surfaces (dark theme)

| Usage | Nouveau token | Valeur hex |
|---|---|---|
| Fond de page | `bg-tp-navy-700` | `#0A1628` |
| Fond section alternative | `bg-tp-card` | `#112040` |
| Surface formulaire/input | `bg-tp-input` | `#0D1E38` |
| Fond surface intermédiaire | `bg-tp-surface` | `#0F1E36` |
| Header / sidebar | `bg-tp-navy-600` | `#0D2140` |

### Couleurs — Sémantiques

| Usage | Nouveau token | Valeur hex |
|---|---|---|
| Succès | `tp-success` | `#2D9E5F` |
| Avertissement | `tp-warning` | `#F5A623` |
| Erreur | `tp-error` | `#E53935` |
| Info | `tp-info` | `#1976D2` |

### Textes (dark theme)

| Ancien | Nouveau |
|---|---|
| `text-gray-900` / `text-brand-navy` | `text-white` |
| `text-gray-700` | `text-white/80` |
| `text-gray-600` | `text-white/70` |
| `text-gray-500` | `text-white/60` |
| `text-gray-400` | `text-white/40` |
| `text-gray-300` | `text-white/30` |

### Bordures

| Ancien | Nouveau |
|---|---|
| `border-gray-100` | `border-tp-cyan-500/15` |
| `border-gray-200` | `border-tp-cyan-500/20` |
| `border-white/20` | `border-tp-cyan-500/20` |
| `border-green-*` | `border-tp-success/30` |
| `border-red-*` | `border-tp-error/20` |

### Fonds de cards/sections

| Ancien | Nouveau |
|---|---|
| `bg-white rounded-* border-gray-*` | `bg-tp-card border border-tp-cyan-500/15 rounded-2xl` |
| `bg-gray-50` (section) | `bg-tp-card` ou `bg-tp-navy-700` alternés |
| `bg-gray-100` (petits éléments) | `bg-white/5` |
| `bg-green-50 border-green-200` | `bg-tp-success/10 border-tp-success/30` |
| `bg-red-50 border-red-100` | `bg-tp-error/10 border-tp-error/20` |
| `bg-orange-50 border-orange-100` | `bg-tp-warning/10 border-tp-warning/20` |
| `bg-blue-50 border-blue-100` | `bg-tp-info/10 border-tp-info/20` |
| `bg-purple-50 border-purple-100` | `bg-tp-cyan-500/10 border-tp-cyan-500/20` |

### Ombres

| Ancien | Nouveau |
|---|---|
| `shadow-xl` | `shadow-tp-lg` |
| `shadow-lg` | `shadow-tp-md` |
| `shadow-2xl shadow-brand-red/40` | `shadow-tp-glow-strong` |
| hover glow | `hover:shadow-tp-glow` |

### Typographie

| Ancien | Nouveau |
|---|---|
| `font-extrabold` (headings) | `font-display font-bold tracking-tight` |
| `text-sm font-semibold uppercase tracking-widest` (labels) | `font-medium text-xs uppercase tracking-[0.12em]` |
| Prix numériques | `font-mono tabular-nums` |

---

## Recette de migration par section

### Pattern section

```tsx
// AVANT
<section className="py-24 bg-white">

// APRÈS
<section className="py-24 bg-tp-navy-700">
// ou pour alterner :
<section className="py-24 bg-tp-card">
```

### Pattern card

```tsx
// AVANT
<div className="bg-white rounded-3xl p-7 border border-gray-100 hover:shadow-xl">

// APRÈS
<div className="bg-tp-card rounded-2xl p-7 border border-tp-cyan-500/15 hover:border-tp-cyan-500/35 hover:shadow-tp-lg hover:-translate-y-1 transition-all">
```

### Pattern section-heading

```tsx
// AVANT
<p className="text-brand-red font-semibold text-sm uppercase tracking-widest mb-3">
<h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy">

// APRÈS
<p className="text-tp-cyan-500 font-medium text-xs uppercase tracking-[0.12em] mb-3">
<h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
```

### Pattern badge/pill

```tsx
// AVANT
<span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">

// APRÈS
<span className="bg-tp-success/20 text-tp-success px-3 py-1 rounded-full">
```

### Pattern icon-box

```tsx
// AVANT
<div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
  <BarChart2 className="text-blue-500" />

// APRÈS
<div className="w-12 h-12 rounded-2xl bg-tp-cyan-500/10 flex items-center justify-center">
  <BarChart2 className="text-tp-cyan-500" />
```

---

## Composants — État de migration

| Composant | Statut |
|---|---|
| `tailwind.config.ts` | ✅ Migré |
| `app/globals.css` | ✅ Migré |
| `components/ui/button.tsx` | ✅ Migré |
| `components/landing/Navbar.tsx` | ✅ Migré |
| `components/landing/Hero.tsx` | ✅ Migré |
| `components/landing/Pricing.tsx` | ✅ Migré |
| `components/landing/SocialProof.tsx` | ⏳ En attente |
| `components/landing/ProblemSolution.tsx` | ⏳ En attente |
| `components/landing/Features.tsx` | ⏳ En attente |
| `components/landing/DemoVisual.tsx` | ⏳ En attente |
| `components/landing/Testimonials.tsx` | ⏳ En attente |
| `components/landing/FAQ.tsx` | ⏳ En attente |
| `components/landing/CTAFinal.tsx` | ⏳ En attente |
| `components/landing/Footer.tsx` | ⏳ En attente |
| `components/ui/accordion.tsx` | ⏳ En attente |
| `components/ui/badge.tsx` | ⏳ En attente |

---

*Dernière mise à jour : 2026-05-03*
