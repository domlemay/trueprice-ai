"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  User,
  MapPin,
  Bell,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Check,
  Building2,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const COUNTRIES = [
  { code: "CA", label: "🇨🇦 Canada", currency: "CAD", locale: "fr-CA", timezone: "America/Toronto" },
  { code: "US", label: "🇺🇸 États-Unis", currency: "USD", locale: "en-US", timezone: "America/New_York" },
  { code: "FR", label: "🇫🇷 France",     currency: "EUR", locale: "fr-FR", timezone: "Europe/Paris" },
  { code: "BE", label: "🇧🇪 Belgique",   currency: "EUR", locale: "fr-BE", timezone: "Europe/Brussels" },
  { code: "CH", label: "🇨🇭 Suisse",     currency: "CHF", locale: "fr-CH", timezone: "Europe/Zurich" },
];

const CA_PROVINCES = [
  { code: "AB", label: "Alberta" },
  { code: "BC", label: "Colombie-Britannique" },
  { code: "MB", label: "Manitoba" },
  { code: "NB", label: "Nouveau-Brunswick" },
  { code: "NL", label: "Terre-Neuve-et-Labrador" },
  { code: "NS", label: "Nouvelle-Écosse" },
  { code: "NT", label: "Territoires du Nord-Ouest" },
  { code: "NU", label: "Nunavut" },
  { code: "ON", label: "Ontario" },
  { code: "PE", label: "Île-du-Prince-Édouard" },
  { code: "QC", label: "Québec" },
  { code: "SK", label: "Saskatchewan" },
  { code: "YT", label: "Yukon" },
];

const US_STATES = [
  { code: "CA", label: "California" }, { code: "NY", label: "New York" },
  { code: "TX", label: "Texas" },      { code: "FL", label: "Florida" },
  { code: "WA", label: "Washington" }, { code: "IL", label: "Illinois" },
  { code: "OR", label: "Oregon" },     { code: "MA", label: "Massachusetts" },
  { code: "OH", label: "Ohio" },       { code: "AZ", label: "Arizona" },
];

const STEPS = [
  { id: 1, label: "Pays & devise",    icon: Globe },
  { id: 2, label: "Profil",           icon: User },
  { id: 3, label: "Adresse",          icon: MapPin },
  { id: 4, label: "Notifications",    icon: Bell },
  { id: 5, label: "Consentements",    icon: ShieldCheck },
];

// ─── State types ──────────────────────────────────────────────────────────────

type FormState = {
  // Step 1
  country: string;
  currency: string;
  locale: string;
  timezone: string;
  // Step 2
  profileType: "individual" | "business";
  // Step 3
  skipAddress: boolean;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  // Step 4
  notifications: {
    price_alert_email: boolean;
    price_alert_inapp: boolean;
    stock_alert_email: boolean;
    report_weekly_email: boolean;
    changelog_inapp: boolean;
  };
  // Step 5
  consentAnalytics: boolean;
  consentMarketing: boolean;
};

const DEFAULT_STATE: FormState = {
  country: "CA",
  currency: "CAD",
  locale: "fr-CA",
  timezone: "America/Toronto",
  profileType: "individual",
  skipAddress: false,
  address: { street: "", city: "", province: "QC", postalCode: "", country: "CA" },
  notifications: {
    price_alert_email:  true,
    price_alert_inapp:  true,
    stock_alert_email:  true,
    report_weekly_email: true,
    changelog_inapp:    true,
  },
  consentAnalytics: true,
  consentMarketing: false,
};

// ─── Component ────────────────────────────────────────────────────────────────

