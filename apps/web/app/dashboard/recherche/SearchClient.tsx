"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Search, Loader2, History, ArrowRight, TrendingUp, Package } from "lucide-react";

type RecentSearch = {
  id: string;
  query: string;
  inputType: string;
  bestTruePrice: number | null;
  bestOfferMarket: string | null;
  createdAt: string;
  _count: { offers: number };
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

type Offer = {
  id: string;
  sellerName: string | null;
  sellerCountry: string;
  priceCurrent: number;
  currency: string;
  shippingCost: number | null;
  truePriceTotal: number | null;
  taxAmount: number | null;
  dutyAmount: number | null;
  brokerageFee: number | null;
  inStock: boolean;
  marketplace: { name: string; slug: string } | null;
};

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
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [polling, setPolling] = useState(false);
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

      // Sondage jusqu'à ce que les résultats soient disponibles (max 30s)
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

  const usagePercent = searchLimit > 0 ? Math.min((searchCountMonth / searchLimit) * 100, 100) : 0;

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
            <span className={searchCountMonth >= searchLimit ? "text-amber-400" : "text-slate-400"}>
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
              Plan FREE · <a href="/dashboard/abonnement" className="text-tp-cyan-500 hover:underline">Passer à PREMIUM</a> pour 200 recherches/mois
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

      {/* Résultats en attente */}
      {(pending || polling) && !result && (
        <div className="rounded-xl border border-tp-cyan-500/15 bg-tp-navy-card p-10 text-center">
          <Loader2 size={32} className="text-tp-cyan-500 mx-auto mb-3 animate-spin" />
          <p className="text-white font-medium mb-1">Analyse en cours…</p>
          <p className="text-slate-500 text-sm">Comparaison des prix sur toutes les marketplaces</p>
        </div>
      )}

      {/* Résultats */}
      {result?.status === "completed" && result.search.offers.length > 0 && (
        <SearchResults offers={result.search.offers} aiSummary={result.search.aiSummary} />
      )}

      {/* Message aucun résultat */}
      {result?.status === "completed" && result.search.offers.length === 0 && (
        <div className="rounded-xl border border-tp-cyan-500/15 bg-tp-navy-card p-10 text-center">
          <Package size={36} className="text-slate-600 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-slate-400 text-sm">Aucune offre trouvée pour cette recherche.</p>
          <p className="text-slate-600 text-xs mt-1">Le moteur de scraping est en cours de déploiement (Phase 3).</p>
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
                onClick={() => { setQuery(s.query); }}
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
          <p className="text-slate-500 text-sm">Entrez le nom d'un produit ou collez une URL Amazon, Best Buy, Apple…</p>
        </div>
      )}
    </div>
  );
}

function SearchResults({ offers, aiSummary }: { offers: Offer[]; aiSummary: string | null }) {
  const best = offers[0];

  const fmt = (n: number | null) =>
    n != null ? n.toLocaleString("fr-CA", { style: "currency", currency: "CAD" }) : "—";

  return (
    <div className="space-y-4">
      {aiSummary && (
        <div className="px-4 py-3 rounded-xl border border-tp-cyan-500/20 bg-tp-cyan-500/5 text-sm text-slate-300">
          {aiSummary}
        </div>
      )}

      {offers.map((offer, i) => {
        const isBest = i === 0;
        return (
          <div
            key={offer.id}
            className={`rounded-xl border p-4 ${
              isBest
                ? "border-tp-cyan-500/40 bg-tp-cyan-500/5 shadow-tp-glow"
                : "border-tp-cyan-500/15 bg-tp-navy-card"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-white font-semibold text-sm">
                  {offer.marketplace?.name ?? offer.sellerName ?? offer.sellerCountry}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {offer.currency} · {offer.sellerCountry}
                  {!offer.inStock && <span className="ml-2 text-amber-400">Rupture de stock</span>}
                </p>
              </div>
              <div className="text-right">
                {isBest && (
                  <span className="inline-block mb-1 text-[10px] font-bold uppercase tracking-wider text-tp-cyan-500 border border-tp-cyan-500/30 px-2 py-0.5 rounded-full">
                    Meilleur prix
                  </span>
                )}
                <p className="text-tp-cyan-500 font-bold text-lg">
                  {fmt(offer.truePriceTotal)}
                </p>
                <p className="text-slate-500 text-xs">tout inclus</p>
              </div>
            </div>

            {/* Segment bar */}
            {offer.truePriceTotal && (
              <SegmentBar offer={offer} />
            )}

            {/* Détail */}
            <div className="mt-3 grid grid-cols-2 gap-1 text-xs text-slate-500">
              <span>Prix de base : <span className="text-slate-300">{fmt(offer.priceCurrent)}</span></span>
              <span>Livraison : <span className="text-slate-300">{fmt(offer.shippingCost)}</span></span>
              <span>Taxes : <span className="text-slate-300">{fmt(offer.taxAmount)}</span></span>
              <span>Douanes/courtage : <span className="text-slate-300">{fmt((offer.dutyAmount ?? 0) + (offer.brokerageFee ?? 0))}</span></span>
            </div>
          </div>
        );
      })}

      {best && (
        <p className="text-xs text-slate-600 text-center pt-2">
          Prix en CAD · Taux de change temps réel · Calculé selon adresse de livraison
        </p>
      )}
    </div>
  );
}

function SegmentBar({ offer }: { offer: Offer }) {
  const total = offer.truePriceTotal ?? 1;
  const base     = ((offer.priceCurrent    / total) * 100).toFixed(1);
  const shipping = (((offer.shippingCost ?? 0)  / total) * 100).toFixed(1);
  const tax      = (((offer.taxAmount ?? 0)     / total) * 100).toFixed(1);
  const duty     = ((((offer.dutyAmount ?? 0) + (offer.brokerageFee ?? 0)) / total) * 100).toFixed(1);

  return (
    <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
      <div className="rounded-full bg-tp-cyan-500"       style={{ width: `${base}%`     }} title={`Base ${base}%`}     />
      <div className="rounded-full bg-blue-500"          style={{ width: `${shipping}%` }} title={`Livraison ${shipping}%`} />
      <div className="rounded-full bg-emerald-500"       style={{ width: `${tax}%`      }} title={`Taxes ${tax}%`}     />
      <div className="rounded-full bg-amber-500"         style={{ width: `${duty}%`     }} title={`Douanes ${duty}%`}  />
    </div>
  );
}
