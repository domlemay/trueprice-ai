import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma, getOrgWithMembers } from "@trueprice-ai/db";
import Link from "next/link";
import { Users, Mail, GitBranch, CreditCard, ShieldCheck } from "lucide-react";

export default async function OrgOverviewPage({ params }: { params: { orgId: string } }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const org = await getOrgWithMembers(params.orgId);
  if (!org) redirect("/dashboard/organisation");

  const activeMembers = org.memberships.filter((m) => !m.removedAt).length;
  const pendingInvites = org.invitations.length;
  const base = `/dashboard/organisation/${params.orgId}`;

  const stats = [
    { icon: Users,      label: "Membres actifs",       value: `${activeMembers} / ${org.maxSeats}`, href: `${base}/membres` },
    { icon: Mail,       label: "Invitations en attente", value: String(pendingInvites),              href: `${base}/invitations` },
    { icon: GitBranch,  label: "Succursales",           value: String(org.branches.length),          href: `${base}/succursales` },
    { icon: CreditCard, label: "Abonnement",            value: org.subscription?.status ?? "—",      href: `${base}/facturation` },
  ];

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{org.name}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{org.slug}</p>
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-amber-400 border border-amber-400/40 bg-amber-400/5 px-2.5 py-1 rounded-full">
          {org.plan}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-tp-navy-card border border-tp-cyan-500/15 rounded-xl p-5 hover:border-tp-cyan-500/30 transition-colors group"
          >
            <Icon size={18} className="text-tp-cyan-500 mb-3" strokeWidth={1.75} />
            <p className="text-2xl font-mono font-bold text-white">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {/* Sécurité */}
      {org.enforce2FA && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-tp-cyan-500/20 bg-tp-cyan-500/5 text-sm text-tp-cyan-500">
          <ShieldCheck size={16} strokeWidth={1.75} />
          L'authentification à deux facteurs est obligatoire pour tous les membres.
        </div>
      )}
    </div>
  );
}
