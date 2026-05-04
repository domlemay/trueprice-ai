import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma, isOrgAdmin } from "@trueprice-ai/db";
import { OrgSettingsClient } from "./OrgSettingsClient";

export default async function ParametresPage({ params }: { params: { orgId: string } }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) redirect("/dashboard");

  const [org, isAdmin] = await Promise.all([
    prisma.organization.findUnique({
      where:  { id: params.orgId },
      select: {
        id: true, name: true, website: true, slug: true,
        defaultCurrency: true, defaultLocale: true, defaultTimezone: true,
        referenceCurrency: true, historyRetentionDays: true,
        allowResultSharing: true, allowExternalSharing: true, enforce2FA: true,
      },
    }),
    isOrgAdmin(params.orgId, user.id),
  ]);
  if (!org) redirect("/dashboard/organisation");
  if (!isAdmin) redirect(`/dashboard/organisation/${params.orgId}`);

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-xl font-bold text-white">Paramètres</h2>
        <p className="text-slate-400 text-sm mt-0.5">Configuration générale de l'organisation.</p>
      </div>
      <OrgSettingsClient orgId={params.orgId} org={org} />
    </div>
  );
}
