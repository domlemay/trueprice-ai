# TruePriceAI — Brand Assets

> Dossier officiel de la marque TruePriceAI — Version 1.0 — Mai 2026

---

## 📁 Structure du dossier

```
trueprice-brand/
├── logo/
│   ├── icon-only.svg              # Icône seule (fond transparent)
│   ├── logo-dark.svg              # Logo complet — fond Navy #0A1628
│   ├── logo-light-white-bg.svg    # Logo complet — fond Blanc #FFFFFF
│   ├── logo-transparent.svg       # Logo complet — fond transparent (dark text)
│   ├── logo-3d.svg                # Logo complet — version 3D avec dégradés
│   ├── text-only-dark.svg         # Texte seul — version sombre
│   ├── text-only-light.svg        # Texte seul — version claire
│   ├── favicon-32.svg             # Favicon 32×32px
│   └── favicon-16.svg             # Favicon 16×16px
│
├── palette/
│   ├── tokens.css                 # Variables CSS complètes (dark + light)
│   ├── tokens.json                # Tokens JSON (cross-platform)
│   ├── tailwind.config.snippet.js # Intégration Tailwind CSS
│   └── app_theme.dart             # Thème Flutter (Material 3)
│
└── docs/
    └── README.md                  # Ce fichier
```

---

## 🎨 Couleurs primaires

| Rôle | Nom | Hex | Usage |
|------|-----|-----|-------|
| **Primaire** | Cyan 500 | `#00D4C8` | Logo, boutons CTA, accents (dark mode) |
| **Primaire claire** | Teal 700 | `#0D9488` | Même usage sur fond blanc (light mode) |
| **Fond sombre** | Navy 700 | `#0A1628` | Background principal dark mode |
| **Fond élevé** | Navy 600 | `#0D2140` | Header, sidebar, cards (dark mode) |
| **Highlight** | Cyan 300 | `#4DFFF8` | Glow effects, hover highlights |
| **Blanc** | White | `#FFFFFF` | Fond light, texte sur primaire |

---

## 🌙 Dark Mode vs ☀️ Light Mode

### Dark Mode (défaut recommandé)
- **Fond** : `#0A1628` (Navy 700)
- **Accent** : `#00D4C8` (Cyan 500)
- **Texte** : `#FFFFFF`
- **Badges AI** : Fond `#00D4C8`, texte `#0A1628`

### Light Mode — Fond blanc
- **Fond** : `#FFFFFF`
- **Accent** : `#0D9488` (Teal 700)
- **Texte** : `#0A1628` (Navy 700)
- **Badges AI** : Fond `#0D9488`, texte `#FFFFFF`

---

## 📐 Utilisation des logos

### ✅ À FAIRE
- Utiliser le logo dark sur fond navy ou sombre
- Utiliser le logo light sur fond blanc ou très clair
- Utiliser le logo transparent sur des fonds dont la couleur est connue
- Garder une zone de sécurité = hauteur du logo × 0.25 de chaque côté

### ❌ À ÉVITER
- Déformer ou étirer le logo
- Changer les couleurs hors de la palette officielle
- Placer le logo sur des fonds qui créent un contraste insuffisant
- Utiliser favicon-16 dans des tailles supérieures à 24px

---

## 🔧 Intégration par plateforme

### Next.js / React (CSS Variables)
```css
/* Importer dans globals.css */
@import './trueprice-brand/palette/tokens.css';

/* Utilisation */
.btn-primary {
  background: var(--tp-accent);
  color: var(--tp-text-inverse);
}
```

### Next.js (Tailwind CSS)
```js
// Copier le contenu de tailwind.config.snippet.js
// dans votre tailwind.config.js existant

// Utilisation dans les composants
<button className="bg-tp-cyan-500 text-tp-navy-700 hover:bg-tp-cyan-600">
  Voir le prix
</button>
```

### Flutter
```dart
// Dans main.dart
import 'trueprice-brand/palette/app_theme.dart';

MaterialApp(
  theme: truePriceLightTheme(),
  darkTheme: truePriceDarkTheme(),
  themeMode: ThemeMode.system,
)

// Utilisation directe
Container(
  color: TrueColors.navy700,
  child: Text('TruePriceAI', style: TextStyle(color: TrueColors.cyan500)),
)
```

### SVG dans HTML (logo)
```html
<!-- Dark mode -->
<img src="./logo/logo-dark.svg" alt="TruePriceAI" height="40"/>

<!-- Light mode -->
<img src="./logo/logo-light-white-bg.svg" alt="TruePriceAI" height="40"/>

<!-- Favicon dans <head> -->
<link rel="icon" type="image/svg+xml" href="./logo/favicon-32.svg" sizes="32x32"/>
<link rel="icon" type="image/svg+xml" href="./logo/favicon-16.svg" sizes="16x16"/>
```

### React Native / Expo
```js
// Utiliser tokens.json directement
import tokens from './trueprice-brand/palette/tokens.json';

const styles = StyleSheet.create({
  container: {
    backgroundColor: tokens.themes.dark.background.base, // #0A1628
  },
  primaryBtn: {
    backgroundColor: tokens.colors.cyan['500'], // #00D4C8
  },
});
```

---

## 📊 Hiérarchie visuelle recommandée

```
1. Logo / Marque
   └── Toujours avec zone de sécurité

2. Titres principaux
   └── Font-weight: 700 | Color: --tp-text-primary

3. Accents & CTA
   └── Color: --tp-accent (#00D4C8 dark / #0D9488 light)

4. Corps de texte
   └── Font-weight: 400 | Color: --tp-text-secondary

5. Métadonnées & labels
   └── Font-weight: 400 | Color: --tp-text-muted | Uppercase + letter-spacing
```

---

## 🔄 Changelog

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | Mai 2026 | Version initiale — tous les assets |

---

*TruePriceAI Brand Assets — Dominic Lemay — 2026*
