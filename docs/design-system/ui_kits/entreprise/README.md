# Entreprise App UI Kit

The B2B workspace — competitive intelligence (Compétition) and procurement comparison (Procurement) in one shell.

## Screens
1. **Dashboard** — 4 KPI cards (tracked products · active alerts · detected savings · market position), 90-day price evolution chart with 3 series (mine · CA competitors · US market real-CAD), tracked products mini-table with position badges + sparklines, team activity feed.
2. **Veille concurrentielle** — category tabs, side-by-side competitor matrix, position pills (1er CA / 2e CA / 4e CA), CSV export.
3. **Importer une liste (Procurement)** — drag-drop upload, file preview with match stats (✓ trouvé / ⚠ partiel / ✗ non trouvé), AI optimal-purchase plan card splitting the order across 3 suppliers with savings vs single-source baseline.

## Layout
- 240px sidebar with **Org switcher** + **Mode toggle** (Compétition / Procurement) + section nav
- 64px topbar with breadcrumbs + plan badge + actions
- Content max-width 1400px

## Components
`org-card` · `mode-toggle` · `kpi` w/ icon · custom SVG chart · `pos-badge` · `match-pill` · `upload-zone` · `preview-stats` · `ai-plan` (the cyan-glow recommendation card)

## Source
Patterns inspired by `app/(enterprise)/*` routes in trueprice-ai. Recharts visuals replaced by hand-rolled SVG since this is a static demo. Real implementation should use Recharts per the brief.

Open `index.html`. Click sidebar items to switch panes; the mode toggle is purely visual.
