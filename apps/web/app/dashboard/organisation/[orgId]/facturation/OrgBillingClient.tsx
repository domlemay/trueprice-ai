"use client";

import { useState } from "react";
import { CreditCard, Users, CheckCircle2, Loader2, ExternalLink } from "lucide-react";

type Org = {
  id: string; name: string; plan: string; maxSeats: number;
  subscription: { status: string; currentPeriodEnd: Date; seatsIncluded: number; cancelAtPeriodEnd: boolean } | null;
};

type PriceIds = { monthlyCAD: string; yearlyCAD: string; monthlyUSD: string; yearlyUSD: string };

export function OrgBillingClient({ orgId, org, isAdmin, priceIds }: {
  orgId: string; org: Org; isAdmin: boolean; priceIds: PriceIds;
}) {
  const [seats, setSeats] = useState(org.maxSeats);
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);

  const hasSubscription = !!org.subscription;
  const priceId = cycle === "monthly" ? priceIds.monthlyCAD : priceIds.yearlyCAD;

  async function handleCheckout() {
    setLoading(true);
    const res = await fetch("/api/checkout/org", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId, priceId, seats }),
    });
    const data = await res.json() as { url?: string; error?: string };
    if (data.url) window.location.href = data.url;
    else { alert(data.error ?? "Erreur"); setLoading(false); }
  }

  async function handlePortal() {
    setLoading(true);
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = await res.json() as { url?: string };
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  }

  return (
    <div className="max-w-xl space-y-5">
      {/* Statut abonnement */}
      {hasSubscription && org.subscription && (
        <div className="bg-tp-navy-card border border-tp-cyan-500/15 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={16} className="text-emerald-400" strokeWidth={2} />
            <span className="text-white font-semibold text-sm">Abonnement actif</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-500 text-xs">Statut</p>
              <p className="text-white font-mono">{org.subscription.status}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Sièges inclus</p>
              <p className="text-white font-mono">{org.subscription.seatsIncluded}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Renouvellement</p>
              <p className="text-white font-mono">
                {new Date(org.subscription.currentPeriodEnd).toLocaleDateString("fr-CA")}
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Annulation</p>
              <p className={org.subscription.cancelAtPeriodEnd ? "text-rose-400 font-mono" : "text-slate-400 font-mono"}>
                {org.subscription.cancelAtPeriodEnd ? "En fin de période" : "Non"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Checkout ou portal */}
      {isAdmin && (
        !hasSubscription ? (
          <div className="bg-tp-navy-card border border-tp-cyan-500/15 rounded-xl p-5 space-y-4">
            <h3 className="text-white font-semibold text-sm">Souscrire un abonnement</h3>

            <div className="flex gap-2">
              {(["monthly", "yearly"] as const).map((c) => (
                <button key={c} onClick={() => setCycle(c)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${cycle === c ? "border-tp-cyan-500/50 bg-tp-cyan-500/10 text-tp-cyan-500" : "border-slate-700 text-slate-400 hover:border-slate-600"}`}>
                  {c === "monthly" ? "Mensuel" : "Annuel (-17%)"}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block flex items-center gap-1.5">
                <Users size={12} /> Nombre de sièges
              </label>
              <input type="number" min={1} max={500} value={seats}
                onChange={(e) => setSeats(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-tp-navy-600/40 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-tp-cyan-500/50" />
              <p className="text-xs text-slate-500 mt-1">10 sièges inclus · sièges supplémentaires 9,99 $ CAD / siège / mois</p>
            </div>

            <button onClick={handleCheckout} disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-tp-cyan-500 text-tp-navy-700 font-semibold text-sm py-2.5 rounded-lg hover:-translate-y-0.5 hover:shadow-tp-glow transition-all disabled:opacity-60 disabled:translate-y-0">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
              Configurer l'abonnement
            </button>
          </div>
        ) : (
          <button onClick={handlePortal} disabled={loading}
            className="inline-flex items-center gap-2 border border-tp-cyan-500/25 text-tp-cyan-500 text-sm font-medium px-4 py-2.5 rounded-lg hover:border-tp-cyan-500/50 hover:bg-tp-cyan-500/5 transition-colors disabled:opacity-60">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <ExternalLink size={15} />}
            Gérer l'abonnement (Stripe Portal)
          </button>
        )
      )}
    </div>
  );
}
