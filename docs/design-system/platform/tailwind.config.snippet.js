// tailwind.config.js — TruePriceAI Brand Integration
// Ajouter ces valeurs dans votre configuration Tailwind existante

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        tp: {
          // Couleurs primaires
          cyan: {
            50:  '#E0FFFE',
            100: '#B3FEFA',
            200: '#80FDF7',
            300: '#4DFFF8',
            400: '#00E5DB',
            500: '#00D4C8', // ★ Primaire
            600: '#00A89E',
            700: '#0D9488', // Version claire
            800: '#007A72',
            900: '#005C56',
          },
          navy: {
            50:  '#E8EDF5',
            100: '#C5D0E3',
            200: '#8A9DBE',
            300: '#4F6A99',
            400: '#1E3A6E',
            500: '#132240',
            600: '#0D2140',
            700: '#0A1628', // ★ Fond dark
            800: '#071020',
            900: '#040A14',
          },
        },
      },
      fontFamily: {
        display: ['"Segoe UI"', 'system-ui', 'sans-serif'],
        mono:    ['"Fira Code"', '"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'tp': '8px',
        'tp-lg': '12px',
        'tp-xl': '16px',
      },
      boxShadow: {
        'tp-glow':  '0 0 20px rgba(0, 212, 200, 0.3)',
        'tp-glow-strong': '0 0 40px rgba(0, 212, 200, 0.5)',
        'tp-card':  '0 4px 12px rgba(0, 0, 0, 0.4)',
      },
    },
  },
};
