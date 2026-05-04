"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Search, Tag, Trash2, Package } from "lucide-react";

type FavoriteItem = {
  id:        string;
  tags:      string[];
  createdAt: string;
  product: {
    id:       string;
    name:     string;
    brand:    string | null;
    imageUrl: string | null;
    category: string | null;
  } | null;
};

export function FavorisClient({ favorites: initial }: { favorites: FavoriteItem[] }) {
  const [favorites, setFavorites] = useState(initial);
  const [removing, setRemoving]   = useState<string | null>(null);

  async function handleRemove(id: string) {
    setRemoving(id);
    await fetch(`/api/favorites/${id}`, { method: "DELETE" });
    setFavorites((prev) => prev.filter((f) => f.id !== id));
    setRemoving(null);
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Mes favoris</h1>
        <p className="text-slate-400 text-sm">
          Produits sauvegardés pour un suivi rapide des prix.
        </p>
      </div>

      {/* Empty state */}
      {favorites.length === 0 && (
        <div className="rounded-xl border border-tp-cyan-500/15 bg-tp-navy-card p-10 text-center">
          <Heart size={36} className="text-tp-cyan-500/30 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-white font-medium mb-1">Aucun favori pour l'instant</p>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
            Ajoutez des produits en favoris depuis la page de recherche pour les retrouver rapidement ici.
          </p>
          <Link
            href="/dashboard/recherche"
            className="inline-flex items-center gap-2 bg-tp-cyan-500 text-tp-navy-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:-translate-y-0.5 hover:shadow-tp-glow transition-all"
          >
            <Search size={15} />
            Comparer des prix
          </Link>
        </div>
      )}

      {/* Favorite grid */}
      {favorites.length > 0 && (
        <div className="space-y-3">
          {favorites.map((fav) => (
            <div
              key={fav.id}
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-tp-cyan-500/15 bg-tp-navy-card hover:border-tp-cyan-500/30 transition-colors"
            >
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-lg border border-tp-cyan-500/10 bg-tp-navy-600/50 flex items-center justify-center shrink-0 overflow-hidden">
                {fav.product?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={fav.product.imageUrl} alt="" className="w-full h-full object-contain p-1" />
                ) : (
                  <Package size={20} className="text-slate-600" strokeWidth={1.5} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">
                  {fav.product?.name ?? "Produit sans titre"}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {fav.product?.brand ?? fav.product?.category ?? "—"}
                </p>
                {fav.tags.length > 0 && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <Tag size={10} className="text-slate-600" />
                    {fav.tags.map((t) => (
                      <span key={t} className="text-[10px] text-slate-500 border border-tp-cyan-500/15 px-1.5 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {fav.product && (
                  <Link
                    href={`/dashboard/recherche?q=${encodeURIComponent(fav.product.name)}`}
                    className="p-2 rounded-lg hover:bg-tp-cyan-500/10 text-slate-500 hover:text-tp-cyan-500 transition-colors"
                    title="Rechercher"
                  >
                    <Search size={15} strokeWidth={1.75} />
                  </Link>
                )}
                <button
                  onClick={() => handleRemove(fav.id)}
                  disabled={removing === fav.id}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors disabled:opacity-40"
                  title="Retirer des favoris"
                >
                  <Trash2 size={15} strokeWidth={1.75} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
