"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";

const PREFS = [
  { type: "price_alert",   channel: "EMAIL",  label: "Alertes de prix",       sub: "Par courriel" },
  { type: "price_alert",   channel: "IN_APP", label: "Alertes de prix",       sub: "Dans l'application" },
  { type: "stock_alert",   channel: "EMAIL",  label: "Alertes de stock",      sub: "Par courriel" },
  { type: "report_weekly", channel: "EMAIL",  label: "Rapport hebdomadaire",  sub: "Par courriel" },
  { type: "changelog",     channel: "IN_APP", label: "Nouveautés",            sub: "Dans l'application" },
] as const;

export function NotificationsClient({ userId, prefMap }: {
  userId: string;
  prefMap: Record<string, boolean>;
}) {
  const [prefs, setPrefs] = useState(prefMap);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  function toggle(key: string) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  function save() {
    start(async () => {
      const updates = PREFS.map(({ type, channel }) => ({
        type, channel, enabled: prefs[`${type}:${channel}`] ?? false,
      }));
      await fetch("/api/profile/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="space-y-5">
      <div className="bg-tp-navy-card border border-tp-cyan-500/15 rounded-xl divide-y divide-slate-800">
        {PREFS.map(({ type, channel, label, sub }) => {
          const key = `${type}:${channel}`;
          return (
            <div key={key} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-white text-sm">{label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{sub}</p>
              </div>
              <button
                onClick={() => toggle(key)}
                className={`relative w-10 h-[22px] rounded-full transition-colors ${prefs[key] ? "bg-tp-cyan-500" : "bg-slate-700"}`}
              >
                <span className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform ${prefs[key] ? "translate-x-[18px]" : "translate-x-0.5"}`} />
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={save}
        disabled={pending}
        className="flex items-center gap-2 bg-tp-cyan-500 text-tp-navy-700 font-semibold text-sm px-5 py-2.5 rounded-lg hover:-translate-y-0.5 hover:shadow-tp-glow transition-all disabled:opacity-60 disabled:translate-y-0"
      >
        {pending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
        {saved ? "Enregistré !" : "Enregistrer"}
      </button>
    </div>
  );
}
