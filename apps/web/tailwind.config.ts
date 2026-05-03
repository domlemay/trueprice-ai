import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // ─── TruePriceAI v1.0 (mai 2026) — palette officielle ───
        tp: {
          cyan: {
            50:  "#E0FFFE",
            100: "#B3FEFA",
            200: "#80FDF7",
            300: "#4DFFF8",
            400: "#00E5DB",
            500: "#00D4C8", // ★ primary (dark mode)
            600: "#00A89E",
            700: "#0D9488", // ★ primary (light mode)
            800: "#007A72",
            900: "#005C56",
          },
          navy: {
            50:  "#E8EDF5",
            100: "#C5D0E3",
            200: "#8A9DBE",
            300: "#4F6A99",
            400: "#1E3A6E",
            500: "#132240",
            600: "#0D2140", // header / sidebar
            700: "#0A1628", // ★ background base
            800: "#071020",
            900: "#040A14",
          },
          surface: "#0F1E36",
          card:    "#112040",
          input:   "#0D1E38",
          success: "#2D9E5F",
          warning: "#F5A623",
          error:   "#E53935",
          info:    "#1976D2",
        },
        // ─── Legacy (à supprimer une fois la migration complète) ───
        // Les composants `brand.*` ne doivent plus être utilisés.
        // Conservés temporairement pour ne pas casser l'app pendant la migration.
        brand: {
          red:        "#00D4C8", // ⚠ remappé sur cyan — préférer tp.cyan.500
          navy:       "#0A1628",
          "red-dark":  "#00A89E",
          "red-light": "#4DFFF8",
          "navy-light":"#0D2140",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      fontFamily: {
        display: ['"Syne"', '"DM Sans"', "system-ui", "sans-serif"],
        sans:    ['"DM Sans"', "system-ui", "-apple-system", "sans-serif"],
        mono:    ['"JetBrains Mono"', '"Fira Code"', "Consolas", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "tp-md":          "0 4px 12px rgba(0, 0, 0, 0.40)",
        "tp-lg":          "0 8px 24px rgba(0, 0, 0, 0.50)",
        "tp-glow":        "0 0 20px rgba(0, 212, 200, 0.30)",
        "tp-glow-strong": "0 0 40px rgba(0, 212, 200, 0.50)",
        "tp-focus":       "0 0 0 3px rgba(0, 212, 200, 0.15)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 212, 200, 0.3)" },
          "50%":      { boxShadow: "0 0 32px rgba(0, 212, 200, 0.5)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        shimmer:          "shimmer 2s linear infinite",
        float:            "float 3s ease-in-out infinite",
        "glow-pulse":     "glow-pulse 2.5s ease-in-out infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-pattern":
          "linear-gradient(135deg, #0A1628 0%, #071020 50%, #0A1628 100%)",
      },
      transitionTimingFunction: {
        "tp-out": "cubic-bezier(0.16, 1, 0.3, 1)",
        "tp-in":  "cubic-bezier(0.7, 0, 0.84, 0)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
