"use client";

import { useState } from "react";
import { MapPin, Plus, Trash2, Star, Loader2, Check, X, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserAddress } from "@trueprice-ai/db";

const CA_PROVINCES = [
  { code: "AB", label: "Alberta"                   },
  { code: "BC", label: "Colombie-Britannique"      },
  { code: "MB", label: "Manitoba"                  },
  { code: "NB", label: "Nouveau-Brunswick"         },
  { code: "NL", label: "Terre-Neuve-et-Labrador"  },
  { code: "NS", label: "Nouvelle-Écosse"           },
  { code: "NT", label: "Territoires du Nord-Ouest" },
  { code: "NU", label: "Nunavut"                   },
  { code: "ON", label: "Ontario"                   },
  { code: "PE", label: "Île-du-Prince-Édouard"    },
  { code: "QC", label: "Québec"                    },
  { code: "SK", label: "Saskatchewan"              },
  { code: "YT", label: "Yukon"                     },
];

const LABELS = ["Domicile", "Bureau", "Entrepôt", "Autre"];
const COUNTRIES = [
  { code: "CA", label: "Canada"        },
  { code: "US", label: "États-Unis"    },
  { code: "FR", label: "France"        },
  { code: "DE", label: "Allemagne"     },
  { code: "GB", label: "Royaume-Uni"   },
];

type FormData = {
  label:      string;
  street:     string;
  city:       string;
  province:   string;
  postalCode: string;
  country:    string;
  isDefault:  boolean;
};

const emptyForm = (): FormData => ({
  label: "Domicile", street: "", city: "", province: "QC", postalCode: "", country: "CA", isDefault: false,
});

