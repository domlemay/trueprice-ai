"use client";

import { useState } from "react";
import Link from "next/link";
import {
  List, Plus, Search, Trash2, RotateCcw, FolderKanban,
  ChevronRight, Tag, Package, X, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type ListItem = {
  id:        string;
  query:     string | null;
  productId: string | null;
  quantity:  number;
  notes:     string | null;
  sortOrder: number;
};

type ProductList = {
  id:          string;
  name:        string;
  type:        "STANDARD" | "RECURRING" | "PROJECT";
  description: string | null;
  tags:        string[];
  createdAt:   string;
  _count:      { items: number };
  items?:      ListItem[];
};

const TYPE_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>; color: string }> = {
  STANDARD:  { label: "Standard",   icon: List,          color: "text-slate-400"       },
  RECURRING: { label: "Récurrente", icon: RotateCcw,     color: "text-tp-cyan-500"    },
  PROJECT:   { label: "Projet",     icon: FolderKanban,  color: "text-amber-400"       },
};

// ── Main Component ────────────────────────────────────────────────────────────

export function ListesClient({ lists: initial }: { lists: ProductList[] }) {
  const [lists, setLists]             = useState<ProductList[]>(initial);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [activeItems, setActiveItems]  = useState<ListItem[]>([]);
  const [loadingId, setLoadingId]      = useState<string | null>(null);

  // Modale création
  const [showCreate, setShowCreate]   = useState(false);
  const [newName, setNewName]         = useState("");
  const [newType, setNewType]         = useState<"STANDARD" | "RECURRING" | "PROJECT">("STANDARD");
  const [newDesc, setNewDesc]         = useState("");
  const [creating, setCreating]       = useState(false);

  // Ajout item
  const [newItemQuery, setNewItemQuery] = useState("");
  const [addingItem, setAddingItem]     = useState(false);

  // Suppression liste
  const [removing, setRemoving] = useState<string | null>(null);

  async function openList(id: string) {
    if (activeListId === id) { setActiveListId(null); return; }
    setLoadingId(id);
    const res = await fetch(`/api/lists/${id}`);
    if (res.ok) {
      const data: ProductList = await res.json();
      setActiveItems(data.items ?? []);
      setActiveListId(id);
    }
    setLoadingId(null);
  }

  async function createList() {
    if (!newName.trim() || creating) return;
    setCreating(true);
    const res = await fetch("/api/lists", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name: newName.trim(), type: newType, description: newDesc.trim() || undefined }),
    });
    if (res.ok) {
      const list = await res.json();
      setLists((prev) => [{ ...list, _count: { items: 0 } }, ...prev]);
      setShowCreate(false);
      setNewName("");
      setNewType("STANDARD");
      setNewDesc("");
    }
    setCreating(false);
  }

  async function deleteList(id: string) {
    setRemoving(id);
    await fetch(`/api/lists/${id}`, { method: "DELETE" });
    setLists((prev) => prev.filter((l) => l.id !== id));
    if (activeListId === id) setActiveListId(null);
    setRemoving(null);
  }

  async function addItem() {
    if (!newItemQuery.trim() || !activeListId || addingItem) return;
    setAddingItem(true);
    const res = await fetch(`/api/lists/${activeListId}/items`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ query: newItemQuery.trim() }),
    });
    if (res.ok) {
      const item: ListItem = await res.json();
      setActiveItems((prev) => [...prev, item]);
      setLists((prev) =>
        prev.map((l) => l.id === activeListId
          ? { ...l, _count: { items: l._count.items + 1 } }
          : l,
        ),
      );
      setNewItemQuery("");
    }
    setAddingItem(false);
  }

  async function removeItem(itemId: string) {
    if (!activeListId) return;
    await fetch(`/api/lists/${activeListId}/items/${itemId}`, { method: "DELETE" });
    setActiveItems((prev) => prev.filter((i) => i.id !== itemId));
    setLists((prev) =>
      prev.map((l) => l.id === activeListId
        ? { ...l, _count: { items: Math.max(0, l._count.items - 1) } }
        : l,
      ),
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Mes listes</h1>
          <p className="text-slate-400 text-sm">
            Organisez vos produits en listes pour comparer en groupe.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-tp-cyan-500 text-tp-navy-700 font-semibold text-sm px-4 py-2.5 rounded-xl hover:-translate-y-0.5 hover:shadow-tp-glow transition-all"
        >
          <Plus size={15} />
          Nouvelle liste
        </button>
      </div>

      {/* Modale création */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tp-navy-700/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-tp-cyan-500/20 bg-tp-navy-700 shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-tp-cyan-500/10">
              <h2 className="font-display font-bold text-white text-lg">Nouvelle liste</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-tp-navy-600/60 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Nom de la liste</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createList()}
                  placeholder="Ex. : Montage PC, Épicerie hebdo…"
                  className="w-full bg-tp-navy-card border border-tp-cyan-500/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-tp-cyan-500/50 transition-colors"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Type</label>
                <div className="flex gap-2">
                  {(["STANDARD", "RECURRING", "PROJECT"] as const).map((t) => {
                    const cfg = TYPE_CONFIG[t];
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={t}
                        onClick={() => setNewType(t)}
                        className={cn(
                          "flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition-colors",
                          newType === t
                            ? "border-tp-cyan-500/50 bg-tp-cyan-500/10 text-tp-cyan-400"
                            : "border-tp-cyan-500/15 bg-tp-navy-card text-slate-500 hover:border-tp-cyan-500/30",
                        )}
                      >
                        <Icon size={16} strokeWidth={1.75} className={newType === t ? "text-tp-cyan-500" : ""} />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description optionnelle */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Description <span className="text-slate-600">(optionnel)</span></label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Notes sur cette liste…"
                  className="w-full bg-tp-navy-card border border-tp-cyan-500/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-tp-cyan-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowCreate(false)}
                className="text-sm text-slate-400 hover:text-white px-4 py-2 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={createList}
                disabled={!newName.trim() || creating}
                className="flex items-center gap-2 bg-tp-cyan-500 text-tp-navy-700 font-semibold text-sm px-5 py-2 rounded-xl hover:-translate-y-0.5 hover:shadow-tp-glow transition-all disabled:opacity-60 disabled:translate-y-0"
              >
                {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {lists.length === 0 && (
        <div className="rounded-xl border border-tp-cyan-500/15 bg-tp-navy-card p-10 text-center">
          <List size={36} className="text-tp-cyan-500/30 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-white font-medium mb-1">Aucune liste pour l'instant</p>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
            Créez votre première liste pour regrouper vos produits à comparer.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 bg-tp-cyan-500 text-tp-navy-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:-translate-y-0.5 hover:shadow-tp-glow transition-all"
          >
            <Plus size={15} />
            Créer une liste
          </button>
        </div>
      )}

      {/* Liste des listes */}
      {lists.length > 0 && (
        <div className="space-y-3">
          {lists.map((list) => {
            const cfg    = TYPE_CONFIG[list.type] ?? TYPE_CONFIG.STANDARD;
            const Icon   = cfg.icon;
            const isOpen = activeListId === list.id;

            return (
              <div
                key={list.id}
                className={cn(
                  "rounded-xl border transition-all overflow-hidden",
                  isOpen ? "border-tp-cyan-500/40 bg-tp-cyan-500/5" : "border-tp-cyan-500/15 bg-tp-navy-card",
                )}
              >
                {/* Header de la liste */}
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <button
                    onClick={() => openList(list.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center border border-tp-cyan-500/15 bg-tp-navy-600/50 shrink-0",
                    )}>
                      {loadingId === list.id
                        ? <Loader2 size={14} className="text-tp-cyan-500 animate-spin" />
                        : <Icon size={14} strokeWidth={1.75} className={cfg.color} />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{list.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn("text-[10px] font-medium uppercase tracking-wider", cfg.color)}>
                          {cfg.label}
                        </span>
                        <span className="text-[10px] text-slate-600">·</span>
                        <span className="text-[10px] text-slate-500">
                          {list._count.items} produit{list._count.items !== 1 ? "s" : ""}
                        </span>
                        {list.tags.length > 0 && (
                          <>
                            <span className="text-[10px] text-slate-600">·</span>
                            <Tag size={9} className="text-slate-600" />
                            <span className="text-[10px] text-slate-500">{list.tags.join(", ")}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <ChevronRight
                      size={15}
                      className={cn("text-slate-600 transition-transform shrink-0", isOpen && "rotate-90")}
                    />
                  </button>

                  <button
                    onClick={() => deleteList(list.id)}
                    disabled={removing === list.id}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40 shrink-0"
                    title="Supprimer la liste"
                  >
                    {removing === list.id
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Trash2 size={14} strokeWidth={1.75} />
                    }
                  </button>
                </div>

                {/* Détail liste (accordéon) */}
                {isOpen && (
                  <div className="border-t border-tp-cyan-500/10 px-4 py-3 space-y-2">
                    {list.description && (
                      <p className="text-xs text-slate-500 mb-3">{list.description}</p>
                    )}

                    {/* Items */}
                    {activeItems.length > 0 && (
                      <div className="space-y-1.5 mb-3">
                        {activeItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-tp-navy-600/30 border border-tp-cyan-500/8"
                          >
                            <Package size={12} className="text-slate-600 shrink-0" strokeWidth={1.75} />
                            <span className="flex-1 text-xs text-slate-300 truncate">
                              {item.query ?? "Produit lié"}
                            </span>
                            {item.quantity > 1 && (
                              <span className="text-[10px] text-slate-500">×{item.quantity}</span>
                            )}
                            {item.notes && (
                              <span className="text-[10px] text-slate-600 truncate max-w-[80px]">{item.notes}</span>
                            )}
                            <Link
                              href={`/dashboard/recherche?q=${encodeURIComponent(item.query ?? "")}`}
                              className="p-1 rounded text-slate-600 hover:text-tp-cyan-500 transition-colors"
                              title="Rechercher"
                            >
                              <Search size={11} strokeWidth={1.75} />
                            </Link>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1 rounded text-slate-600 hover:text-red-400 transition-colors"
                              title="Retirer"
                            >
                              <X size={11} strokeWidth={1.75} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeItems.length === 0 && (
                      <p className="text-xs text-slate-600 mb-3">Aucun produit dans cette liste.</p>
                    )}

                    {/* Ajouter un item */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newItemQuery}
                        onChange={(e) => setNewItemQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addItem()}
                        placeholder="Nom du produit ou URL…"
                        className="flex-1 bg-tp-navy-card border border-tp-cyan-500/20 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-tp-cyan-500/40 transition-colors"
                      />
                      <button
                        onClick={addItem}
                        disabled={!newItemQuery.trim() || addingItem}
                        className="flex items-center gap-1.5 bg-tp-cyan-500/15 text-tp-cyan-400 border border-tp-cyan-500/30 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-tp-cyan-500/25 transition-colors disabled:opacity-50"
                      >
                        {addingItem
                          ? <Loader2 size={12} className="animate-spin" />
                          : <Plus size={12} />
                        }
                        Ajouter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
