"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Download, Trash2, Check, Loader2, AlertTriangle } from "lucide-react";

export function PrivacyClient({ userId, consentAnalytics, consentMarketing, deleteRequestedAt, dataExportedAt }: {
  userId: string;
  consentAnalytics: boolean;
  consentMarketing: boolean;
  deleteRequestedAt: string | null;
  dataExportedAt: string | null;
}) {
  const router = useRouter();
  const [analytics, setAnalytics] = useState(consentAnalytics);
  const [marketing, setMarketing] = useState(consentMarketing);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saveP, startSave] = useTransition();
  const [exportP, startExport] = useTransition();
  const [deleteP, startDelete] = useTransition();

  function saveConsents() {
    startSave(async () => {
      await fetch("/api/profile/consents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analytics, marketing }),
      });
      setSaved(true);
      setTimeout(() => { setSaved(false); router.refresh(); }, 2000);
    });
  }

  function exportData() {
    startExport(async () => {
      await fetch("/api/profile/export", { method: "POST" });
      router.refresh();
    });
  }

  function requestDelete() {
    startDelete(async () => {
      await fetch("/api/profile/delete", { method: "POST" });
      setConfirmDelete(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {/* Consentements */}
      <div className="bg-tp-navy-card border border-tp-cyan-500/15 rounded-xl p-6 space-y-4">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <ShieldCheck size={16} className="text-tp-cyan-500" strokeWidth={1.75} />
          Consentements (v1.0.0)
        </h2>

        {([
          { key: "analytics", label: "Analytique", desc: "Analyse anonymisée de l'usage pour améliorer TruePriceAI.", value: analytics, set: setAnalytics },
          { key: "marketing", label: "Marketing",  desc: "Offres personnalisées et actualités de TruePriceAI.",       value: marketing, set: setMarketing },
        ] as const).map(({ key, label, desc, value, set }) => (
          <div key={key} className="flex items-start justify-between gap-4">
            <div>
              <p className="text-white text-sm font-medium">{label}</p>
              <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
            </div>
            <button
              onClick={() => set(!value)}
              className={`relative shrink-0 w-10 h-[22px] rounded-full transition-colors mt-0.5 ${value ? "bg-tp-cyan-500" : "bg-slate-700"}`}
            >
              <span className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform ${value ? "translate-x-[18px]" : "translate-x-0.5"}`} />
            </button>
          </div>
        ))}

        <button
          onClick={saveConsents}
          disabled={saveP}
          className="flex items-center gap-2 bg-tp-cyan-500 text-tp-navy-700 font-semibold text-sm px-4 py-2 rounded-lg hover:-translate-y-0.5 hover:shadow-tp-glow transition-all disabled:opacity-60 disabled:translate-y-0"
        >
          {saveP ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Check size={14} />}
          {saved ? "Enregistré !" : "Enregistrer les préférences"}
        </button>
      </div>

      {/* Export données */}
      <div className="bg-tp-navy-card border border-tp-cyan-500/15 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
          <Download size={16} className="text-tp-cyan-500" strokeWidth={1.75} />
          Exporter mes données
        </h2>
        <p className="text-slate-400 text-sm mb-4">
          Recevez une archive JSON de toutes vos données personnelles (RGPD / Loi 25).
        </p>
        {dataExportedAt && (
          <p className="text-xs text-slate-500 mb-3">
            Dernier export : {new Date(dataExportedAt).toLocaleDateString("fr-CA")}
          </p>
        )}
        <button
          onClick={exportData}
          disabled={exportP}
          className="flex items-center gap-2 border border-tp-cyan-500/25 text-tp-cyan-500 text-sm font-medium px-4 py-2 rounded-lg hover:border-tp-cyan-500/50 hover:bg-tp-cyan-500/5 transition-colors disabled:opacity-60"
        >
          {exportP ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          Demander l'export
        </button>
      </div>

      {/* Suppression compte */}
      <div className="bg-tp-navy-card border border-rose-500/20 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
          <Trash2 size={16} className="text-rose-400" strokeWidth={1.75} />
          Supprimer mon compte
        </h2>
        {deleteRequestedAt ? (
          <div className="flex items-start gap-2 text-amber-400 text-sm">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <p>Suppression programmée le {new Date(new Date(deleteRequestedAt).getTime() + 30 * 86400000).toLocaleDateString("fr-CA")}. Contactez le support pour annuler.</p>
          </div>
        ) : (
          <>
            <p className="text-slate-400 text-sm mb-4">
              Votre compte sera supprimé définitivement 30 jours après la demande. Cette action est irréversible.
            </p>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-2 border border-rose-500/30 text-rose-400 text-sm font-medium px-4 py-2 rounded-lg hover:border-rose-500/60 hover:bg-rose-500/5 transition-colors">
                <Trash2 size={14} /> Supprimer mon compte
              </button>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(false)} className="text-slate-400 hover:text-white text-sm px-4 py-2 transition-colors">Annuler</button>
                <button onClick={requestDelete} disabled={deleteP} className="flex items-center gap-2 bg-rose-500 text-white font-semibold text-sm px-4 py-2 rounded-lg hover:bg-rose-400 transition-colors disabled:opacity-60">
                  {deleteP ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Confirmer la suppression
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
