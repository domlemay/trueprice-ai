"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import {
  Search, Loader2, History, ArrowRight, TrendingUp,
  Heart, HeartOff, Copy, Check, ExternalLink, Tag,
  Zap, Users, ShoppingBag, Gift, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SCRAPERS_READY = true;

// ── Types ─────────────────────────────────────────────────────────────────────

type RecentSearch = {
  id: string;
  query: string;
  inputType: string;
  bestTruePrice: number | null;
  bestOfferMarket: string | null;
  createdAt: string;
  _count: { offers: number };
};

type Discount = {
  id: string;
  type: "AUTOMATIC" | "COUPON" | "CONDITIONAL" | "MEMBERSHIP" | "SALE" | "BUNDLE" | "CASHBACK";
  label: string;
  amountOff: number | null;
  percentOff: number | null;
  code: string | null;
  condition: string | null;
  expiresAt: string | null;
  isAutoApplied: boolean;
};

type Offer = {
  id: string;
  sellerName: string | null;
  sellerCountry: string;
  priceCurrent: number;
  priceOriginal: number;
  currency: string;
  productUrl: string | null;
  shippingCost: number | null;
  truePriceTotal: number | null;
  taxAmount: number | null;
  dutyAmount: number | null;
  brokerageFee: number | null;
  inStock: boolean;
  isPrime: boolean;
  marketplace: { name: string; slug: string } | null;
  discounts: Discount[];
};

type SearchResult = {
  status: "pending" | "completed";
  search: {
    id: string;
    query: string;
    offers: Offer[];
    aiSummary: string | null;
  };
};

// ── Main Component ────────────────────────────────────────────────────────────

