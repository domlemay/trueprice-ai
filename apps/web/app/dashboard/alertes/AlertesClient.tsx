"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell, BellOff, Trash2, Search, Package,
  TrendingDown, RefreshCcw, Plus, ChevronRight,
} from "lucide-react";

type ProductSnippet = {
  id:       string;
  name:     string;
  brand:    string | null;
  imageUrl: string | null;
} | null;

type PriceAlertItem = {
  id:           string;
  targetPrice:  number;
  currency:     string;
  isActive:     boolean;
  triggeredAt:  string | null;
  createdAt:    string;
  product:      ProductSnippet;
};

type StockAlertItem = {
  id:          string;
  isActive:    boolean;
  triggeredAt: string | null;
  createdAt:   string;
  product:     ProductSnippet;
};

export function AlertesClient({
  priceAlerts:  initialPrice,
  stockAlerts:  initialStock,
  plan,
  priceAlertLimit,
}: {
  priceAlerts:     PriceAlertItem[];
  stockAlerts:     StockAlertItem[];
  plan:            string;
  priceAlertLimit: number;
}) {
  const [priceAlerts, setPriceAlerts] = useState(initialPrice);
  const [stockAlerts, setStockAlerts] = useState(initialStock);
  const [busy,        setBusy]        = useState<string | null>(null);

  const fmtPrice = (n: number, currency: string) =>
    n.toLocaleString("fr-CA", { style: "currency", currency });

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-CA", { day: "numeric", month: "short" });

  async function togglePrice(id: string, isActive: boolean) {
    setBusy(id);
    await fetch(`/api/alerts/${id}?type=price`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ isActive, type: "price" }),
    });
    setPriceAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive } : a)),
    );
    setBusy(null);
  }

  async function deletePrice(id: string) {
    setBusy(id);
    await fetch(`/api/alerts/${id}?type=price`, { method: "DELETE" });
    setPriceAlerts((prev) => prev.filter((a) => a.id !== id));
    setBusy(null);
  }

  async function toggleStock(id: string, isActive: boolean) {
    setBusy(id);
    await fetch(`/api/alerts/${id}?type=stock`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ isActive, type: "stock" }),
    });
    setStockAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive } : a)),
    );
    setBusy(null);
  }

  async function deleteStock(id: string) {
    setBusy(id);
    await fetch(`/api/alerts/${id}?type=stock`, { method: "DELETE" });
    setStockAlerts((prev) => prev.filter((a) => a.id !== id));
    setBusy(null);
  }

  const limitLabel = priceAlertLimit < 0 ? "∞" : String(priceAlertLimit);
  const atPriceLimit = priceAlertLimit > 0 && priceAlerts.length >= priceAlertLimit;

  return (
    <div className="max-w-3xl space-y-10">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-white mb-2">Alertes</h1>
        <p className="text-slate-400 text-sm">
          Recevez une notification quand un prix baisse ou qu'un produit revient en stock.
        </p>
      </div>

      {/* ── Alertes prix ─────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <TrendingDown size={16} className="text-tp-cyan-500" strokeWidth={1.75} />
            Alertes prix
            <span className="text-xs text-slate-500 font-normal ml-1">
              {priceAlerts.length} / {limitLabel}
            </span>
          </h2>
          {atPriceLimit ? (
            <Link
              href="/dashboard/abonnement"
              className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              Passer à PREMIUM <ChevronRight size={12} />
            </Link>
          ) : (
            <Link
              href="/dashboard/recherche"
              className="flex items-center gap-1.5 text-xs text-tp-cyan-500 hover:text-tp-cyan-400 transition-colors"
            >
              <Plus size={12} />
              Ajouter depuis la recherche
            </Link>
          )}
        </div>

        {priceAlerts.length === 0 ? (
          <EmptyState
            icon={<TrendingDown size={32} className="text-tp-cyan-500/30" strokeWidth={1.5} />}
            title="Aucune alerte prix"
            description="Depuis les résultats de recherche, cliquez sur l'icône 🔔 d'une offre pour créer une alerte."
          />
        ) : (
          <div className="space-y-2">
            {priceAlerts.map((alert) => (
              <AlertRow
                key={alert.id}
                product={alert.product}
                label={
                  <span>
                    Prix cible :{" "}
                    <span className="text-tp-cyan-500 font-semibold">
                      {fmtPrice(alert.targetPrice, alert.currency)}
                    </span>
                  </span>
                }
                badge={
                  alert.triggeredAt ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 text-emerald-400">
                      Déclenché {fmtDate(alert.triggeredAt)}
                    </span>
                  ) : null
                }
                isActive={alert.isActive}
                busy={busy === alert.id}
                onToggle={() => togglePrice(alert.id, !alert.isActive)}
                onDelete={() => deletePrice(alert.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Alertes stock ────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <RefreshCcw size={16} className="text-tp-cyan-500" strokeWidth={1.75} />
            Alertes stock
          </h2>
          <Link
            href="/dashboard/recherche"
            className="flex items-center gap-1.5 text-xs text-tp-cyan-500 hover:text-tp-cyan-400 transition-colors"
          >
            <Plus size={12} />
            Ajouter depuis la recherche
          </Link>
        </div>

        {stockAlerts.length === 0 ? (
          <EmptyState
            icon={<RefreshCcw size={32} className="text-tp-cyan-500/30" strokeWidth={1.5} />}
            title="Aucune alerte stock"
            description="Depuis les résultats de recherche, créez une alerte pour être notifié quand un produit revient en stock."
          />
        ) : (
          <div className="space-y-2">
            {stockAlerts.map((alert) => (
              <AlertRow
                key={alert.id}
                product={alert.product}
                label={<span className="text-slate-400">Alerte retour en stock</span>}
                badge={
                  alert.triggeredAt ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 text-emerald-400">
                      De retour {fmtDate(alert.triggeredAt)}
                    </span>
                  ) : null
                }
                isActive={alert.isActive}
                busy={busy === alert.id}
                onToggle={() => toggleStock(alert.id, !alert.isActive)}
                onDelete={() => deleteStock(alert.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Plan info */}
      {plan === "FREE" && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 flex items-center justify-between">
          <p className="text-xs text-amber-400/80">
            Plan FREE · {priceAlerts.length} / {limitLabel} alertes prix utilisées.{" "}
            <Link href="/dashboard/abonnement" className="underline hover:text-amber-300">
              Passer à PREMIUM
            </Link>{" "}
            pour 20 alertes.
          </p>
          <Bell size={14} className="text-amber-500/50 shrink-0" />
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, title, description }: {
  icon:        React.ReactNode;
  title:       string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-tp-cyan-500/15 bg-tp-navy-card p-8 text-center">
      <div className="mx-auto mb-3 w-fit">{icon}</div>
      <p className="text-white font-medium mb-1">{title}</p>
      <p className="text-slate-500 text-sm max-w-sm mx-auto">{description}</p>
      <Link
        href="/dashboard/recherche"
        className="mt-5 inline-flex items-center gap-2 text-sm text-tp-cyan-500 hover:text-tp-cyan-400 transition-colors"
      >
        <Search size={14} />
        Aller à la recherche
      </Link>
    </div>
  );
}

