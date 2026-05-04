import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma, isOrgMember } from "@trueprice-ai/db";
import Link from "next/link";
import { Building2, Users, Mail, GitBranch, Settings, CreditCard } from "lucide-react";

const NAV = [
  { href: "",              label: "Aperçu",      icon: Building2  },
  { href: "/membres",      label: "Membres",     icon: Users      },
  { href: "/invitations",  label: "Invitations", icon: Mail       },
  { href: "/succursales",  label: "Succursales", icon: GitBranch  },
  { href: "/facturation",  label: "Facturation", icon: CreditCard },
  { href: "/parametres",   label: "Paramètres",  icon: Settings   },
];

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { orgId: string };
}) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) redirect("/dashboard");

  if (!(await isOrgMember(params.orgId, user.id))) {
    redirect("/dashboard/organisation");
  }

  const org = await prisma.organization.findUnique({
    where:  { id: params.orgId },
    select: { name: true },
  });
  if (!org) redirect("/dashboard/organisation");

  const base = `/dashboard/organisation/${params.orgId}`;

  return (
    <div>
      {/* Fil d'Ariane */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/dashboard/organisation" className="hover:text-slate-300 transition-colors">
          Organisations
        </Link>
        <span>/</span>
        <span className="text-white font-medium">{org.name}</span>
      </div>

      {/* Nav org */}
      <nav className="flex gap-1 mb-8 border-b border-slate-800 pb-0 -mx-1 overflow-x-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const full = `${base}${href}`;
          return (
            <Link
              key={href}
              href={full}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-slate-400 hover:text-white whitespace-nowrap border-b-2 border-transparent hover:border-slate-600 transition-colors -mb-px"
            >
              <Icon size={14} strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
