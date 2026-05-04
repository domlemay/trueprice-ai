import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma, getUserOrgs } from "@trueprice-ai/db";
import { PricingClient } from "./PricingClient";

export default async function AbonnementPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where:  { clerkId },
    select: {
      id: true, plan: true, planExpiresAt: true,
      isTrialing: true, trialEndsAt: true,
    },
  });
  if (!user) redirect("/dashboard");

  const memberships = await getUserOrgs(user.id);

  const priceIds = {
    premiumMonthlyCAD:    process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY!,
    premiumYearlyCAD:     process.env.STRIPE_PRICE_ID_PREMIUM_YEARLY!,
    premiumMonthlyUSD:    process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY_USD!,
    premiumYearlyUSD:     process.env.STRIPE_PRICE_ID_PREMIUM_YEARLY_USD!,
    enterpriseMonthlyCAD: process.env.STRIPE_PRICE_ID_ENTERPRISE_MONTHLY!,
    enterpriseYearlyCAD:  process.env.STRIPE_PRICE_ID_ENTERPRISE_YEARLY!,
    enterpriseMonthlyUSD: process.env.STRIPE_PRICE_ID_ENTERPRISE_MONTHLY_USD!,
    enterpriseYearlyUSD:  process.env.STRIPE_PRICE_ID_ENTERPRISE_YEARLY_USD!,
  };

  const personalPlan = {
    plan:         user.plan,
    planExpiresAt: user.planExpiresAt?.toISOString() ?? null,
    isTrialing:   user.isTrialing,
    trialEndsAt:  user.trialEndsAt?.toISOString() ?? null,
  };

  const orgPlans = memberships.map((m) => ({
    orgId:        m.organization.id,
    orgName:      m.organization.name,
    orgLogoUrl:   m.organization.logoUrl,
    plan:         m.organization.plan,
    planExpiresAt: m.organization.planExpiresAt?.toISOString() ?? null,
    isTrialing:   m.organization.isTrialing,
    trialEndsAt:  m.organization.trialEndsAt?.toISOString() ?? null,
    role:         m.role,
    maxSeats:     m.organization.maxSeats,
  }));

  return (
    <Suspense>
      <PricingClient
        priceIds={priceIds}
        personalPlan={personalPlan}
        orgPlans={orgPlans}
      />
    </Suspense>
  );
}
