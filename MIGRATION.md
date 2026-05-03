# Migration v1.0 — checklist détaillée

## Fichiers remplacés (drop-in)

| Fichier | Statut |
|---|---|
| `tailwind.config.ts` | ✅ Remplacement complet — ajoute `tp.*`, fonts, shadows, ease, glow |
| `app/globals.css` | ✅ Remplacement complet — nouvelles vars HSL + import Google Fonts + utilities `glow-*` |
| `components/ui/button.tsx` | ✅ Variants migrés vers cyan, alias legacy maintenu |
| `components/landing/Hero.tsx` | ✅ Migré (cyan + Syne + glow + format mono) |
| `components/landing/Navbar.tsx` | ✅ Migré (logo SVG inline, cyan accents) |
| `components/landing/Pricing.tsx` | ✅ Migré (dark mode, cyan featured, plan colors mis à jour) |

## Reste à faire (Claude Code peut s'en charger)

Composants **non migrés** dans ce handoff — ils utilisent encore `brand-red` ou `brand-navy`. Le `tailwind.config.ts` les **remappe temporairement** vers cyan/navy donc ils ne casseront pas, mais idéalement il faut les remettre avec les nouveaux tokens `tp.*` :

- [ ] `components/landing/CTAFinal.tsx`
- [ ] `components/landing/DemoVisual.tsx`
- [ ] `components/landing/FAQ.tsx`
- [ ] `components/landing/Features.tsx`
- [ ] `components/landing/Footer.tsx`
- [ ] `components/landing/ProblemSolution.tsx`
- [ ] `components/landing/SocialProof.tsx`
- [ ] `components/landing/Testimonials.tsx`
- [ ] `components/ui/accordion.tsx`
- [ ] `components/ui/badge.tsx`

### Recipe pour Claude Code

```
Dans chaque fichier ci-dessus, remplacer :
- brand-red          → tp-cyan-500
- brand-red-dark     → tp-cyan-600
- brand-red-light    → tp-cyan-300
- brand-navy         → tp-navy-700
- brand-navy-light   → tp-navy-600
- shadow-brand-red/X → shadow-tp-glow
- bg-gray-50         → bg-tp-navy-700 (dark mode default)
- bg-white           → bg-tp-card (sauf si vraiment besoin de blanc)
- text-gray-700      → text-white/80
- text-gray-500      → text-white/60
- text-gray-400      → text-white/40
- border-gray-100/200 → border-tp-cyan-500/15

Et appliquer :
- font-display sur les <h1>, <h2> (Syne)
- font-mono tabular-nums sur les prix et nombres
- shadow-tp-md / shadow-tp-lg au lieu de shadow-lg/2xl
- Toujours du texte navy `tp-navy-700` sur cyan, jamais blanc.
```

## Vérification

```bash
# Chercher les occurrences restantes de la palette legacy
grep -rn "brand-red\|brand-navy" components/ app/

# Devrait être vide (sauf commentaires) après migration complète.
```

## Layout — `app/layout.tsx`

Pas besoin de modification : les fonts sont importées via `globals.css` (`@import url(google fonts)`). Si tu préfères les loader via `next/font` :

```tsx
import { DM_Sans, Syne, JetBrains_Mono } from 'next/font/google';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' });
const syne = Syne({ subsets: ['latin'], variable: '--font-syne' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export default function RootLayout({ children }) {
  return (
    <html lang="fr-CA" className={`${dmSans.variable} ${syne.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

Et dans `tailwind.config.ts`, mettre `fontFamily.sans: ['var(--font-dm-sans)', …]` etc.

## Dépendances

Aucune nouvelle dépendance requise. Stack actuelle suffit.
