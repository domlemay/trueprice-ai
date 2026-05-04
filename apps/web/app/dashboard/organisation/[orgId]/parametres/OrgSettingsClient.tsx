"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Check } from "lucide-react";

type OrgData = {
  id: string; name: string; website: string | null; slug: string;
  defaultCurrency: string; defaultLocale: string; defaultTimezone: string;
  referenceCurrency: string; historyRetentionDays: number;
  allowResultSharing: boolean; allowExternalSharing: boolean; enforce2FA: boolean;
};

export function OrgSettingsClient({ orgId, org }: { orgId: string; org: OrgData }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name:                org.name,
    website:             org.website ?? "",
    defaultCurrency:     org.defaultCurrency,
    defaultTimezone:     org.defaultTimezone,
    historyRetentionDays: org.historyRetentionDays,
    allowResultSharing:  org.allowResultSharing,
    allowExternalSharing: org.allowExternalSharing,
    enforce2FA:          org.enforce2FA,
  });
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  function handleSave() {
    start(async () => {
      const res = await fetch(`/api/org/${orgId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        router.refresh();
      }
    });
  }

  return (
    <div className="max-w-xl space-y-6">
      {/* Infos générales */}
      <div className="bg-tp-navy-card border border-tp-cyan-500/15 rounded-xl p-6 space-y-4">
        <h3 className="text-white font-semibold text-sm">Informations générales</h3>
        {[
          { key: "name", label: "Nom", type: "text", placeholder: "Acme Inc." },
          { key: "website", label: "Site web", type: "url", placeholder: "https://acme.com" },
        ].map(({ key, label, type, placeholder }) => (
          <div key={key}>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">{label}</label>
            <input
              type={type} value={(form as Record<string, string | number | boolean>)[key] as string}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              placeholder={placeholder}
              className="w-full bg-tp-navy-600/40 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-tp-cyan-500/50"
            />
          </div>
        ))}
        <div>
          <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Slug (URL)</label>
          <p className="text-sm text-slate-500 font-mono bg-tp-navy-600/30 rounded-lg px-4 py-2.5 border border-slate-800">{org.slug}</p>
        </div>
      </div>

      {/* Paramètres data */}
      <div className="bg-tp-navy-card border border-tp-cyan-500/15 rounded-xl p-6 space-y-4">
        <h3 className="text-white font-semibold text-sm">Données & partage</h3>
        <div>
          <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">
            Rétention de l'historique (jours)
          </label>
          <input
            type="number" min={30} max={3650} value={form.historyRetentionDays}
            onChange={(e) => setForm((f) => ({ ...f, historyRetentionDays: parseInt(e.target.value) || 730 }))}
            className="w-full bg-tp-navy-600/40 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-tp-cyan-500/50"
          />
        </div>
        {([
          { key: "allowResultSharing",  label: "Partage des résultats entre membres" },
          { key: "allowExternalSharing", label: "Partage externe (hors organisation)" },
          { key: "enforce2FA",           label: "Exiger l'authentification à deux facteurs" },
        ] as const).map(({ key, label }) => (
          <label key={key} className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-slate-300">{label}</span>
            <button
              onClick={() => setForm((f) => ({ ...f, [key]: !f[key] }))}
              className={`relative w-10 h-[22px] rounded-full transition-colors ${form[key] ? "bg-tp-cyan-500" : "bg-slate-700"}`}
            >
              <span className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform ${form[key] ? "translate-x-[18px]" : "translate-x-0.5"}`} />
            </button>
          </label>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={pending}
        className="flex items-center gap-2 bg-tp-cyan-500 text-tp-navy-700 font-semibold text-sm px-5 py-2.5 rounded-lg hover:-translate-y-0.5 hover:shadow-tp-glow transition-all disabled:opacity-60 disabled:translate-y-0"
      >
        {pending ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <Save size={15} />}
        {saved ? "Enregistré !" : "Enregistrer"}
      </button>
    </div>
  );
}
