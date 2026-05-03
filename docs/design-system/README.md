# TruePriceAI — Design System

> **Tagline:** *"Payez le vrai prix. Pas le prix canadien."*
> **Version 1.0 — Mai 2026**
> Primary language: French (Canadian). Secondary: English.

---

## What is TruePriceAI?

TruePriceAI (truepricai.ca) is a Canadian SaaS web application for **smart price comparison between Canada and USA**. It calculates the **TRUE total cost** of a product by integrating:

- Live CAD/USD exchange rate
- GST / QST / HST taxes (province-aware)
- Customs duties (with CUSMA / ACEUM exemption logic)
- Shipping & brokerage estimates

The product ships in two modes:

- **Mode Particulier** — consumer price-comparison + alerts
- **Mode Entreprise** — B2B competitive intelligence + procurement

## Surfaces represented in this system

| Surface | Description |
|---|---|
| **Marketing site** | Landing, Pricing, About — public, dark hero, conversion-focused |
| **App Particulier** | Authenticated dashboard, search, results table, breakdown modal, alerts, favorites |
| **App Entreprise** | Dashboard with KPIs/charts, competitive watch, procurement upload, supplier comparison |
| **Assistant IA** | Split chat layout — context left, conversation right (Premium feature) |

## Sources

| Source | Path / Link | Notes |
|---|---|---|
| Brand guidelines + tokens | `uploads/README.md`, `uploads/tokens.css`, `uploads/tokens.json` | Authoritative palette + theme tokens (cyan / navy) |
| Flutter theme | `uploads/app_theme.dart` → `platform/app_theme.dart` | Material 3 dark + light themes |
| Tailwind snippet | `uploads/tailwind.config.snippet.js` → `platform/tailwind.config.snippet.js` | Drop-in for Tailwind apps |
| Logo set (SVG) | `uploads/logo-*.svg`, `uploads/icon-only.svg`, `uploads/favicon-*.svg` → `assets/` | All logo variations |
| Codebase | GitHub `domlemay/trueprice-ai@master` | Next.js 14 + Tailwind + shadcn/ui + Framer Motion + lucide-react |
| Design prompt | "PROMPT CLAUDE DESIGN — TruePriceAI v1.0" | Authoritative — supersedes legacy red/navy palette in old codebase |

> ⚠️ **Note:** The GitHub codebase still uses an older red/navy palette (`#D91F26`, `#1B2A4A`). The **brief is the new source of truth** — all new work uses cyan `#00D4C8` + navy `#0A1628`. Layout patterns from the codebase are reused; colors are remapped.

---

## Index — files in this design system

```
TruePriceAI Design System/
├── README.md                       # This file
├── SKILL.md                        # Skill manifest (Claude Code compatible)
├── colors_and_type.css             # CSS vars: colors, typography, spacing, shadows, type styles
├── tokens.json                     # Cross-platform design tokens
│
├── assets/                         # Logos, icons, favicons (SVG)
│   ├── logo-dark.svg               # Full logo on navy bg
│   ├── logo-light.svg              # Full logo on white bg
│   ├── logo-transparent.svg
│   ├── logo-3d.svg
│   ├── icon-only.svg               # Mark only
│   ├── text-only-dark.svg / text-only-light.svg
│   └── favicon-32.svg / favicon-16.svg
│
├── platform/                       # Drop-in integrations
│   ├── app_theme.dart              # Flutter Material 3
│   └── tailwind.config.snippet.js  # Tailwind CSS
│
├── preview/                        # Design-system tab cards (≈700×<H>px)
│   ├── colors-*.html               # Color scales + semantic palette
│   ├── type-*.html                 # Type specimens
│   ├── spacing-*.html              # Spacing, radii, shadows
│   ├── component-*.html            # Buttons, inputs, badges, cards
│   └── brand-*.html                # Logos, iconography
│
└── ui_kits/
    ├── marketing/                  # Public-facing landing / pricing
    ├── particulier/                # Consumer dashboard / search results
    └── entreprise/                 # B2B dashboard / procurement
```

---

## CONTENT FUNDAMENTALS

The voice is **French (Canadian)**, direct, confident, and oriented around savings. English is supported as secondary.

