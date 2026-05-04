import { prisma } from "../index";
import type { Plan, SubscriptionStatus } from "@prisma/client";

export async function upsertSubscription(data: {
  userId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  stripeCustomerId: string;
  plan: Plan;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: Date | null;
}): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.subscription.upsert({
      where:  { userId: data.userId },
      update: {
        stripeSubscriptionId: data.stripeSubscriptionId,
        stripePriceId:        data.stripePriceId,
        stripeCustomerId:     data.stripeCustomerId,
        plan:                 data.plan,
        status:               data.status,
        currentPeriodStart:   data.currentPeriodStart,
        currentPeriodEnd:     data.currentPeriodEnd,
        cancelAtPeriodEnd:    data.cancelAtPeriodEnd ?? false,
        canceledAt:           data.canceledAt ?? null,
      },
      create: {
        userId:               data.userId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        stripePriceId:        data.stripePriceId,
        stripeCustomerId:     data.stripeCustomerId,
        plan:                 data.plan,
        status:               data.status,
        currentPeriodStart:   data.currentPeriodStart,
        currentPeriodEnd:     data.currentPeriodEnd,
        cancelAtPeriodEnd:    data.cancelAtPeriodEnd ?? false,
        canceledAt:           data.canceledAt ?? null,
      },
    });

    // Sync plan sur le profil user
    await tx.user.update({
      where: { id: data.userId },
      data:  {
        plan:       data.plan,
        adsEnabled: data.plan === "FREE",
        isTrialing: data.status === "TRIALING",
      },
    });
  });
}

export async function cancelSubscription(userId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.subscription.update({
      where: { userId },
      data:  {
        status:    "CANCELED",
        canceledAt: new Date(),
      },
    });

    await tx.user.update({
      where: { id: userId },
      data:  {
        plan:        "FREE",
        adsEnabled:  true,
        isTrialing:  false,
        trialEndsAt: null,
        trialPlan:   null,
      },
    });
  });
}

export async function getSubscriptionByStripeId(stripeSubscriptionId: string) {
  return prisma.subscription.findUnique({
    where:   { stripeSubscriptionId },
    include: { user: true },
  });
}

export async function recordAiTokenPurchase(data: {
  userId: string;
  stripePaymentId: string;
  tokensAmount: number;
  pricePaid: number;
  currency: string;
}): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.aiTokenPurchase.create({
      data: {
        userId:          data.userId,
        stripePaymentId: data.stripePaymentId,
        tokensAmount:    data.tokensAmount,
        pricePaid:       data.pricePaid,
        currency:        data.currency,
      },
    });

    await tx.user.update({
      where: { id: data.userId },
      data:  { aiTokensLimit: { increment: data.tokensAmount } },
    });
  });
}
