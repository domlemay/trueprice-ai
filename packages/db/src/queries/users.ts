import { prisma } from "../index";
import type { Plan, User } from "@prisma/client";

export async function createUser(data: {
  clerkId: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  stripeCustomerId?: string | null;
}): Promise<User> {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        clerkId: data.clerkId,
        email: data.email,
        name: data.name ?? null,
        avatarUrl: data.avatarUrl ?? null,
        stripeCustomerId: data.stripeCustomerId ?? null,
        plan: "FREE",
        role: "USER",
        adsEnabled: true,
      },
    });

    // Préférences de notification par défaut
    await tx.notificationPreference.createMany({
      data: [
        { userId: user.id, type: "price_alert",    channel: "EMAIL",  enabled: true },
        { userId: user.id, type: "price_alert",    channel: "IN_APP", enabled: true },
        { userId: user.id, type: "stock_alert",    channel: "EMAIL",  enabled: true },
        { userId: user.id, type: "stock_alert",    channel: "IN_APP", enabled: true },
        { userId: user.id, type: "report_weekly",  channel: "EMAIL",  enabled: true },
        { userId: user.id, type: "changelog",      channel: "IN_APP", enabled: true },
      ],
    });

    return user;
  });
}

export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { clerkId } });
}

export async function getUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function updateUserStripeCustomer(
  clerkId: string,
  stripeCustomerId: string
): Promise<void> {
  await prisma.user.update({
    where: { clerkId },
    data: { stripeCustomerId },
  });
}

export async function updateUserPlan(
  userId: string,
  plan: Plan,
  opts?: { expiresAt?: Date; isTrialing?: boolean; trialEndsAt?: Date; trialPlan?: Plan }
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      plan,
      planExpiresAt: opts?.expiresAt ?? null,
      isTrialing:   opts?.isTrialing ?? false,
      trialEndsAt:  opts?.trialEndsAt ?? null,
      trialPlan:    opts?.trialPlan ?? null,
      adsEnabled:   plan === "FREE",
    },
  });
}

export async function syncUserFromClerk(
  clerkId: string,
  data: { email?: string; name?: string | null; avatarUrl?: string | null }
): Promise<void> {
  await prisma.user.update({
    where: { clerkId },
    data: {
      ...(data.email     && { email: data.email }),
      ...(data.name      !== undefined && { name: data.name }),
      ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
    },
  });
}

export async function requestAccountDeletion(clerkId: string): Promise<void> {
  await prisma.user.update({
    where: { clerkId },
    data: { gdprDeleteRequestedAt: new Date() },
  });
}

export async function incrementSearchCount(userId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });

    // Reset mensuel si nécessaire
    const now = new Date();
    const resetNeeded =
      user.searchResetAt.getMonth() !== now.getMonth() ||
      user.searchResetAt.getFullYear() !== now.getFullYear();

    await tx.user.update({
      where: { id: userId },
      data: {
        searchCountMonth: resetNeeded ? 1 : { increment: 1 },
        searchResetAt:    resetNeeded ? now : undefined,
      },
    });
  });
}

export async function consumeAiTokens(userId: string, amount: number): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });

    const now = new Date();
    const resetNeeded =
      user.aiTokensResetAt.getMonth() !== now.getMonth() ||
      user.aiTokensResetAt.getFullYear() !== now.getFullYear();

    await tx.user.update({
      where: { id: userId },
      data: {
        aiTokensUsed:    resetNeeded ? amount : { increment: amount },
        aiTokensResetAt: resetNeeded ? now : undefined,
      },
    });
  });
}