export function SearchClient({
  plan,
  searchCountMonth,
  searchLimit,
  recentSearches,
}: {
  plan: string;
  searchCountMonth: number;
  searchLimit: number;
  recentSearches: RecentSearch[];
}) {
  const [query, setQuery]   = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError]   = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [polling, setPolling]      = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  function handleSearch() {
    if (!query.trim() || pending) return;
    setError(null);
    setResult(null);

    startTransition(async () => {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (res.status === 429) {
        const data = await res.json();
        setError(`Quota mensuel atteint (${data.used}/${data.limit} recherches). Passez à PREMIUM pour 200 recherches/mois.`);
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erreur lors de la recherche.");
        return;
      }

      const { searchId, deduplicated } = await res.json();
      if (deduplicated) {
        await loadResult(searchId);
        return;
      }

      setPolling(true);
      let attempts = 0;
      pollRef.current = setInterval(async () => {
        attempts++;
        await loadResult(searchId);
        if (attempts >= 15) {
          clearInterval(pollRef.current!);
          setPolling(false);
        }
      }, 2_000);
    });
  }

  async function loadResult(searchId: string) {
    const res = await fetch(`/api/search/${searchId}`);
    if (!res.ok) return;
    const data: SearchResult = await res.json();
    setResult(data);
    if (data.status === "completed") {
      setPolling(false);
      if (pollRef.current) clearInterval(pollRef.current);
    }
  }

  const usagePercent = searchLimit > 0
    ? Math.min((searchCountMonth / searchLimit) * 100, 100)
    : 0;

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Comparaison de prix</h1>
        <p className="text-slate-400 text-sm">
          Entrez un produit, une URL, un ASIN ou un code-barres pour obtenir le vrai coût total.
        </p>
      </div>

      {/* Barre de quota */}
      {searchLimit > 0 && (
        <div className="mb-6 px-4 py-3 rounded-xl border border-tp-cyan-500/15 bg-tp-navy-card">
          <div className="flex items-center justify-between mb-2 text-xs text-slate-400">
            <span>Recherches ce mois</span>
            <span className={searchCountMonth >= searchLimit ? "text-amber-400" : ""}>
              {searchCountMonth} / {searchLimit}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-tp-navy-600/60">
            <div
              className="h-1.5 rounded-full bg-tp-cyan-500 transition-all"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          {plan === "FREE" && (
            <p className="mt-2 text-xs text-slate-500">
              Plan FREE ·{" "}
              <a href="/dashboard/abonnement" className="text-tp-cyan-500 hover:underline">
                Passer à PREMIUM
              </a>{" "}
              pour 200 recherches/mois
            </p>
          )}
        </div>
      )}

      {/* Barre de recherche */}
      <div className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="iPhone 16 Pro, https://amazon.com/..., B0DXXXXXXX"
            className="w-full bg-tp-navy-card border border-tp-cyan-500/20 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-tp-cyan-500/50 transition-colors"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={pending || !query.trim()}
          className="flex items-center gap-2 bg-tp-cyan-500 text-tp-navy-700 font-semibold text-sm px-5 py-3 rounded-xl hover:-translate-y-0.5 hover:shadow-tp-glow transition-all disabled:opacity-60 disabled:translate-y-0 shrink-0"
        >
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          Comparer
        </button>
      </div>

      {/* Erreur */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm">
          {error}
        </div>
      )}

      {/* Chargement */}
      {(pending || polling) && !result && (
        <div className="rounded-xl border border-tp-cyan-500/15 bg-tp-navy-card p-10 text-center">
          <Loader2 size={32} className="text-tp-cyan-500 mx-auto mb-3 animate-spin" />
          <p className="text-white font-medium mb-1">Analyse en cours…</p>
          <p className="text-slate-500 text-sm">Comparaison des prix sur toutes les marketplaces</p>
        </div>
      )}

      {/* Résultats */}
      {result?.status === "completed" && result.search.offers.length > 0 && (
        <SearchResults
          offers={result.search.offers}
          aiSummary={result.search.aiSummary}
          searchQuery={result.search.query}
        />
      )}

      {/* Aucun résultat */}
      {result?.status === "completed" && result.search.offers.length === 0 && (
        <div className="rounded-xl border border-tp-cyan-500/15 bg-tp-navy-card p-10 text-center">
          <Search size={32} className="text-tp-cyan-500/30 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-white font-medium mb-1">Aucun résultat trouvé</p>
          <p className="text-slate-500 text-sm">Essayez un autre terme ou une URL directe.</p>
        </div>
      )}

      {/* Historique récent */}
      {!result && !pending && !polling && recentSearches.length > 0 && (
        <div>
          <h2 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <History size={15} className="text-tp-cyan-500" strokeWidth={1.75} />
            Recherches récentes
          </h2>
          <div className="space-y-2">
            {recentSearches.map((s) => (
              <button
                key={s.id}
                onClick={() => setQuery(s.query)}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl border border-tp-cyan-500/15 bg-tp-navy-card hover:border-tp-cyan-500/35 transition-colors text-left"
              >
                <Search size={14} className="text-slate-500 shrink-0" />
                <span className="flex-1 text-sm text-white truncate">{s.query}</span>
                {s.bestTruePrice && (
                  <span className="text-xs text-tp-cyan-500 font-medium shrink-0">
                    {s.bestTruePrice.toLocaleString("fr-CA", { style: "currency", currency: "CAD" })}
                  </span>
                )}
                <ArrowRight size={14} className="text-slate-600 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !pending && !polling && recentSearches.length === 0 && (
        <div className="rounded-xl border border-tp-cyan-500/15 bg-tp-navy-card p-10 text-center">
          <TrendingUp size={36} className="text-tp-cyan-500/30 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-white font-medium mb-1">Commencez votre première comparaison</p>
          <p className="text-slate-500 text-sm">
            Entrez le nom d'un produit ou collez une URL Amazon, Best Buy, Apple…
          </p>
        </div>
      )}
    </div>
  );
}

// ── SearchResults ─────────────────────────────────────────────────────────────

function SearchResults({
  offers,
  aiSummary,
  searchQuery,
}: {
  offers: Offer[];
  aiSummary: string | null;
  searchQuery: string;
}) {
  return (
    <div className="space-y-3">
      {aiSummary && (
        <div className="px-4 py-3 rounded-xl border border-tp-cyan-500/20 bg-tp-cyan-500/5 text-sm text-slate-300">
          {aiSummary}
        </div>
      )}

      {offers.map((offer, i) => (
        <OfferCard key={offer.id} offer={offer} isBest={i === 0} searchQuery={searchQuery} />
      ))}

      <p className="text-xs text-slate-600 text-center pt-1">
        Prix en CAD · Taux de change temps réel · Calculé selon votre adresse de livraison
      </p>
    </div>
  );
}

// ── OfferCard ─────────────────────────────────────────────────────────────────

function OfferCard({
  offer,
  isBest,
  searchQuery,
}: {
  offer: Offer;
  isBest: boolean;
  searchQuery: string;
}) {
  const [favorited, setFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const hasDiscount = offer.discounts.length > 0;
  const manualDiscounts = offer.discounts.filter((d) => !d.isAutoApplied);
  const isDiscounted = offer.priceOriginal > offer.priceCurrent + 0.01;

  const fmt = (n: number | null) =>
    n != null ? n.toLocaleString("fr-CA", { style: "currency", currency: "CAD" }) : "—";

  async function toggleFavorite() {
    if (favLoading) return;
    setFavLoading(true);
    try {
      if (favorited) {
        setFavorited(false);
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ searchQuery }),
        });
        setFavorited(true);
      }
    } catch {
      // silently ignore
    } finally {
      setFavLoading(false);
    }
  }

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all",
        isBest
          ? "border-tp-cyan-500/50 bg-tp-cyan-500/5 shadow-[0_0_20px_rgba(0,212,200,0.08)]"
          : "border-tp-cyan-500/15 bg-tp-navy-card",
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white font-semibold text-sm">
              {offer.marketplace?.name ?? offer.sellerName ?? offer.sellerCountry}
            </p>
            {isBest && (
              <span className="inline-flex items-center text-[9px] font-bold uppercase tracking-widest text-tp-cyan-500 bg-tp-cyan-500/10 border border-tp-cyan-500/30 px-2 py-0.5 rounded-full">
                MEILLEUR
              </span>
            )}
            {offer.isPrime && (
              <span className="text-[9px] font-bold tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">
                PRIME
              </span>
            )}
            {!offer.inStock && (
              <span className="text-[9px] font-semibold tracking-wide text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                RUPTURE
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            {offer.currency} · {offer.sellerCountry}
          </p>
        </div>

        {/* Prix + actions */}
        <div className="flex items-start gap-2 shrink-0">
          <div className="text-right">
            <p className="text-tp-cyan-500 font-bold text-xl leading-none">
              {fmt(offer.truePriceTotal)}
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">tout inclus CAD</p>
            {isDiscounted && (
              <p className="text-slate-600 text-xs line-through mt-0.5">
                {fmt(offer.priceOriginal)}
              </p>
            )}
          </div>

          {/* Bouton favori */}
          <button
            onClick={toggleFavorite}
            disabled={favLoading}
            aria-label={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              favorited
                ? "text-rose-400 bg-rose-500/10 hover:bg-rose-500/20"
                : "text-slate-500 hover:text-rose-400 hover:bg-rose-500/10",
            )}
          >
            {favorited
              ? <HeartOff size={15} strokeWidth={1.75} />
              : <Heart size={15} strokeWidth={1.75} />}
          </button>

          {/* Lien produit */}
          {offer.productUrl && (
            <a
              href={offer.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Voir sur le site"
              className="p-1.5 rounded-lg text-slate-500 hover:text-tp-cyan-500 hover:bg-tp-cyan-500/10 transition-colors"
            >
              <ExternalLink size={15} strokeWidth={1.75} />
            </a>
          )}
        </div>
      </div>

      {/* Segment bar */}
      {offer.truePriceTotal && <SegmentBar offer={offer} />}

      {/* Détail coûts */}
      <div className="mt-3 grid grid-cols-2 gap-1 text-xs text-slate-500">
        <span>Prix de base : <span className="text-slate-300">{fmt(offer.priceCurrent)}</span></span>
        <span>Livraison : <span className="text-slate-300">{fmt(offer.shippingCost)}</span></span>
        <span>Taxes : <span className="text-slate-300">{fmt(offer.taxAmount)}</span></span>
        <span>Douanes/courtage : <span className="text-slate-300">{fmt((offer.dutyAmount ?? 0) + (offer.brokerageFee ?? 0))}</span></span>
      </div>

      {/* Rabais */}
      {hasDiscount && (
        <div className="mt-3 pt-3 border-t border-tp-cyan-500/10 space-y-1.5">
          {offer.discounts.map((d) => (
            <DiscountBadge key={d.id} discount={d} />
          ))}
          {manualDiscounts.length > 0 && (
            <p className="text-[11px] text-amber-400/70 mt-1">
              ⚠ Certains rabais nécessitent une action avant de passer à la caisse.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── DiscountBadge ─────────────────────────────────────────────────────────────

const DISCOUNT_STYLES: Record<string, { icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; color: string; bg: string; border: string }> = {
  AUTOMATIC:   { icon: Zap,         color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  COUPON:      { icon: Tag,         color: "text-yellow-400",  bg: "bg-yellow-500/10",  border: "border-yellow-500/20"  },
  CONDITIONAL: { icon: ShoppingBag, color: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/20"  },
  MEMBERSHIP:  { icon: Users,       color: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/20"  },
  SALE:        { icon: Clock,       color: "text-rose-400",    bg: "bg-rose-500/10",    border: "border-rose-500/20"    },
  BUNDLE:      { icon: ShoppingBag, color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20"    },
  CASHBACK:    { icon: Gift,        color: "text-tp-cyan-500", bg: "bg-tp-cyan-500/10", border: "border-tp-cyan-500/20" },
};

function DiscountBadge({ discount }: { discount: Discount }) {
  const [isCopied, setIsCopied] = useState(false);

  const style = DISCOUNT_STYLES[discount.type] ?? DISCOUNT_STYLES.AUTOMATIC;
  const Icon  = style.icon;

  const expiresIn72h = discount.expiresAt
    ? new Date(discount.expiresAt).getTime() - Date.now() < 72 * 60 * 60 * 1_000
    : false;

  function copyCode() {
    if (!discount.code) return;
    navigator.clipboard.writeText(discount.code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2_000);
    });
  }

  const savings = discount.amountOff
    ? `−${discount.amountOff.toLocaleString("fr-CA", { style: "currency", currency: "CAD" })}`
    : discount.percentOff
    ? `−${discount.percentOff}%`
    : null;

  return (
    <div className={cn("flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs", style.bg, style.border)}>
      <Icon size={12} strokeWidth={1.75} className={style.color} />
      <span className={cn("font-medium flex-1", style.color)}>{discount.label}</span>
      {savings && <span className={cn("text-[11px] font-semibold", style.color)}>{savings}</span>}

      {discount.code && (
        <button
          onClick={copyCode}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
        >
          {isCopied ? <Check size={11} /> : <Copy size={11} />}
          <span className="font-mono tracking-wider">{discount.code}</span>
        </button>
      )}

      {expiresIn72h && discount.expiresAt && (
        <span className="text-[10px] text-amber-400">
          Se termine le {new Date(discount.expiresAt).toLocaleDateString("fr-CA")}
        </span>
      )}
    </div>
  );
}

// ── SegmentBar ────────────────────────────────────────────────────────────────

function SegmentBar({ offer }: { offer: Offer }) {
  const total    = offer.truePriceTotal ?? 1;
  const base     = ((offer.priceCurrent           / total) * 100).toFixed(1);
  const shipping = (((offer.shippingCost   ?? 0)  / total) * 100).toFixed(1);
  const tax      = (((offer.taxAmount      ?? 0)  / total) * 100).toFixed(1);
  const duty     = ((((offer.dutyAmount ?? 0) + (offer.brokerageFee ?? 0)) / total) * 100).toFixed(1);

  return (
    <div className="flex h-1.5 rounded-full overflow-hidden gap-px">
      <div className="rounded-full bg-tp-cyan-500" style={{ width: `${base}%`     }} title={`Base ${base}%`}        />
      <div className="rounded-full bg-blue-500"    style={{ width: `${shipping}%` }} title={`Livraison ${shipping}%`} />
      <div className="rounded-full bg-emerald-500" style={{ width: `${tax}%`      }} title={`Taxes ${tax}%`}         />
      <div className="rounded-full bg-amber-500"   style={{ width: `${duty}%`     }} title={`Douanes ${duty}%`}      />
    </div>
  );
}