function AlertRow({
  product, label, badge, isActive, busy, onToggle, onDelete,
}: {
  product:  ProductSnippet;
  label:    React.ReactNode;
  badge?:   React.ReactNode;
  isActive: boolean;
  busy:     boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-colors ${
      isActive
        ? "border-tp-cyan-500/20 bg-tp-navy-card"
        : "border-tp-cyan-500/10 bg-tp-navy-700/50 opacity-60"
    }`}>
      {/* Thumbnail */}
      <div className="w-10 h-10 rounded-lg border border-tp-cyan-500/10 bg-tp-navy-600/50 flex items-center justify-center shrink-0 overflow-hidden">
        {product?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt="" className="w-full h-full object-contain p-1" />
        ) : (
          <Package size={18} className="text-slate-600" strokeWidth={1.5} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">
          {product?.name ?? "Produit sans titre"}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-500">{label}</span>
          {badge}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onToggle}
          disabled={busy}
          className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors disabled:opacity-40"
          title={isActive ? "Désactiver" : "Activer"}
        >
          {isActive
            ? <Bell    size={15} strokeWidth={1.75} />
            : <BellOff size={15} strokeWidth={1.75} />
          }
        </button>
        <button
          onClick={onDelete}
          disabled={busy}
          className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors disabled:opacity-40"
          title="Supprimer"
        >
          <Trash2 size={15} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
