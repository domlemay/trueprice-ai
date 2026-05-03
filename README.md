# TruePriceAI — Design System v1.0 Handoff

**Date:** Mai 2026
**Branche cible:** `feat/design-system-v1`
**Repo:** `domlemay/trueprice-ai`

---

## Pourquoi ce handoff ?

Le brief de marque v1.0 (mai 2026) a établi une **nouvelle palette officielle** : cyan `#00D4C8` + navy `#0A1628`. Le codebase actuel utilise encore l'ancienne palette rouge `#D91F26`. Ce handoff :

1. Apporte le **système de design complet** dans `docs/design-system/`
2. Met à jour `tailwind.config.ts` et `app/globals.css` à la nouvelle palette
3. **Migre les composants existants** (`Hero`, `Navbar`, `Pricing`) à la nouvelle identité
4. Ajoute un `CLAUDE.md` à la racine pour que Claude Code connaisse les règles à chaque session

## Comment appliquer

```bash
# 1. Cloner ton repo si pas déjà fait
git clone https://github.com/domlemay/trueprice-ai.git
cd trueprice-ai
git checkout -b feat/design-system-v1

# 2. Décompresser ce handoff à la racine du repo
unzip ~/Downloads/handoff.zip -d ./

# 3. Réinstaller les deps (au cas où, rien de nouveau requis)
npm install

# 4. Vérifier en local
npm run dev
# → ouvrir http://localhost:3000

# 5. Commit + PR
git add .
git commit -m "feat: design system v1.0 — migration vers cyan/navy"
git push origin feat/design-system-v1
```

## Ce qui est dans le bundle

```
handoff/
├── README.md                            ← ce fichier
├── CLAUDE.md                            → racine du repo
├── tailwind.config.ts                   → racine — REMPLACE l'existant
├── app/
│   └── globals.css                      → REMPLACE l'existant
├── components/
│   ├── ui/
│   │   └── button.tsx                   → REMPLACE — variants mis à jour
│   └── landing/
│       ├── Hero.tsx                     → REMPLACE
│       ├── Navbar.tsx                   → REMPLACE
│       └── Pricing.tsx                  → REMPLACE
├── docs/
│   └── design-system/                   → NOUVEAU dossier
│       ├── README.md                    (foundations complètes)
│       ├── SKILL.md                     (manifeste pour Claude Code)
│       ├── colors_and_type.css
│       ├── tokens.json
│       ├── assets/                      (logos SVG)
│       ├── platform/                    (Flutter + Tailwind drop-ins)
│       ├── preview/                     (cartes design system)
│       └── ui_kits/                     (marketing / particulier / entreprise)
└── MIGRATION.md                         ← détail des changements
```

## Mapping des couleurs (legacy → v1.0)

| Avant | Après | Usage |
|---|---|---|
| `brand-red` `#D91F26` | `tp-cyan-500` `#00D4C8` | CTA principal, accents |
| `brand-red-dark` `#B01920` | `tp-cyan-600` `#00A89E` | Hover CTA |
| `brand-red-light` `#F5383F` | `tp-cyan-300` `#4DFFF8` | Highlight / glow |
| `brand-navy` `#1B2A4A` | `tp-navy-700` `#0A1628` | Background dark |
| `brand-navy-light` `#243761` | `tp-navy-600` `#0D2140` | Header / sidebar |

## ⚠️ Notes importantes

- **Le rouge disparaît du chrome.** Il ne reste qu'avec les drapeaux 🇺🇸 (emoji natif) et l'erreur sémantique.
- **Texte CTA :** sur cyan, le texte devient **navy** (pas blanc) — meilleur contraste.
- **Glow signature :** les CTA primary obtiennent maintenant `shadow-tp-glow` au hover, pas `shadow-brand-red/30`.
- Les fonts passent de Segoe UI à **DM Sans / Syne / JetBrains Mono** — chargées via Google Fonts dans `layout.tsx` (à ajouter, voir MIGRATION.md).

## Pour Claude Code (et sessions futures)

Le fichier `CLAUDE.md` à la racine sera lu automatiquement à chaque session. Il pointe vers `docs/design-system/SKILL.md` pour les règles complètes. Aucune action manuelle requise — Claude Code saura à partir de la prochaine ouverture du repo.
