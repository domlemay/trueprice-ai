import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma, getUserOrgs } from "@trueprice-ai/db";
import Link from "next/link";
import { Building2, Plus, Users, ChevronRight } from "lucide-react";
import { CreateOrgButton } from "./CreateOrgButton";

export default async function OrganisationPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where:  { clerkId },
    select: { id: true, plan: true },
  });
  if (!user) redirect("/dashboard");

  const memberships = await getUserOrgs(user.id);
  const canCreate = user.plan === "ENTERPRISE" || user.plan === "ENTERPRISE_PRO";

  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Organisations</h1>
          <p className="text-slate-400 text-sm">
            Gérez vos espaces de travail d'équipe et leurs membres.
          </p>
        </div>
        {canCreate && <CreateOrgButton />}
      </div>

      {memberships.length === 0 ? (
        <div className="rounded-xl border border-tp-cyan-500/15 bg-tp-navy-card p-12 text-center">
          <Building2 size={40} className="text-tp-cyan-500/30 mx-auto mb-4" strokeWidth={1.5} />
          <h2 className="font-display text-xl font-semibold text-white mb-2">
            Aucune organisation
          </h2>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
            {canCreate
              ? "Créez votre première organisation pour collaborer avec votre équipe."
              : "Le plan Entreprise est requis pour créer et gérer des organisations."}
          </p>
          {canCreate ? (
            <CreateOrgButton variant="hero" />
          ) : (
            <Link
              href="/dashboard/abonnement"
              className="inline-flex items-center gap-2 bg-tp-cyan-500 text-tp-navy-700 font-semibold text-sm px-5 py-2.5 rounded-lg hover:-translate-y-0.5 hover:shadow-tp-glow transition-all"
            >
              Passer à Entreprise
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {memberships.map(({ organization: org, role }) => (
            <Link
              key={org.id}
              href={`/dashboard/organisation/${org.id}`}
              className="flex items-center gap-4 px-5 py-4 rounded-xl border border-tp-cyan-500/15 bg-tp-navy-card hover:border-tp-cyan-500/30 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-tp-cyan-500/10 border border-tp-cyan-500/20 flex items-center justify-center shrink-0">
                <Building2 size={18} className="text-tp-cyan-500" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{org.name}</p>
                <p className="text-slate-500 text-xs">{org.slug}</p>
              </div>
              <div className="flex items-center gap-3 text-slate-500 text-xs">
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                  role === "ADMIN"   ? "border-tp-cyan-500/40 text-tp-cyan-500" :
                  role === "MANAGER" ? "border-amber-400/40 text-amber-400" :
                  "border-slate-600 text-slate-400"
                }`}>{role}</span>
                <Users size={14} />
                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
