import { currentUser } from "@clerk/nextjs/server";
import { getSessionPlan } from "@/lib/auth";
import { Search, TrendingUp, FileDown, Zap } from "lucide-react";

export default async function DashboardPage() {
  const [user, plan] = await Promise.all([currentUser(), getSessionPlan()]);

  const planLabel: Record<string, string> = {
    FREE: "Gratuit",
    PREMIUM: "Premium",
    ENTERPRISE: "Entreprise",
  };

  const planColor: Record<string, string> = {
    FREE: "text-slate-400 border-slate-700",
    PREMIUM: "text-tp-cyan-500 border-tp-cyan-500/30",
    ENTERPRISE: "text-amber-400 border-amber-400/30",
  };

  return (
    <div>
      {/* En-tête */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">
            Bonjour, {user?.firstName ?? "là"} 👋
          </h1>
          <p className="text-slate-400">Votre tableau de bord TruePriceAI</p>
        </div>
        <span
          className={`text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border ${planColor[plan]}`}
        >
          {planLabel[plan]}
        </span>
      </div>

      {/* Stats — placeholder Phase 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { icon: Search, label: "Recherches ce mois", value: "—", sub: "0 / 5 utilisées" },
          { icon: TrendingUp, label: "Économies détectées", value: "—", sub: "disponible bientôt" },
          { icon: FileDown, label: "Exports", value: "—", sub: plan === "FREE" ? "Premium requis" : "0 ce mois" },
          { icon: Zap, label: "Appels API", value: "—", sub: plan !== "ENTERPRISE" ? "Entreprise requis" : "0 ce mois" },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div
            key={label}
            className="bg-tp-navy-card border border-tp-cyan-500/15 rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <Icon size={18} className="text-tp-cyan-500" strokeWidth={1.75} />
              <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-2xl font-mono font-bold text-white">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Zone principale — placeholder */}
      <div className="rounded-xl border border-tp-cyan-500/15 bg-tp-navy-card p-12 text-center">
        <Search size={40} className="text-tp-cyan-500/40 mx-auto mb-4" strokeWidth={1.5} />
        <h2 className="font-display text-xl font-semibold text-white mb-2">
          Aucune recherche récente
        </h2>
        <p className="text-slate-400 text-sm max-w-sm mx-auto">
          La recherche de prix sera disponible dans la Phase 2. Revenez bientôt !
        </p>
      </div>
    </div>
  );
}
