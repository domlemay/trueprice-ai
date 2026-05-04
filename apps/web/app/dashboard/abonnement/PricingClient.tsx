"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Zap,
  Building2,
  CreditCard,
  ExternalLink,
  Loader2,
  User,
  Crown,
  ArrowRight,
} from "lucide-react";

type BillingCycle = "monthly" | "yearly";
type Currency = "CAD" | "USD";

type PriceIds = {
  premiumMonthlyCAD: string;
  premiumYearlyCAD: string;
  premiumMonthlyUSD: string;
  premiumYearlyUSD: string;
  enterpriseMonthlyCAD: string;
  enterpriseYearlyCAD: string;
  enterpriseMonthlyUSD: string;
  enterpriseYearlyUSD: string;
};

type PersonalPlan = {
  plan:          string;
  planExpiresAt: string | null;
  isTrialing:    boolean;
  trialEndsAt:   string | null;
};

type OrgPlan = {
  orgId:         string;
  orgName:       string;
  orgLogoUrl:    string | null;
  plan:          string;
  planExpiresAt: string | null;
  isTrialing:    boolean;
  trialEndsAt:   string | null;
  role:          string;
  maxSeats:      number;
};

type Props = {
  priceIds:     PriceIds;
  personalPlan: PersonalPlan;
  orgPlans:     OrgPlan[];
};

const PLAN_FEATURES: Record<"PREMIUM" | "ENTERPRISE", string[]> = {
  PREMIUM: [
    "200 recherches / mois",
    "Historique 90 jours",
    "Tous les marketplaces",
    "Export CSV / PDF",
    "20 alertes de prix",
    "10 listes de produits",
    "10 000 tokens IA / mois",
    "Rapports hebdomadaires",
    "Aucune publicité",
  ],
  ENTERPRISE: [
    "Recherches illimitées",
    "Historique 2 ans",
    "API publique + 5 clés API",
    "Organisations multi-membres",
    "10 sièges inclus",
    "50 000 tokens IA / mois",
    "Alertes illimitées",
    "Rapports hebdo + mensuels",
    "Accès fournisseurs (20)",
  ],
};

const PLAN_BADGE: Record<string, { label: string; color: string }> = {
  FREE:           { label: "FREE",       color: "text-slate-400 border-slate-600/40 bg-slate-500/5" },
  PREMIUM:        { label: "PREMIUM",    color: "text-tp-cyan-500 border-tp-cyan-500/40 bg-tp-cyan-500/5" },
  ENTERPRISE:     { label: "ENTREPRISE", color: "text-amber-400 border-amber-400/40 bg-amber-400/5" },
  ENTERPRISE_PRO: { label: "ENT. PRO",   color: "text-purple-400 border-purple-400/40 bg-purple-400/5" },
};

