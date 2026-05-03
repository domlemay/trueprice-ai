---
name: TruePriceAI Design System
description: Design system for TruePriceAI — Canadian SaaS for Canada-vs-USA price comparison. French-first (Canadien), dark-mode default, cyan-on-navy palette with glow signature, Syne/DM Sans/JetBrains Mono typography. Use whenever building TruePriceAI surfaces (marketing site, particulier app, entreprise app, AI assistant) or any TruePriceAI-branded materials.
---

# TruePriceAI Design System

## When to use this skill

Activate this skill any time the user mentions **TruePriceAI**, **truepricai.ca**, "vrai prix", "prix Canada vs USA", or asks for screens/components that match this brand. Also use it when working in the `domlemay/trueprice-ai` codebase — but **note that the codebase still uses an older red/navy palette**; the **brief (May 2026, v1.0) is authoritative** and uses **cyan + navy**.

## Core voice & vibe

- **Language:** French Canadian first, English secondary. *Vous* form. Sentence-case titles. UPPERCASE labels with `+0.08em` to `+0.12em` tracking.
- **Tone:** Technical credibility + savings hook. Numeric, factual. Use *intelligent*, *réel*, *vrai*, *précis*, *automatique*. Avoid *révolutionnaire*, *magique*.
- **Tagline:** *"Payez le vrai prix. Pas le prix canadien."*
- **Currency format:** `1 142 $ CAD` (thin space, dollar after, CAD/USD uppercase suffix).
- **Emoji:** only 🇨🇦 / 🇺🇸 (country) and 🍁 (Canadian-trust pill). Never as feature icons.

## Visual foundations (dark default)

| Token | Value | Use |
|---|---|---|
| `--tp-bg-base` | `#0A1628` | Page background |
| `--tp-bg-elevated` | `#0D2140` | Header / sidebar |
| `--tp-bg-card` | `#112040` | Cards |
| `--tp-cyan-500` | `#00D4C8` | ★ Primary accent (CTA, logo, AI, glow) |
| `--tp-cyan-700` | `#0D9488` | ★ Primary accent in light mode |
| `--tp-cyan-300` | `#4DFFF8` | Highlight / hover glow |
| `--tp-success` | `#2D9E5F` | Savings, ✓ |
| `--tp-warning` | `#F5A623` | Enterprise plan |
| Border default | `rgba(0,212,200,0.15)` | Card borders |
| Border focus | `#00D4C8` + `0 0 0 3px rgba(0,212,200,.15)` | Focused inputs |
| Glow signature | `0 0 20px rgba(0,212,200,.3)` | Hover CTA, AI badges, best-price rows |

**No purple. No orange gradients. No rainbow gradients.** The only gradient is subtle cyan-tinted radial blur on the hero.

**Radii:** 4 (badge) / 8 (button, input) / 12 (card) / 16–24 (modal, hero) / 9999 (pill).
**Shadows:** card = `0 4px 12px rgba(0,0,0,.4)`. Hover lift = `0 8px 24px rgba(0,0,0,.5)`. Cyan glow on accented elements.
**Animation:** 150–250ms, ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`). No bouncy springs, no rotate-jiggle.
**Layout:** 4-pt spacing scale. Marketing max-width 1280px. App max-width 1400px with 240px sidebar.

## Typography

- **Display — Syne 700:** hero titles (48–64px, `-0.02em`), H1, H2.
- **Body — DM Sans 400/500/700:** all UI, body, labels, H3, H4. Default font.
- **Mono — JetBrains Mono 400/500/700:** prices, UPC codes, breakdowns, data tables. Tabular nums.

Loaded from Google Fonts in `colors_and_type.css`.

**Text on dark = white at opacity stops:** `#FFF` (primary), `rgba(#fff, .7)` (secondary), `rgba(#fff, .4)` (muted). No generic gray.

## Iconography

**Lucide** at stroke 1.75. Cyan accent or white-opacity. Sizes 16/20/24/32. Always `aria-label` on icon-only buttons.

Recurring: `Search`, `Sparkles` (AI), `Zap` (live), `Shield` (trust), `Bell` (alert), `TrendingUp/Down` (KPI), `ArrowRight` (CTA), `Star` (favorite), `Upload` (procurement), `ChevronDown/Right` (expand).

## Files in this system

| File | Purpose |
|---|---|
| `README.md` | Full brand + visual + content fundamentals (read first) |
| `colors_and_type.css` | All design tokens as CSS vars + type styles. Import this. |
| `tokens.json` | Cross-platform tokens (Web/Flutter/Native) |
| `assets/*.svg` | Logos (dark/light/transparent/3D), icon-only, favicons |
| `platform/app_theme.dart` | Flutter Material 3 drop-in |
| `platform/tailwind.config.snippet.js` | Tailwind drop-in |
| `preview/*.html` | Design-system cards (colors, type, spacing, components, brand) |
| `ui_kits/marketing/index.html` | Public marketing site exemplar (landing + pricing) |
| `ui_kits/particulier/index.html` | Consumer dashboard + search + breakdown modal |
| `ui_kits/entreprise/index.html` | B2B dashboard + KPIs + procurement |

## How to apply

### HTML mock
```html
<link rel="stylesheet" href="path/to/colors_and_type.css">
<body class="tp-root">
  <h1 class="tp-display-1">Payez le <span style="color: var(--tp-accent)">vrai prix.</span></h1>
</body>
```

Use semantic type classes (`.tp-display-1`, `.tp-h1`–`.tp-h4`, `.tp-body`, `.tp-mono`, `.tp-label`, `.tp-eyebrow`) instead of inline font-size/weight.

### Component patterns
- **Primary CTA:** cyan bg, navy text, hover lifts `-1px` + adds glow shadow.
- **Card:** navy `#112040` bg, `1px` cyan-15 border, `12px` radius, `0 4px 12px` shadow. Hover bumps border to cyan-35.
- **Best-price row / featured:** cyan-tinted bg + cyan-50 border + glow halo + `MEILLEUR` badge.
- **Cost breakdown:** stacked horizontal segment bar (cyan = base price, blue = shipping, green = taxes, amber = duties) + legend with mono numerics.
- **Plan badges:** rounded pill, UPPERCASE letterspaced, color-coded (gray FREE / cyan PREMIUM / amber ENTREPRISE).

### Don't
- ❌ Use the legacy red `#D91F26` from the old codebase.
- ❌ Add purple, violet, pink, or orange (warning amber is the only orange-ish color).
- ❌ Use Inter, Roboto, or Arial.
- ❌ Use emoji as feature icons or in section headers.
- ❌ Use bouncy springs or rotate-jiggle animations.
- ❌ Use commas as thousand separators in French copy (use thin/non-breaking space).
- ❌ Use lowercase `cad` / `usd`.

### Do
- ✅ Lead numerics in JetBrains Mono with tabular nums.
- ✅ Lift cards on hover (border + shadow), not scale.
- ✅ Reach for the cyan glow signature on featured/AI/CTA elements only — sparingly.
- ✅ Keep dark mode as the canonical look.
- ✅ Use Lucide icons in cyan, stroke 1.75.

## Sources of truth

- Brand brief v1.0 (May 2026) — authoritative.
- `uploads/tokens.css` + `uploads/tokens.json` — token values.
- `uploads/app_theme.dart` — Flutter mapping.
- GitHub `domlemay/trueprice-ai@master` — layout patterns (Hero, Pricing, Navbar) but **not** colors (use cyan/navy from this system, not legacy red).
