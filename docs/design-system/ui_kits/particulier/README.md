# Particulier App UI Kit

The authenticated B2C app for individual shoppers. Two demo screens + a modal in one HTML, click-thru:

## Screens
1. **Dashboard** (`#pane-dashboard`) — greeting + saving headline, big search hero, KPI row (live exchange rate w/ sparkline · monthly savings · active alerts), recent searches list, alerts strip with progress bars.
2. **Search Results** (`#pane-results`) — product head card, filter chips + sort, comparison table with **best-row highlight + "Meilleur prix" badge**, store logos, real-CAD column in cyan, savings column in success green, expand-row info button.
3. **Cost Breakdown Modal** — line-by-line breakdown (converted USD · douane · courtage · livraison · TPS+TVQ), ACÉUM exemption note, total in cyan, smart recommendation when Canada actually wins.

## Layout
- 240px sidebar (Particulier section + upgrade card) · 64px topbar (search · plan badge · alert bell · avatar)
- Content centered, max-width 1280px

## Components
`sidebar` · `topbar` · `dash-hero` · `widget` (KPI) · `recent-list` · `alert-row` w/ progress · `product-head` · `filter-bar` chips · `cmp` table (best-row, store-logo, real-price) · `breakdown-line` · `total-line`

## Source
Patterns lifted from `app/(dashboard)` routes in the trueprice-ai repo. Layout adapted to v1.0 cyan/navy spec.

Open `index.html`. Click "Comparer" or any recent search to jump to results; click the ℹ icon on a row to open the breakdown modal.
