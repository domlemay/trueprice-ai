"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GitBranch, Plus, Star, Loader2, X } from "lucide-react";

type Branch = {
  id: string; name: string; country: string; province: string | null;
  city: string | null; timezone: string; currency: string; isHeadquarters: boolean;
};

export function BranchesClient({ orgId, branches, isAdmin }: {
  orgId: string; branches: Branch[]; isAdmin: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", country: "CA", province: "", city: "", timezone: "America/Toronto", currency: "CAD", isHeadquarters: false });
  const [pending, start] = useTransition();

  function handleCreate() {
    if (!form.name.trim()) return;
    start(async () => {
      await fetch(`/api/org/${orgId}/branches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setOpen(false);
      setForm({ name: "", country: "CA", province: "", city: "", timezone: "America/Toronto", currency: "CAD", isHeadquarters: false });
      router.refresh();
    });
  }

  return (
    <div>
      {isAdmin && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 border border-tp-cyan-500/30 text-tp-cyan-500 text-sm font-medium px-4 py-2 rounded-lg hover:border-tp-cyan-500/60 hover:bg-tp-cyan-500/5 transition-colors"
          >
            <Plus size={15} /> Ajouter une succursale
          </button>
        </div>
      )}

      {branches.length === 0 ? (
        <div className="rounded-xl border border-tp-cyan-500/15 bg-tp-navy-card p-10 text-center">
          <GitBranch size={36} className="text-tp-cyan-500/30 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-slate-400 text-sm">Aucune succursale configurée.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {branches.map((b) => (
            <div key={b.id} className="bg-tp-navy-card border border-tp-cyan-500/15 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-white font-semibold">{b.name}</p>
                {b.isHeadquarters && (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-full">
                    <Star size={10} /> Siège
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-xs">{[b.city, b.province, b.country].filter(Boolean).join(", ")}</p>
              <p className="text-slate-600 text-xs mt-1">{b.timezone} · {b.currency}</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal création */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-tp-navy-700/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-tp-navy-card border border-tp-cyan-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-bold text-white">Nouvelle succursale</h3>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              {[
                { key: "name", label: "Nom", placeholder: "Bureau de Montréal" },
                { key: "city", label: "Ville", placeholder: "Montréal" },
                { key: "province", label: "Province / État", placeholder: "QC" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">{label}</label>
                  <input
                    type="text" value={(form as unknown as Record<string, string>)[key]} placeholder={placeholder}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-tp-navy-600/40 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-tp-cyan-500/50"
                  />

                </div>
              ))}
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                <input type="checkbox" checked={form.isHeadquarters} onChange={(e) => setForm((f) => ({ ...f, isHeadquarters: e.target.checked }))} className="accent-tp-cyan-500" />
                Siège social
              </label>
            </div>
            <div className="flex gap-3 justify-end mt-5">
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white text-sm px-4 py-2">Annuler</button>
              <button onClick={handleCreate} disabled={pending || !form.name.trim()}
                className="flex items-center gap-2 bg-tp-cyan-500 text-tp-navy-700 font-semibold text-sm px-4 py-2 rounded-lg hover:-translate-y-0.5 hover:shadow-tp-glow transition-all disabled:opacity-60 disabled:translate-y-0">
                {pending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
