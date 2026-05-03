# TruePriceAI — Contexte Claude Code

> Ce fichier est lu par Claude Code au début de chaque session pour maintenir le contexte du projet.
> **Toujours garder ce fichier à jour.**

---

## Identité du projet

- **Nom :** TruePriceAI
- **Type :** SaaS web — comparaison de prix Canada vs USA
- **Repo :** `github.com/domlemay/trueprice-ai` (branche `master`)
- **Dev local :** `http://localhost:3000` (`npm run dev`)
- **Propriétaire :** domlemay (domlemay@gmail.com)

---

## Stack technique actuelle

```
Next.js 14 (App Router) · TypeScript 5.7 (strict) · Tailwind 3.4
framer-motion 11+ · Radix UI · lucide-react · class-variance-authority
```

**Pas encore intégré** (à venir Phase 1+) :
- Clerk, Stripe, Prisma, Supabase, Redis, BullMQ, OpenAI

---

## Design system — règles absolues

1. **Jamais `brand-*`** dans les nouveaux composants — utiliser uniquement `tp-*`
2. Fond de page : `bg-tp-navy-700`
3. Cards : `bg-tp-card border border-tp-cyan-500/15 rounded-2xl`
4. Accent principal : `tp-cyan-500` (`#00D4C8`)
5. Texte principal : `text-white` (pas `text-gray-900`)
6. Texte secondaire : `text-white/60` ou `text-white/40`
7. Titres : `font-display font-bold tracking-tight`
8. Prix/codes : `font-mono tabular-nums`
9. Labels section : `text-tp-cyan-500 font-medium text-xs uppercase tracking-[0.12em]`
10. Ombres : `shadow-tp-md` / `shadow-tp-lg` / `shadow-tp-glow`

---

## Conventions TypeScript

- `strict: true` partout — zéro `any`
- Variants framer-motion typés avec `import { type Variants } from "framer-motion"`
- `React.ElementRef` → **déprécié** → utiliser `React.ComponentRef`
- Ease framer-motion : utiliser `[0.16, 1, 0.3, 1]` ou la valeur `string` dans un `Variants` typé

---

## Règles de code importantes

- Server Components par défaut — `"use client"` seulement si hooks/events/animations
- Icônes : `lucide-react` — pas de `Twitter` ni `Linkedin` (non exportés v1.x) → utiliser `MessageCircle`, `Rss`
- Animations scroll : toujours `viewport={{ once: true }}` pour éviter la répétition
- Sections alternées : `bg-tp-navy-700` et `bg-tp-card`

---

## État d'avancement

### Complété
- Landing page marketing complète (11 sections)
- Design system TruePriceAI v1.0 (dark navy + cyan)
- Migration de tous les composants landing
- Composants UI (button, badge, accordion)
- Repo GitHub : `github.com/domlemay/trueprice-ai`
- Structure Docs/

### En cours / À faire
- Voir `Docs/todo/README.md` pour la liste complète

---

## Fichiers clés à connaître

| Fichier | Rôle |
|---|---|
| `tailwind.config.ts` | Tous les tokens `tp-*` + polices |
| `app/globals.css` | Variables CSS dark theme + Google Fonts |
| `components/ui/button.tsx` | Composant bouton avec variantes `tp-*` |
| `handoff/MIGRATION.md` | Recette de migration design system |
| `Docs/todo/README.md` | État des tâches |

---

## Instructions pour Claude Code

1. **Toujours lire ce fichier en début de session** avant de toucher au code
2. Après chaque session significative, mettre à jour :
   - `Docs/todo/README.md` (marquer les tâches complétées, ajouter les nouvelles)
   - Ce fichier si l'état du projet a changé
3. **Ne jamais** utiliser `any` en TypeScript
4. **Ne jamais** créer de composants avec `brand-*` tokens
5. Avant de créer un nouveau composant UI, vérifier `components/ui/` pour l'existant
6. Tous les commits en Conventional Commits : `feat:`, `fix:`, `chore:`, `docs:`
7. Branches : `feat/`, `fix/`, `docs/`, `chore/`

*Mise à jour : 2026-05-03*
