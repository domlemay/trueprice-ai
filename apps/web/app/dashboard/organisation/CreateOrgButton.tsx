"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2 } from "lucide-react";

export function CreateOrgButton({ variant }: { variant?: "hero" }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  async function handleCreate() {
    if (!name.trim()) return;
    start(async () => {
      const res = await fetch("/api/org/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json() as { org?: { id: string }; error?: string };
      if (data.org) {
        router.push(`/dashboard/organisation/${data.org.id}`);
      } else {
        alert(data.error ?? "Erreur lors de la création.");
      }
    });
  }

  if (variant === "hero") {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 bg-tp-cyan-500 text-tp-navy-700 font-semibold text-sm px-5 py-2.5 rounded-lg hover:-translate-y-0.5 hover:shadow-tp-glow transition-all"
        >
          <Plus size={16} /> Créer une organisation
        </button>
        <Modal open={open} onClose={() => setOpen(false)} name={name} setName={setName} onCreate={handleCreate} pending={pending} />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 border border-tp-cyan-500/30 text-tp-cyan-500 text-sm font-medium px-4 py-2 rounded-lg hover:border-tp-cyan-500/60 hover:bg-tp-cyan-500/5 transition-colors"
      >
        <Plus size={15} /> Nouvelle organisation
      </button>
      <Modal open={open} onClose={() => setOpen(false)} name={name} setName={setName} onCreate={handleCreate} pending={pending} />
    </>
  );
}

function Modal({ open, onClose, name, setName, onCreate, pending }: {
  open: boolean; onClose: () => void; name: string;
  setName: (v: string) => void; onCreate: () => void; pending: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-tp-navy-700/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-tp-navy-card border border-tp-cyan-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-bold text-white">Nouvelle organisation</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Nom de l'organisation</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onCreate()}
          placeholder="Acme Inc."
          autoFocus
          className="w-full bg-tp-navy-600/40 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-tp-cyan-500/50 mb-4"
        />
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm px-4 py-2 transition-colors">Annuler</button>
          <button
            onClick={onCreate}
            disabled={pending || !name.trim()}
            className="flex items-center gap-2 bg-tp-cyan-500 text-tp-navy-700 font-semibold text-sm px-4 py-2 rounded-lg hover:-translate-y-0.5 hover:shadow-tp-glow transition-all disabled:opacity-60 disabled:translate-y-0"
          >
            {pending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            Créer
          </button>
        </div>
      </div>
    </div>
  );
}