### Tone & person
- **Vous** (formal "you") for marketing copy: *"Comparez les prix"*, *"Essayez gratuitement"*. Default in app UI too.
- First person possessive in user areas: *"Mes alertes"*, *"Mes recherches récentes"*, *"Mon plan"*. Reinforces ownership.
- Imperative verbs for CTAs: *Comparer*, *Voir*, *Essayer*, *Créer une alerte*, *Lancer l'analyse*.

### Casing
- **Titles**: Sentence case, NOT title case. *"Comment ça marche"* not *"Comment Ça Marche"*.
- **CTAs**: Sentence case. *"Essayer gratuitement"*, *"Créer un compte"*.
- **Labels / badges / eyebrows**: UPPERCASE with positive letter-spacing (0.08–0.12em). *"MEILLEUR PRIX"*, *"PRIX INTELLIGENT · DÉCISIONS CLAIRES"*.
- **Plan tiers**: UPPERCASE. *FREE*, *PREMIUM*, *ENTREPRISE*.
- **Currency suffix**: capital `CAD` / `USD`, never lowercase. *"1 142 $ CAD"*.

### Punctuation & numerals
- **French currency format**: amount + non-breaking space + `$` + `CAD`/`USD`. *"1 498 $ CAD"*, not *"$1,498 CAD"*.
- **Thousand separator**: thin/non-breaking space. *"2 340"*, never comma. (Decimal = comma in pure FR; the codebase uses period for tech consistency — match what's there.)
- **Middle dots** (`·`) in eyebrow strings and pill separators: *"Essai gratuit · Aucune carte requise · Résultats en 3 secondes"*.
- **Em dashes** for clarification in marketing copy.
- **Checkmarks** (`✓`) bullet trust signals; **flags** (🇨🇦 / 🇺🇸) identify country.

### Vibe
Technical credibility + savings hook. Numeric, factual, never breathless. The IA badge sells intelligence; the cyan glow sells precision. Avoid hype words ("révolutionnaire", "magique"); prefer *intelligent*, *réel*, *vrai*, *précis*, *automatique*.

### Sample copy
- Hero: **Payez le vrai prix. Pas le prix canadien.**
- Sub: *Comparez les prix Canada vs USA en tenant compte du taux de change, des taxes et des frais de douane. **En temps réel.***
- Trust pill: *Taux de change en direct · Calcul douanes automatique · Assistant IA inclus*
- Result row: **Économisez 356 $** · *MEILLEUR PRIX*
- Breakdown row: *Prix USD converti — 1 068 $* / *Douanes (0% ACEUM) — 0 $*

### Emoji usage
- ✅ **Allowed sparingly**: 🇨🇦 / 🇺🇸 (country identification only), 🍁 (Canadian-trust pill, marketing only).
- ❌ **Never**: emoji as feature icons, emoji in section headers, emoji in app chrome. Use Lucide icons in cyan instead.

---

## VISUAL FOUNDATIONS

### Mode
**Dark by default.** Light mode is supported but secondary. Background is deep navy `#0A1628`; surfaces lift in 3 stops (`#0F1E36` → `#112040` → `#0D2140`). The brand's identity is dark + glowing.

### Color
- **Primary accent**: cyan `#00D4C8` (dark) / teal `#0D9488` (light). Used on logo, all primary CTAs, charts, focus rings, glow halos, AI badges.
- **Highlight cyan**: `#4DFFF8` for focus glow and hover lift.
- **Strict palette discipline**: NO purple, NO violet, NO pink/orange gradients outside the palette. NO generic gray text — use `rgba(255,255,255,X)` opacity stops on dark.
- **Semantic**: success `#2D9E5F` (savings, green check), warning `#F5A623` (Enterprise badge, partial match), error `#E53935`, info `#1976D2`.
- **Country flags** are the only place strong red appears.

### Typography
- **Display** (`Syne`): hero titles, marketing display headlines. Slightly geometric, modern.
- **Body** (`DM Sans`): all UI, body text, labels.
- **Mono** (`JetBrains Mono`): prices, UPC codes, breakdowns, data tables. Tabular numerics.
- **Tracking**: `-0.02em` on display; `0` body; `+0.08em–0.12em` on UPPERCASE labels/badges.
- **Weights**: 400 / 500 / 700 only. No 300, 600, 900.

> **Font substitution flag:** The legacy `tokens.css` declared Segoe UI as the body font. The design brief explicitly forbids Inter/Roboto/Arial and prescribes **DM Sans** (body), **Syne** (display), and **JetBrains Mono** (mono). All three are loaded from Google Fonts in `colors_and_type.css`. **Action requested**: confirm this typographic direction and provide self-hosted woff2 files if needed for production.

### Backgrounds
- **Solid navy** is the rule.
- **Subtle radial blurs** allowed in hero (cyan `10–20%` opacity, blurred `~3xl`) — used in landing Hero.
- **Optional grid pattern** at `5%` opacity over hero (60×60px).
- **No full-bleed photographic imagery** in chrome. Product imagery only inside cards.
- **Gradient backgrounds**: only the subtle navy-elevated → navy-base radial. **No** purple/orange/rainbow gradients.

### Borders
- Default: `1px solid rgba(0,212,200,0.15)` on dark cards.
- Hover: `1px solid rgba(0,212,200,0.35)` + slight elevation.
- Focus: `1px solid #00D4C8` + glow shadow.
- Subtle (low-priority dividers): `rgba(255,255,255,0.06)`.
- Light mode mirrors with teal `rgba(13,148,136,X)`.

### Corner radii
- Inputs / buttons: **8px** (`--tp-radius-md`).
- Badges (small): **4px**.
- Cards: **12px** (`--tp-radius-lg`).
- Modals / hero panels: **16–24px**.
- Pills / avatars: **9999px** (full).

### Shadows & glow
- **Card shadow** (default): `0 4px 12px rgba(0,0,0,0.4)`.
- **Lifted card on hover**: `0 8px 24px rgba(0,0,0,0.5)`.
- **Cyan glow** (signature): `0 0 20px rgba(0,212,200,0.3)`. Used on primary buttons hover, focused inputs, AI badges, "Meilleur prix" rows.
- **Strong glow**: `0 0 40px rgba(0,212,200,0.5)` for hero CTA / centerpiece elements.
- Inner shadows: avoided.

### Animation & motion
- **Easing**: `ease-out` for entry, `ease-in` for exit. Custom: `cubic-bezier(0.16, 1, 0.3, 1)` for satisfying decel.
- **Durations**: 150ms (micro), 250ms (default), 400ms (slow), 600ms (page transitions). Max 300ms for interactions.
- **Hover lift**: `translateY(-1px)` + glow on primary buttons.
- **Float loop** on floating badges in hero (3s ease-in-out, ±6px).
- **Stagger** entry on hero text: 0.15s children delay, 0.6s duration each.
- **No bouncy springs**, no rotate-jiggle. The brand is precise, not playful.
- **Respects `prefers-reduced-motion`**.

### Hover & press states
- **Buttons**: hover = bg one cyan-step darker + `translateY(-1px)` + glow. Press = bg one step darker again + `translateY(0)`.
- **Cards**: hover = border `0.15 → 0.35` opacity + lift shadow.
- **Links**: hover = white→cyan shift; underline animates from 0% width.
- **Sidebar items**: hover = `rgba(0,212,200,0.08)` background fill.
- **Disabled**: `opacity: 0.5`, `pointer-events: none`.

### Transparency & blur
- **Glassmorphism** allowed *only* on modals and floating badges: `backdrop-filter: blur(12px)` + `background: rgba(white,0.10)` + `border: rgba(white,0.20)`.
- **Translucent overlays** (rgba navy) for modal backdrops at `0.6`.
- Avoid blur on text-heavy surfaces (perf + readability).

### Layout rules
- **Max content width**: `1400px` centered for app, `1280px` (`max-w-7xl`) for marketing.
- **Sidebar**: 240px fixed left, navy-elevated.
- **Navbar**: 64px tall, navy-elevated bg + subtle cyan-tinted bottom border.
- **Mobile-first**. Breakpoints: 375 / 768 / 1280.
- **Comparison tables**: horizontal scroll on mobile; first column sticky.
- **Spacing scale**: 4-pt base (4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 / 64).

### Cards (the recurring container)
- Background: `#112040`
- Border: `1px solid rgba(0,212,200,0.15)`
- Radius: `12px`
- Padding: `20px 24px`
- Shadow: `0 4px 12px rgba(0,0,0,0.4)`
- Hover: border opacity → 0.35, slight elevation increase
- "Best price" / featured cards may add a glow halo + cyan-tinted background.

### Imagery
- Mostly **product photos** inside cards (Amazon-style, white/neutral background).
- No people stock photography in current brand. No grain, no warm overlays.
- Brand imagery skews **cool** — cyan glow over navy.

### Iconography (preview)
- Lucide icon set, stroke 1.5–2, cyan `#00D4C8` color. See ICONOGRAPHY section below.

---

## ICONOGRAPHY

### What the codebase uses
The Next.js codebase imports `lucide-react@^1.14.0`. Icons appear inline (`<Search />`, `<Menu />`, `<TrendingUp />`, `<Zap />`, `<Shield />`, `<Sparkles />`, `<ArrowRight />`, `<X />`, `<Bell />`).

### Decision for this design system
- **Use Lucide everywhere.** Available via `lucide` (CDN: `https://unpkg.com/lucide@latest`) or `lucide-react`. Stroke width **1.75** by default.
- Color: `--tp-fg-accent` (cyan) for active / accent; `--tp-fg2` for inline body; `--tp-fg3` for tertiary.
- Sizes: 16 / 20 / 24 / 32px. Never bigger than 32 in chrome.
- All icon-only buttons MUST have `aria-label`.

### Recurring icon roles
| Role | Icon | Usage |
|---|---|---|
| Search | `Search` | Hero + dashboard search bar |
| Brand mark glyph | `TrendingUp` | Logo placeholder when SVG unavailable |
| AI / agent | `Sparkles` | AI badge, assistant CTA |
| Speed / live | `Zap` | Exchange-rate widget, "live" pills |
| Trust / security | `Shield` | Customs trust pill |
| Direction / next | `ArrowRight` | Primary CTAs |
| Alert | `Bell` | `<AlertBell />` component |
| Favorite | `Star` | Favorite store toggle |
| Upload | `Upload` / `FileSpreadsheet` | Procurement import |
| Trend | `TrendingUp` / `TrendingDown` | KPI deltas |
| Chevron | `ChevronDown` / `ChevronRight` | Expand breakdown row |
| Filter / sort | `SlidersHorizontal` | Results table chrome |
| Menu | `Menu` / `X` | Mobile nav |
| User / settings | `User`, `Settings`, `CreditCard` | Account chrome |

### Country flags
Used as **emoji** (🇨🇦, 🇺🇸) — short rows, native font rendering. Never as PNG/SVG.

### Logos & marks
The `assets/` folder ships 9 SVG variants (icon, text-only ×2, full ×4, favicon ×2, 3D). Pick by background:
- `logo-dark.svg` — full mark on navy
- `logo-light.svg` — full mark on white
- `logo-transparent.svg` — full mark with dark text on light/cyan
- `icon-only.svg` — favicon-larger / app-icon use
- `favicon-16.svg` / `favicon-32.svg` — sized for actual favicon use only

> **No purple, no orange.** If a future icon set is needed (e.g. illustrations), document it here and add to `assets/`.

---

## How to use this system

### In an HTML mock
```html
<link rel="stylesheet" href="../colors_and_type.css">
<body class="tp-root">
  <h1 class="tp-display-1">Payez le <span style="color: var(--tp-accent)">vrai prix.</span></h1>
  <p class="tp-body">Comparez les prix Canada vs USA…</p>
</body>
```

### In React / Next.js
Use `platform/tailwind.config.snippet.js` — exposes `bg-tp-cyan-500`, `text-tp-navy-700`, `shadow-tp-glow`, etc.

### In Flutter
Use `platform/app_theme.dart` — `truePriceDarkTheme()` / `truePriceLightTheme()`.

---

*TruePriceAI Design System v1.0 — Mai 2026*
