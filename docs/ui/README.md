# TruePriceAI — Documentation Interface Graphique

## Design System v1.0

Le design system complet se trouve dans [`docs/design-system/`](../../docs/design-system/README.md).

---

## Identité visuelle

| Élément | Valeur |
|---|---|
| Thème | **Dark** (navy profond + accent cyan) |
| Couleur primaire | `#00D4C8` — Cyan tech (`tp-cyan-500`) |
| Fond de page | `#0A1628` — Navy profond (`tp-navy-700`) |
| Police affichage | **Syne** (titres, logos) |
| Police corps | **DM Sans** (texte courant) |
| Police monospace | **JetBrains Mono** (prix, codes) |

### Palette principale

```
Cyan (accent)         Navy (fond)
──────────────        ──────────────
50  #E0FFFE           50  #E8EDF5
100 #B3FEFA           100 #C5D0E3
300 #4DFFF8           400 #1E3A6E
500 #00D4C8 ★         600 #0D2140  header
600 #00A89E           700 #0A1628 ★ bg
700 #0D9488           800 #071020

Sémantiques
───────────
success  #2D9E5F
warning  #F5A623
error    #E53935
info     #1976D2
```

---

## Tokens Tailwind

```ts
// tailwind.config.ts — usage dans les composants
tp.cyan.500     // accent primaire
tp.navy.700     // fond de page
tp.navy.600     // header / sidebar
tp.card         // surface card (#112040)
tp.surface      // surface intermédiaire (#0F1E36)
tp.success      // vert succès
tp.warning      // orange warning
tp.error        // rouge erreur

// Ombres
shadow-tp-md       // ombre douce
shadow-tp-lg       // ombre forte
shadow-tp-glow     // lueur cyan
shadow-tp-glow-strong
```

---

## Composants UI

### Button — variantes disponibles
| Variante | Usage |
|---|---|
| `default` | CTA principal (cyan sur navy) |
| `outline` | Secondaire (contour cyan) |
| `navy` | Action complémentaire (navy fill) |
| `ghost` | Liens discrets |
| `link` | Liens texte |

### Badge — variantes disponibles
`default` · `outline` · `success` · `warning` · `error` · `ghost`

### Cards (pattern)
```tsx
<div className="bg-tp-card rounded-2xl border border-tp-cyan-500/15 
                hover:border-tp-cyan-500/35 hover:shadow-tp-lg 
                hover:-translate-y-1 transition-all">
```

---

## Composants Landing Page

| Composant | Fichier | Statut migration |
|---|---|---|
| Navbar | `components/landing/Navbar.tsx` | ✅ v1.0 |
| Hero | `components/landing/Hero.tsx` | ✅ v1.0 |
| SocialProof | `components/landing/SocialProof.tsx` | ✅ v1.0 |
| ProblemSolution | `components/landing/ProblemSolution.tsx` | ✅ v1.0 |
| Features | `components/landing/Features.tsx` | ✅ v1.0 |
| DemoVisual | `components/landing/DemoVisual.tsx` | ✅ v1.0 |
| Pricing | `components/landing/Pricing.tsx` | ✅ v1.0 |
| Testimonials | `components/landing/Testimonials.tsx` | ✅ v1.0 |
| FAQ | `components/landing/FAQ.tsx` | ✅ v1.0 |
| CTAFinal | `components/landing/CTAFinal.tsx` | ✅ v1.0 |
| Footer | `components/landing/Footer.tsx` | ✅ v1.0 |

---

## Animations (framer-motion)

- `whileInView + viewport={{ once: true }}` — animation au scroll, 1x seulement
- `ease: [0.16, 1, 0.3, 1]` — courbe douce "tp-out"
- Stagger : `staggerChildren: 0.15` sur les listes
- Variants typés avec `Variants` de framer-motion (requis pour TS 5.7+)

---

## Ressources

- [Design System complet](../../docs/design-system/README.md)
- [Tokens JSON](../../docs/design-system/tokens.json)
- [Previews HTML](../../docs/design-system/preview/)
- [Assets / Logos](../../docs/design-system/assets/)
- [Migration guide](../../handoff/MIGRATION.md)

*Mise à jour : 2026-05-03*