export function OnboardingClient({ resumeStep }: { resumeStep: number }) {
  const router = useRouter();
  const [step, setStep] = useState(Math.max(1, Math.min(resumeStep + 1, 1)));
  const [form, setForm] = useState<FormState>(DEFAULT_STATE);
  const [pending, startTransition] = useTransition();

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setAddress(field: keyof FormState["address"], value: string) {
    setForm((prev) => ({ ...prev, address: { ...prev.address, [field]: value } }));
  }

  function setNotif(key: keyof FormState["notifications"], value: boolean) {
    setForm((prev) => ({ ...prev, notifications: { ...prev.notifications, [key]: value } }));
  }

  function next() {
    setStep((s) => Math.min(s + 1, STEPS.length));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 1));
  }

  function handleCountryChange(code: string) {
    const c = COUNTRIES.find((x) => x.code === code);
    if (!c) return;
    setForm((prev) => ({
      ...prev,
      country:  c.code,
      currency: c.currency,
      locale:   c.locale,
      timezone: c.timezone,
      address:  { ...prev.address, country: c.code, province: "" },
    }));
  }

  function handleSubmit() {
    startTransition(async () => {
      const payload = {
        preferredCurrency: form.currency,
        preferredLocale:   form.locale,
        timezone:          form.timezone,
        address: form.skipAddress ? undefined : {
          street:     form.address.street,
          city:       form.address.city,
          province:   form.address.province,
          postalCode: form.address.postalCode,
          country:    form.address.country,
        },
        notifications: form.notifications,
        consentAnalytics: form.consentAnalytics,
        consentMarketing: form.consentMarketing,
      };

      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        alert("Une erreur est survenue. Réessayez.");
      }
    });
  }

  const provinces = form.country === "US" ? US_STATES : CA_PROVINCES;

  return (
    <div className="w-full max-w-lg">
      {/* Logo */}
      <div className="text-center mb-8">
        <span className="font-display text-2xl font-bold text-white">TruePriceAI</span>
        <p className="text-slate-400 text-sm mt-1">Configurons votre espace en quelques étapes.</p>
      </div>

      {/* Barre de progression */}
      <div className="flex items-center justify-between mb-8 px-2">
        {STEPS.map((s, i) => {
          const done = step > s.id;
          const active = step === s.id;
          const Icon = s.icon;
          return (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    done
                      ? "bg-tp-cyan-500 text-tp-navy-700"
                      : active
                      ? "border-2 border-tp-cyan-500 text-tp-cyan-500"
                      : "border border-slate-700 text-slate-600"
                  }`}
                >
                  {done ? <Check size={16} strokeWidth={2.5} /> : <Icon size={15} strokeWidth={1.75} />}
                </div>
                <span className={`text-[10px] uppercase tracking-wider ${active ? "text-tp-cyan-500" : done ? "text-slate-400" : "text-slate-600"}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-8 mx-1 mb-4 transition-colors ${step > s.id ? "bg-tp-cyan-500/60" : "bg-slate-700"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Card */}
      <div className="bg-tp-navy-card border border-tp-cyan-500/15 rounded-2xl p-8">

        {/* ── Étape 1 — Pays & devise ─────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <h2 className="font-display text-xl font-bold text-white mb-1">Pays & devise</h2>
            <p className="text-slate-400 text-sm mb-6">
              Sélectionnez votre pays de résidence. La devise et la langue s'ajustent automatiquement.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Pays</label>
                <div className="grid grid-cols-1 gap-2">
                  {COUNTRIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => handleCountryChange(c.code)}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-colors ${
                        form.country === c.code
                          ? "border-tp-cyan-500/50 bg-tp-cyan-500/10 text-white"
                          : "border-slate-700 text-slate-300 hover:border-slate-600"
                      }`}
                    >
                      <span>{c.label}</span>
                      {form.country === c.code && <Check size={15} className="text-tp-cyan-500" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-lg border border-slate-700 bg-tp-navy-600/30 px-4 py-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Devise</p>
                  <p className="text-white font-mono font-semibold">{form.currency}</p>
                </div>
                <div className="rounded-lg border border-slate-700 bg-tp-navy-600/30 px-4 py-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Langue</p>
                  <p className="text-white font-mono font-semibold">{form.locale}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Étape 2 — Profil ────────────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <h2 className="font-display text-xl font-bold text-white mb-1">Profil d'usage</h2>
            <p className="text-slate-400 text-sm mb-6">
              Comment comptez-vous utiliser TruePriceAI ?
            </p>

            <div className="grid grid-cols-1 gap-3">
              {([
                {
                  value: "individual" as const,
                  icon: User,
                  label: "Particulier",
                  desc: "Je compare des prix pour mes achats personnels.",
                },
                {
                  value: "business" as const,
                  icon: Building2,
                  label: "Entreprise",
                  desc: "Je gère des achats pour une équipe ou une organisation.",
                },
              ] as const).map(({ value, icon: Icon, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setField("profileType", value)}
                  className={`flex items-start gap-4 px-5 py-4 rounded-xl border text-left transition-colors ${
                    form.profileType === value
                      ? "border-tp-cyan-500/50 bg-tp-cyan-500/10"
                      : "border-slate-700 hover:border-slate-600"
                  }`}
                >
                  <div className={`mt-0.5 p-2 rounded-lg ${form.profileType === value ? "bg-tp-cyan-500/20" : "bg-slate-800"}`}>
                    <Icon size={18} className={form.profileType === value ? "text-tp-cyan-500" : "text-slate-500"} strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{label}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
                  </div>
                  {form.profileType === value && (
                    <Check size={16} className="text-tp-cyan-500 ml-auto mt-0.5 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {form.profileType === "business" && (
              <p className="mt-4 text-xs text-tp-cyan-500/80 bg-tp-cyan-500/5 border border-tp-cyan-500/15 rounded-lg px-4 py-3">
                Vous pourrez créer votre organisation et inviter votre équipe depuis le tableau de bord après l'onboarding.
              </p>
            )}
          </div>
        )}

        {/* ── Étape 3 — Adresse ───────────────────────────────────────────── */}
        {step === 3 && (
          <div>
            <h2 className="font-display text-xl font-bold text-white mb-1">Adresse de livraison</h2>
            <p className="text-slate-400 text-sm mb-6">
              Optionnelle, mais nécessaire pour calculer les taxes exactes sur vos comparaisons.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Rue</label>
                <input
                  type="text"
                  placeholder="123, rue Principale"
                  value={form.address.street}
                  onChange={(e) => setAddress("street", e.target.value)}
                  disabled={form.skipAddress}
                  className="w-full bg-tp-navy-600/40 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-tp-cyan-500/50 disabled:opacity-40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Ville</label>
                  <input
                    type="text"
                    placeholder="Montréal"
                    value={form.address.city}
                    onChange={(e) => setAddress("city", e.target.value)}
                    disabled={form.skipAddress}
                    className="w-full bg-tp-navy-600/40 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-tp-cyan-500/50 disabled:opacity-40"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">
                    {form.country === "US" ? "État" : "Province"}
                  </label>
                  <select
                    value={form.address.province}
                    onChange={(e) => setAddress("province", e.target.value)}
                    disabled={form.skipAddress}
                    className="w-full bg-tp-navy-600/40 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-tp-cyan-500/50 disabled:opacity-40"
                  >
                    <option value="">—</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.code}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Code postal</label>
                <input
                  type="text"
                  placeholder={form.country === "US" ? "10001" : "H2X 1Y4"}
                  value={form.address.postalCode}
                  onChange={(e) => setAddress("postalCode", e.target.value)}
                  disabled={form.skipAddress}
                  className="w-full bg-tp-navy-600/40 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-tp-cyan-500/50 disabled:opacity-40"
                />
              </div>
            </div>

            <button
              onClick={() => setField("skipAddress", !form.skipAddress)}
              className="mt-4 flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${form.skipAddress ? "bg-tp-cyan-500/20 border-tp-cyan-500/50" : "border-slate-600"}`}>
                {form.skipAddress && <Check size={10} className="text-tp-cyan-500" strokeWidth={3} />}
              </div>
              Passer cette étape — je renseignerai mon adresse plus tard
            </button>
          </div>
        )}

        {/* ── Étape 4 — Notifications ─────────────────────────────────────── */}
        {step === 4 && (
          <div>
            <h2 className="font-display text-xl font-bold text-white mb-1">Notifications</h2>
            <p className="text-slate-400 text-sm mb-6">
              Choisissez comment vous souhaitez être informé.
            </p>

            <div className="space-y-3">
              {([
                { key: "price_alert_email",   label: "Alertes de prix", sub: "Par courriel", channel: "EMAIL" },
                { key: "price_alert_inapp",   label: "Alertes de prix", sub: "Dans l'application", channel: "IN_APP" },
                { key: "stock_alert_email",   label: "Alertes de stock", sub: "Par courriel", channel: "EMAIL" },
                { key: "report_weekly_email", label: "Rapport hebdomadaire", sub: "Par courriel", channel: "EMAIL" },
                { key: "changelog_inapp",     label: "Nouveautés", sub: "Dans l'application", channel: "IN_APP" },
              ] as const).map(({ key, label, sub }) => (
                <div
                  key={key}
                  className="flex items-center justify-between px-4 py-3 rounded-lg border border-slate-700 bg-tp-navy-600/20"
                >
                  <div>
                    <p className="text-sm text-white">{label}</p>
                    <p className="text-xs text-slate-500">{sub}</p>
                  </div>
                  <button
                    onClick={() => setNotif(key, !form.notifications[key])}
                    className={`relative w-10 h-5.5 h-[22px] rounded-full transition-colors ${
                      form.notifications[key] ? "bg-tp-cyan-500" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform ${
                        form.notifications[key] ? "translate-x-[18px]" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Étape 5 — Consentements ─────────────────────────────────────── */}
        {step === 5 && (
          <div>
            <h2 className="font-display text-xl font-bold text-white mb-1">Confidentialité</h2>
            <p className="text-slate-400 text-sm mb-6">
              Conformément à la Loi 25 (Québec) et au RGPD. Vous pouvez modifier vos choix à tout moment.
            </p>

            <div className="space-y-3 mb-6">
              {([
                {
                  key: "consentAnalytics" as const,
                  label: "Analytique",
                  desc: "Nous permet d'améliorer TruePriceAI en analysant l'usage anonymisé de la plateforme.",
                },
                {
                  key: "consentMarketing" as const,
                  label: "Marketing",
                  desc: "Recevoir des offres personnalisées, actualités et conseils sur TruePriceAI.",
                },
              ]).map(({ key, label, desc }) => (
                <div
                  key={key}
                  className={`flex items-start gap-4 px-4 py-4 rounded-xl border transition-colors cursor-pointer ${
                    form[key] ? "border-tp-cyan-500/35 bg-tp-cyan-500/5" : "border-slate-700"
                  }`}
                  onClick={() => setField(key, !form[key])}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    form[key] ? "border-tp-cyan-500 bg-tp-cyan-500/20" : "border-slate-600"
                  }`}>
                    {form[key] && <Check size={11} className="text-tp-cyan-500" strokeWidth={3} />}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{label}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-600">
              En terminant, vous acceptez nos{" "}
              <a href="/legal/terms" className="text-tp-cyan-500/70 hover:text-tp-cyan-500 underline">
                Conditions d'utilisation
              </a>{" "}
              et notre{" "}
              <a href="/legal/privacy" className="text-tp-cyan-500/70 hover:text-tp-cyan-500 underline">
                Politique de confidentialité
              </a>{" "}
              (v1.0.0).
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
          <button
            onClick={back}
            disabled={step === 1}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors disabled:opacity-0"
          >
            <ChevronLeft size={16} />
            Retour
          </button>

          {step < STEPS.length ? (
            <button
              onClick={next}
              className="flex items-center gap-1.5 bg-tp-cyan-500 text-tp-navy-700 font-semibold text-sm px-5 py-2.5 rounded-lg hover:-translate-y-0.5 hover:shadow-tp-glow transition-all"
            >
              Continuer
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={pending}
              className="flex items-center gap-2 bg-tp-cyan-500 text-tp-navy-700 font-semibold text-sm px-5 py-2.5 rounded-lg hover:-translate-y-0.5 hover:shadow-tp-glow transition-all disabled:opacity-70 disabled:translate-y-0"
            >
              {pending ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Enregistrement…
                </>
              ) : (
                <>
                  Terminer la configuration
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
