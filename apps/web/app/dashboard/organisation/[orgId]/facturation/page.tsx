import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma, isOrgAdmin } from "@trueprice-ai/db";
import { OrgBillingClient } from "./OrgBillingClient";

export default async function OrgFacturationPage({ params }: { params: { orgId: string } }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) redirect("/dashboard");

  const [org, isAdmin] = await Promise.all([
    prisma.organization.findUnique({
      where:   { id: params.orgId },
      include: { subscription: true },
    }),
    isOrgAdmin(params.orgId, user.id),
  ]);
  if (!org) redirect("/dashboard/organisation");

  const priceIds = {
    monthlyCAD: process.env.STRIPE_PRICE_ID_ENTERPRISE_MONTHLY!,
    yearlyCAD:  process.env.STRIPE_PRICE_ID_ENTERPRISE_YEARLY!,
    monthlyUSD: process.env.STRIPE_PRICE_ID_ENTERPRISE_MONTHLY_USD!,
    yearlyUSD:  process.env.STRIPE_PRICE_ID_ENTERPRISE_YEARLY_USD!,
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-xl font-bold text-white">Facturation</h2>
        <p className="text-slate-400 text-sm mt-0.5">
          Gérez l'abonnement et les sièges de votre organisation.
        </p>
      </div>
      <OrgBillingClient
        orgId={params.orgId}
        org={org}
        isAdmin={isAdmin}
        priceIds={priceIds}
      />
    </div>
  );
}