export function AdressesClient({ initialAddresses }: { initialAddresses: UserAddress[] }) {
  const [addresses, setAddresses] = useState<UserAddress[]>(initialAddresses);
  const [showForm,  setShowForm]  = useState(false);
  const [editId,    setEditId]    = useState<string | null>(null);
  const [form,      setForm]      = useState<FormData>(emptyForm());
  const [loading,   setLoading]   = useState<string | null>(null); // addressId ou "new"

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!form.street || !form.city || !form.province || !form.postalCode) return;
    setLoading("new");
    try {
      if (editId) {
        const res = await fetch(`/api/addresses/${editId}`, {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(form),
        });
        if (!res.ok) return;
        const { address } = await res.json();
        setAddresses((prev) => prev.map((a) =>
          a.id === editId ? address : form.isDefault ? { ...a, isDefault: false } : a,
        ));
      } else {
        const res = await fetch("/api/addresses", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(form),
        });
        if (!res.ok) return;
        const { address } = await res.json();
        setAddresses((prev) => [
          ...prev.map((a) => form.isDefault ? { ...a, isDefault: false } : a),
          address,
        ]);
      }
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm());
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete(id: string) {
    setLoading(id);
    try {
      await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      setAddresses((prev) => {
        const remaining = prev.filter((a) => a.id !== id);
        const wasDefault = prev.find((a) => a.id === id)?.isDefault;
        if (wasDefault && remaining.length > 0) remaining[0].isDefault = true;
        return remaining;
      });
    } finally {
      setLoading(null);
    }
  }

  async function handleSetDefault(id: string) {
    setLoading(id);
    try {
      await fetch(`/api/addresses/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ isDefault: true }),
      });
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    } finally {
      setLoading(null);
    }
  }

  function startEdit(address: UserAddress) {
    setEditId(address.id);
    setForm({
      label:      address.label,
      street:     address.street,
      city:       address.city,
      province:   address.province,
      postalCode: address.postalCode,
      country:    address.country,
      isDefault:  address.isDefault,
    });
    setShowForm(true);
  }

  return (
    <div className="space-y-4">
      {/* Liste des adresses */}
      {addresses.length === 0 && !showForm && (
        <div className="rounded-xl border border-tp-cyan-500/15 bg-tp-navy-card p-10 text-center">
          <MapPin size={32} className="text-tp-cyan-500/30 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-white font-medium mb-1">Aucune adresse enregistrée</p>
          <p className="text-slate-500 text-sm">Ajoutez votre adresse pour des calculs de taxes précis.</p>
        </div>
      )}

      {addresses.map((addr) => (
        <div
          key={addr.id}
          className={cn(
            "rounded-xl border p-4 transition-all",
            addr.isDefault
              ? "border-tp-cyan-500/40 bg-tp-cyan-500/5"
              : "border-tp-cyan-500/15 bg-tp-navy-card",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-tp-cyan-500/10 border border-tp-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin size={14} className="text-tp-cyan-500" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white font-medium text-sm">{addr.label}</p>
                  {addr.isDefault && (
                    <span className="text-[9px] font-bold uppercase tracking-widest text-tp-cyan-500 bg-tp-cyan-500/10 border border-tp-cyan-500/30 px-2 py-0.5 rounded-full">
                      Par défaut
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-xs mt-0.5">{addr.street}</p>
                <p className="text-slate-400 text-xs">{addr.city}, {addr.province} {addr.postalCode} · {addr.country}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {!addr.isDefault && (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  disabled={loading === addr.id}
                  title="Définir par défaut"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-tp-cyan-500 hover:bg-tp-cyan-500/10 transition-colors"
                >
                  {loading === addr.id ? <Loader2 size={13} className="animate-spin" /> : <Star size={13} strokeWidth={1.75} />}
                </button>
              )}
              <button
                onClick={() => startEdit(addr)}
                title="Modifier"
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Edit2 size={13} strokeWidth={1.75} />
              </button>
              <button
                onClick={() => handleDelete(addr.id)}
                disabled={loading === addr.id}
                title="Supprimer"
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                {loading === addr.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} strokeWidth={1.75} />}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Formulaire */}
      {showForm && (
        <div className="rounded-xl border border-tp-cyan-500/30 bg-tp-navy-card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white font-medium text-sm">{editId ? "Modifier l'adresse" : "Nouvelle adresse"}</p>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm()); }}
              className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors">
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Label */}
            <div className="col-span-2">
              <label className="text-xs text-slate-500 mb-1 block">Étiquette</label>
              <div className="flex gap-2 flex-wrap">
                {LABELS.map((l) => (
                  <button key={l} onClick={() => updateField("label", l)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border text-xs transition-colors",
                      form.label === l
                        ? "border-tp-cyan-500/50 bg-tp-cyan-500/10 text-tp-cyan-500"
                        : "border-tp-cyan-500/15 text-slate-400 hover:text-white",
                    )}>
                    {l}
                  </button>
                ))}
                {!LABELS.includes(form.label) && (
                  <input
                    value={form.label}
                    onChange={(e) => updateField("label", e.target.value)}
                    placeholder="Autre étiquette"
                    className="px-3 py-1.5 rounded-lg border border-tp-cyan-500/20 bg-tp-navy-700/60 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-tp-cyan-500/50"
                  />
                )}
              </div>
            </div>

            {/* Pays */}
            <div className="col-span-2">
              <label className="text-xs text-slate-500 mb-1 block">Pays</label>
              <select value={form.country} onChange={(e) => updateField("country", e.target.value)}
                className="w-full bg-tp-navy-700/60 border border-tp-cyan-500/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tp-cyan-500/50">
                {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </div>

            {/* Rue */}
            <div className="col-span-2">
              <label className="text-xs text-slate-500 mb-1 block">Adresse</label>
              <input value={form.street} onChange={(e) => updateField("street", e.target.value)}
                placeholder="123 rue Principale"
                className="w-full bg-tp-navy-700/60 border border-tp-cyan-500/20 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-tp-cyan-500/50" />
            </div>

            {/* Ville */}
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Ville</label>
              <input value={form.city} onChange={(e) => updateField("city", e.target.value)}
                placeholder="Montréal"
                className="w-full bg-tp-navy-700/60 border border-tp-cyan-500/20 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-tp-cyan-500/50" />
            </div>

            {/* Province */}
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Province / État</label>
              {form.country === "CA" ? (
                <select value={form.province} onChange={(e) => updateField("province", e.target.value)}
                  className="w-full bg-tp-navy-700/60 border border-tp-cyan-500/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tp-cyan-500/50">
                  {CA_PROVINCES.map((p) => <option key={p.code} value={p.code}>{p.code} — {p.label}</option>)}
                </select>
              ) : (
                <input value={form.province} onChange={(e) => updateField("province", e.target.value)}
                  placeholder="NY"
                  className="w-full bg-tp-navy-700/60 border border-tp-cyan-500/20 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-tp-cyan-500/50" />
              )}
            </div>

            {/* Code postal */}
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Code postal</label>
              <input value={form.postalCode} onChange={(e) => updateField("postalCode", e.target.value)}
                placeholder="H1A 1A1"
                className="w-full bg-tp-navy-700/60 border border-tp-cyan-500/20 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-tp-cyan-500/50" />
            </div>

            {/* Par défaut */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateField("isDefault", !form.isDefault)}
                className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0",
                  form.isDefault
                    ? "bg-tp-cyan-500 border-tp-cyan-500"
                    : "border-tp-cyan-500/30 bg-transparent",
                )}
              >
                {form.isDefault && <Check size={10} className="text-tp-navy-700" strokeWidth={3} />}
              </button>
              <span className="text-xs text-slate-400">Définir comme adresse par défaut</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm()); }}
              className="px-4 py-2 rounded-lg border border-tp-cyan-500/20 text-sm text-slate-400 hover:text-white transition-colors">
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading === "new" || !form.street || !form.city || !form.postalCode}
              className="flex items-center gap-2 bg-tp-cyan-500 text-tp-navy-700 font-semibold text-sm px-5 py-2 rounded-lg hover:-translate-y-0.5 transition-all disabled:opacity-60"
            >
              {loading === "new" ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {editId ? "Mettre à jour" : "Ajouter"}
            </button>
          </div>
        </div>
      )}

      {/* Bouton ajouter */}
      {!showForm && (
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm()); }}
          className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border border-dashed border-tp-cyan-500/25 text-slate-400 hover:text-tp-cyan-500 hover:border-tp-cyan-500/50 hover:bg-tp-cyan-500/5 transition-all text-sm"
        >
          <Plus size={15} strokeWidth={1.75} />
          Ajouter une adresse
        </button>
      )}
    </div>
  );
}