export function PricingClient({ priceIds, personalPlan, orgPlans }: Props) {
  const searchParams = useSearchParams();
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [currency] = useState<Currency>("CAD");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [portalPending, startPortalTransition] = useTransition();
  const [banner, setBanner] = useState<"success" | "canceled" | null>(null);

  useEffect(() => {
    if (searchParams.get("success") === "1") setBanner("success");
    else if (searchParams.get("canceled") === "1") setBanner("canceled");

    if (searchParams.get("success") || searchParams.get("canceled")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      url.searchParams.delete("canceled");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  function getPriceId(plan: "PREMIUM" | "ENTERPRISE"): string {
    if (plan === "PREMIUM") {
      return currency === "CAD"
        ? cycle === "monthly" ? priceIds.premiumMonthlyCAD : priceIds.premiumYearlyCAD
        : cycle === "monthly" ? priceIds.premiumMonthlyUSD : priceIds.premiumYearlyUSD;
    }
    return currency === "CAD"
      ? cycle === "monthly" ? priceIds.enterpriseMonthlyCAD : priceIds.enterpriseYearlyCAD
      : cycle === "monthly" ? priceIds.enterpriseMonthlyUSD : priceIds.enterpriseYearlyUSD;
  }

  async function handleCheckout(plan: "PREMIUM" | "ENTERPRISE") {
    const priceId = getPriceId(plan);
    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Erreur inconnue. Réessayez.");
        setLoadingPlan(null);
      }
    } catch {
      alert("Erreur de connexion. Vérifiez votre réseau.");
      setLoadingPlan(null);
    }
  }

  function handlePortal() {
    startPortalTransition(async () => {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
      else alert(data.error ?? "Portail indisponible.");
    });
  }

  const prices: Record<"PREMIUM" | "ENTERPRISE", Record<BillingCycle, Record<Currency, string>>> = {
    PREMIUM: {
      monthly: { CAD: "14,99 $ CAD", USD: "10,99 $ USD" },
      yearly:  { CAD: "149,90 $ CAD", USD: "109,90 $ USD" },
    },
    ENTERPRISE: {
      monthly: { CAD: "49,99 $ CAD", USD: "36,99 $ USD" },
      yearly:  { CAD: "479,90 $ CAD", USD: "359,90 $ USD" },
    },
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Bannières */}
      {banner === "success" && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-emerald-400">
          <CheckCircle2 size={20} strokeWidth={1.75} />
          <p className="text-sm font-medium">Abonnement activé avec succès. Bienvenue !</p>
          <button onClick={() => setBanner(null)} className="ml-auto text-emerald-400/60 hover:text-emerald-400">✕</button>
        </div>
      )}
      {banner === "canceled" && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-rose-400">
          <XCircle size={20} strokeWidth={1.75} />
          <p className="text-sm font-medium">Paiement annulé. Votre compte reste inchangé.</p>
          <button onClick={() => setBanner(null)} className="ml-auto text-rose-400/60 hover:text-rose-400">✕</button>
        </div>
      )}

      {/* En-tête */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Abonnement</h1>
        <p className="text-slate-400 text-sm">
          Gérez vos plans personnels et d'organisation depuis un seul endroit.
        </p>
      </div>

      {/* ── Plans actifs ──────────────────────────────────── */}
      <div className="mb-10 space-y-4">
        <h2 className="text-white font-semibold text-sm uppercase tracking-wider opacity-60">Plans actifs</h2>

        {/* Plan personnel */}
        <div className="flex items-center justify-between px-5 py-4 rounded-xl border border-tp-cyan-500/15 bg-tp-navy-card">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-tp-cyan-500/10 border border-tp-cyan-500/15 flex items-center justify-center shrink-0">
              <User size={16} className="text-tp-cyan-500" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm text-white font-medium">Compte personnel</p>
              <p className="text-xs text-slate-500">
                {personalPlan.isTrialing && personalPlan.trialEndsAt
                  ? `Essai jusqu'au ${new Date(personalPlan.trialEndsAt).toLocaleDateString("fr-CA")}`
                  : personalPlan.planExpiresAt
                    ? `Expire le ${new Date(personalPlan.planExpiresAt).toLocaleDateString("fr-CA")}`
                    : "Plan actif"
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${PLAN_BADGE[personalPlan.plan]?.color ?? PLAN_BADGE.FREE.color}`}>
              {PLAN_BADGE[personalPlan.plan]?.label ?? personalPlan.plan}
            </span>
            {personalPlan.plan === "FREE" && (
              <a href="#upgrade" className="text-xs text-tp-cyan-500 hover:underline flex items-center gap-1">
                Passer à Premium <ArrowRight size={11} />
              </a>
            )}
          </div>
        </div>

        {/* Plans organisations */}
        {orgPlans.map((org) => {
          const badge = PLAN_BADGE[org.plan] ?? PLAN_BADGE.ENTERPRISE;
          return (
            <div key={org.orgId} className="flex items-center justify-between px-5 py-4 rounded-xl border border-tp-cyan-500/15 bg-tp-navy-card">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center shrink-0 overflow-hidden">
                  {org.orgLogoUrl
                    ? <img src={org.orgLogoUrl} alt="" className="w-full h-full object-cover" />
                    : <Building2 size={16} className="text-amber-400" strokeWidth={1.75} />
                  }
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{org.orgName}</p>
                  <p className="text-xs text-slate-500">
                    {org.role} · {org.maxSeats} sièges
                    {org.isTrialing && org.trialEndsAt
                      ? ` · Essai jusqu'au ${new Date(org.trialEndsAt).toLocaleDateString("fr-CA")}`
                      : ""
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${badge.color}`}>
                  {badge.label}
                </span>
                <Link
                  href={`/dashboard/organisation/${org.orgId}/facturation`}
                  className="text-xs text-slate-400 hover:text-tp-cyan-500 transition-colors flex items-center gap-1"
                >
                  Gérer <ExternalLink size={11} />
                </Link>
              </div>
            </div>
          );
        })}

        {/* CTA créer une org */}
        {orgPlans.length === 0 && (
          <div className="flex items-center justify-between px-5 py-4 rounded-xl border border-dashed border-tp-cyan-500/15 bg-tp-navy-card/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg border border-dashed border-tp-cyan-500/20 flex items-center justify-center shrink-0">
                <Building2 size={16} className="text-slate-600" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm text-slate-400">Pas encore d'organisation</p>
                <p className="text-xs text-slate-600">Pour les équipes, PME et entreprises</p>
              </div>
            </div>
            <Link
              href="/dashboard/organisation"
              className="text-xs text-tp-cyan-500 hover:underline flex items-center gap-1"
            >
              <Crown size={11} />
              Créer une organisation
            </Link>
          </div>
        )}
      </div>

      {/* ── Changer de plan personnel ──────────────────────── */}
      <div id="upgrade" className="mb-6">
        <h2 className="text-white font-semibold text-sm uppercase tracking-wider opacity-60 mb-4">
          Changer de plan personnel
        </h2>
      </div>

      {/* Toggle cycle */}
      <div className="mb-8 flex items-center gap-4">
        <div className="inline-flex rounded-lg border border-tp-cyan-500/20 bg-tp-navy-600/40 p-1 gap-1">
          {(["monthly", "yearly"] as BillingCycle[]).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                cycle === c
                  ? "bg-tp-cyan-500/15 text-tp-cyan-500"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {c === "monthly" ? "Mensuel" : "Annuel"}
            </button>
          ))}
        </div>
        {cycle === "yearly" && (
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-400/30 bg-emerald-400/5 px-2.5 py-1 rounded-full">
            -17% économie
          </span>
        )}
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {(["PREMIUM", "ENTERPRISE"] as const).map((planId) => {
          const isFeatured = planId === "PREMIUM";
          const isLoading = loadingPlan === planId;
          const Icon = planId === "PREMIUM" ? Zap : Building2;
          const label = planId === "PREMIUM" ? "Premium" : "Entreprise";
          const badge = planId === "PREMIUM" ? "PREMIUM" : "ENTREPRISE";
          const badgeColor = isFeatured
            ? "text-tp-cyan-500 border-tp-cyan-500/40 bg-tp-cyan-500/5"
            : "text-amber-400 border-amber-400/40 bg-amber-400/5";

          return (
            <div
              key={planId}
              className={`relative rounded-xl border p-6 transition-colors ${
                isFeatured
                  ? "border-tp-cyan-500/35 bg-tp-cyan-500/5 shadow-tp-glow"
                  : "border-tp-cyan-500/15 bg-tp-navy-card hover:border-tp-cyan-500/25"
              }`}
            >
              {isFeatured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-xs font-bold uppercase tracking-widest text-tp-navy-700 bg-tp-cyan-500 px-3 py-1 rounded-full">
                    Recommandé
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <Icon size={20} className="text-tp-cyan-500" strokeWidth={1.75} />
                  <span className="text-white font-semibold text-lg">{label}</span>
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${badgeColor}`}>
                  {badge}
                </span>
              </div>

              <div className="mb-5">
                <span className="font-display text-3xl font-bold text-white">
                  {prices[planId][cycle][currency]}
                </span>
                <span className="text-slate-400 text-sm ml-1">
                  {cycle === "monthly" ? "/ mois" : "/ an"}
                </span>
              </div>

              <ul className="space-y-2 mb-6">
                {PLAN_FEATURES[planId].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 size={15} className="text-tp-cyan-500 mt-0.5 shrink-0" strokeWidth={2} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(planId)}
                disabled={isLoading || loadingPlan !== null}
                className="w-full rounded-lg bg-tp-cyan-500 text-tp-navy-700 font-semibold text-sm py-2.5 px-4 hover:-translate-y-0.5 hover:shadow-tp-glow transition-all disabled:opacity-60 disabled:translate-y-0 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Redirection…
                  </>
                ) : isFeatured ? (
                  "Commencer l'essai gratuit 14 jours"
                ) : (
                  "Passer à Entreprise"
                )}
              </button>

              {isFeatured && (
                <p className="text-center text-xs text-slate-500 mt-3">
                  Aucune carte requise pour l'essai · Annulation à tout moment
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Portail facturation */}
      <div className="rounded-xl border border-tp-cyan-500/15 bg-tp-navy-card p-6">
        <div className="flex items-center gap-3 mb-1">
          <CreditCard size={18} className="text-tp-cyan-500" strokeWidth={1.75} />
          <h2 className="text-white font-semibold">Gérer mon abonnement</h2>
        </div>
        <p className="text-slate-400 text-sm mb-4">
          Modifiez votre plan, mettez à jour votre moyen de paiement, consultez vos factures ou
          annulez depuis le portail sécurisé Stripe.
        </p>
        <button
          onClick={handlePortal}
          disabled={portalPending}
          className="inline-flex items-center gap-2 rounded-lg border border-tp-cyan-500/25 text-tp-cyan-500 text-sm font-medium px-4 py-2 hover:border-tp-cyan-500/50 hover:bg-tp-cyan-500/5 transition-colors disabled:opacity-60"
        >
          {portalPending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <ExternalLink size={15} strokeWidth={1.75} />
          )}
          Ouvrir le portail de facturation
        </button>
      </div>
    </div>
  );
}
