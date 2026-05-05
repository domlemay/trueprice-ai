"use client";

import { useState } from "react";
import { Check, Loader2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const COUNTRIES = [
  { code: "CA", label: "Canada",          flag: "🇨🇦", currency: "CAD", locale: "fr-CA", tz: "America/Toronto"  },
  { code: "US", label: "États-Unis",      flag: "🇺🇸", currency: "USD", locale: "en-US", tz: "America/New_York" },
  { code: "FR", label: "France",          flag: "🇫🇷", currency: "EUR", locale: "fr-FR", tz: "Europe/Paris"     },
  { code: "DE", label: "Allemagne",       flag: "🇩🇪", currency: "EUR", locale: "de-DE", tz: "Europe/Berlin"    },
  { code: "GB", label: "Royaume-Uni",     flag: "🇬🇧", currency: "GBP", locale: "en-GB", tz: "Europe/London"    },
];

const CURRENCIES = [
  { code: "CAD", label: "Dollar canadien",    symbol: "$" },
  { code: "USD", label: "Dollar américain",   symbol: "$" },
  { code: "EUR", label: "Euro",               symbol: "€" },
  { code: "GBP", label: "Livre sterling",     symbol: "£" },
];

const LOCALES = [
  { code: "fr-CA", label: "Français (Canada)"     },
  { code: "en-CA", label: "English (Canada)"       },
  { code: "en-US", label: "English (United States)"},
  { code: "fr-FR", label: "Français (France)"      },
  { code: "de-DE", label: "Deutsch (Deutschland)"  },
  { code: "en-GB", label: "English (United Kingdom)"},
];

const TIMEZONES = [
  { code: "America/Vancouver",  label: "Pacifique (Vancouver)"  },
  { code: "America/Edmonton",   label: "Montagne (Edmonton)"    },
  { code: "America/Winnipeg",   label: "Centre (Winnipeg)"      },
  { code: "America/Toronto",    label: "Est (Toronto / Montréal)"},
  { code: "America/Halifax",    label: "Atlantique (Halifax)"   },
  { code: "America/St_Johns",   label: "Terre-Neuve (St. John's)"},
  { code: "America/New_York",   label: "Eastern (New York)"     },
  { code: "America/Chicago",    label: "Central (Chicago)"      },
  { code: "America/Denver",     label: "Mountain (Denver)"      },
  { code: "America/Los_Angeles",label: "Pacific (Los Angeles)"  },
  { code: "Europe/Paris",       label: "Paris"                  },
  { code: "Europe/Berlin",      label: "Berlin"                 },
  { code: "Europe/London",      label: "Londres"                },
];

export function LocalisationClient({
  initialCurrency,
  initialLocale,
  initialTimezone,
}: {
  initialCurrency: string;
  initialLocale:   string;
  initialTimezone: string;
}) {
  const [currency, setCurrency] = useState(initialCurrency);
  const [locale,   setLocale]   = useState(initialLocale);
  const [timezone, setTimezone] = useState(initialTimezone);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  function applyCountryDefaults(code: string) {
    const c = COUNTRIES.find((x) => x.code === code);
    if (!c) return;
    setCurrency(c.currency);
    setLocale(c.locale);
    setTimezone(c.tz);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/profile/location", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ preferredCurrency: currency, preferredLocale: locale, timezone }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Erreur lors de la sauvegarde.");
        return;
      }
      setSaved(true);
      // Mettre à jour le cookie tp_market pour refléter les préférences
      document.cookie = `tp_market=${JSON.stringify({ currency, locale, timezone })}; path=/; max-age=86400; samesite=lax`;
      setTimeout(() => setSaved(false), 3_000);
    } finally {
      setSaving(false);
    }
  }

  const isDirty =
    currency !== initialCurrency ||
    locale   !== initialLocale   ||
    timezone !== initialTimezone;

  return (
    <div className="space-y-6">
      {/* Raccourcis pays */}
      <div className="rounded-xl border border-tp-cyan-500/15 bg-tp-navy-card p-5">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">Appliquer les valeurs par défaut d&apos;un pays</p>
        <div className="flex flex-wrap gap-2">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              onClick={() => applyCountryDefaults(c.code)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-tp-cyan-500/20 bg-tp-navy-700/50 text-sm text-slate-300 hover:text-white hover:border-tp-cyan-500/40 hover:bg-tp-cyan-500/5 transition-colors"
            >
              <span>{c.flag}</span>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Devise */}
      <div className="rounded-xl border border-tp-cyan-500/15 bg-tp-navy-card p-5">
        <label className="block text-sm font-medium text-white mb-3">Devise préférée</label>
        <div className="grid grid-cols-2 gap-2">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => setCurrency(c.code)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm text-left transition-colors",
                currency === c.code
                  ? "border-tp-cyan-500/50 bg-tp-cyan-500/10 text-white"
                  : "border-tp-cyan-500/15 text-slate-400 hover:text-white hover:border-tp-cyan-500/30",
              )}
            >
              <span className="w-6 h-6 rounded-full bg-tp-navy-700 flex items-center justify-center text-xs font-bold text-tp-cyan-500 shrink-0">
                {c.symbol}
              </span>
              <div>
                <p className="font-medium">{c.code}</p>
                <p className="text-[11px] text-slate-500">{c.label}</p>
              </div>
              {currency === c.code && <Check size={13} className="text-tp-cyan-500 ml-auto" />}
            </button>
          ))}
        </div>
      </div>

      {/* Langue */}
      <div className="rounded-xl border border-tp-cyan-500/15 bg-tp-navy-card p-5">
        <label className="block text-sm font-medium text-white mb-3">Langue d&apos;affichage</label>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
          className="w-full bg-tp-navy-700/60 border border-tp-cyan-500/20 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-tp-cyan-500/50 transition-colors"
        >
          {LOCALES.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
      </div>

      {/* Fuseau horaire */}
      <div className="rounded-xl border border-tp-cyan-500/15 bg-tp-navy-card p-5">
        <label className="block text-sm font-medium text-white mb-3">Fuseau horaire</label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full bg-tp-navy-700/60 border border-tp-cyan-500/20 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-tp-cyan-500/50 transition-colors"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz.code} value={tz.code}>{tz.label}</option>
          ))}
        </select>
        <p className="mt-2 text-[11px] text-slate-600">
          Utilisé pour les heures d&apos;envoi des rapports et alertes.
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving || !isDirty}
        className="flex items-center gap-2 bg-tp-cyan-500 text-tp-navy-700 font-semibold text-sm px-6 py-2.5 rounded-xl hover:-translate-y-0.5 hover:shadow-tp-glow transition-all disabled:opacity-60 disabled:translate-y-0"
      >
        {saving ? (
          <Loader2 size={15} className="animate-spin" />
        ) : saved ? (
          <Check size={15} />
        ) : (
          <Globe size={15} strokeWidth={1.75} />
        )}
        {saved ? "Sauvegardé" : "Enregistrer les préférences"}
      </button>
    </div>
  );
}
