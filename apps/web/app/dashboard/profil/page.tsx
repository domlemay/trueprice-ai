import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect }          from "next/navigation";
import Link                  from "next/link";
import {
  User, MapPin, Bell, Shield, Globe, ChevronRight, CreditCard,
} from "lucide-react";
import { prisma } from "@trueprice-ai/db";

const PLAN_LABEL: Record<string, string> = {
  FREE:           "Gratuit",
  PREMIUM:        "Premium",
  ENTERPRISE:     "Entreprise",
  ENTERPRISE_PRO: "Entreprise Pro",
};

const sections = [
  {
    href:        "/dashboard/profil/localisation",
    icon:        Globe,
    title:       "Localisation",
    description: "Pays, devise, fuseau horaire et langue",
  },
  {
    href:        "/dashboard/profil/adresses",
    icon:        MapPin,
    title:       "Adresses de livraison",
    description: "Gérer vos adresses pour le calcul des taxes et frais",
  },
  {
    href:        "/dashboard/profil/notifications",
    icon:        Bell,
    title:       "Notifications",
    description: "Canaux et types d'alertes",
  },
  {
    href:        "/dashboard/profil/confidentialite",
    icon:        Shield,
    title:       "Confidentialité",
    description: "Consentements, export et suppression du compte",
  },
  {
    href:        "/dashboard/abonnement",
    icon:        CreditCard,
    title:       "Abonnement",
    description: "Plan actuel, facturation et mise à niveau",
  },
];

export default async function ProfilPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const [clerkUser, dbUser] = await Promise.all([
    currentUser(),
    prisma.user.findUnique({
      where:  { clerkId },
      select: { plan: true, preferredCurrency: true, preferredLocale: true, isTrialing: true, trialEndsAt: true },
    }),
  ]);

  if (!dbUser) redirect("/sign-in");

  const name    = clerkUser?.fullName ?? clerkUser?.firstName ?? "Utilisateur";
  const email   = clerkUser?.emailAddresses[0]?.emailAddress ?? "";
  const avatar  = clerkUser?.imageUrl;
  const plan    = dbUser.plan;
  const trialing = dbUser.isTrialing && dbUser.trialEndsAt && dbUser.trialEndsAt > new Date();

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-1">Mon profil</h1>
        <p className="text-slate-400 text-sm">Gérez vos informations et préférences de compte.</p>
      </div>

      {/* Carte identité */}
      <div className="rounded-xl border border-tp-cyan-500/15 bg-tp-navy-card p-5 mb-6 flex items-center gap-4">
        {avatar
          ? <img src={avatar} alt="" className="w-14 h-14 rounded-full object-cover shrink-0" />
          : (
            <div className="w-14 h-14 rounded-full bg-tp-cyan-500/10 border border-tp-cyan-500/20 flex items-center justify-center shrink-0">
              <User size={24} className="text-tp-cyan-500" strokeWidth={1.75} />
            </div>
          )
        }
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-base truncate">{name}</p>
          <p className="text-slate-400 text-sm truncate">{email}</p>
        </div>
        <div className="shrink-0 text-right">
          <span className={`
            inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border
            ${plan === "FREE"           ? "text-slate-400 bg-slate-500/10 border-slate-500/20" : ""}
            ${plan === "PREMIUM"        ? "text-tp-cyan-500 bg-tp-cyan-500/10 border-tp-cyan-500/30" : ""}
            ${plan === "ENTERPRISE"     ? "text-amber-400 bg-amber-500/10 border-amber-500/20" : ""}
            ${plan === "ENTERPRISE_PRO" ? "text-purple-400 bg-purple-500/10 border-purple-500/20" : ""}
          `}>
            {PLAN_LABEL[plan] ?? plan}
          </span>
          {trialing && (
            <p className="text-[10px] text-tp-cyan-500 mt-1">
              Essai jusqu&apos;au {dbUser.trialEndsAt!.toLocaleDateString("fr-CA", { day: "numeric", month: "short" })}
            </p>
          )}
        </div>
      </div>

      {/* Sections nav */}
      <div className="space-y-2">
        {sections.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 px-4 py-4 rounded-xl border border-tp-cyan-500/15 bg-tp-navy-card hover:border-tp-cyan-500/35 hover:bg-white/3 transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-tp-cyan-500/10 border border-tp-cyan-500/20 flex items-center justify-center shrink-0">
              <Icon size={16} className="text-tp-cyan-500" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm">{title}</p>
              <p className="text-slate-500 text-xs mt-0.5">{description}</p>
            </div>
            <ChevronRight size={15} className="text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" strokeWidth={1.75} />
          </Link>
        ))}
      </div>
    </div>
  );
}
