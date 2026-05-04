import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma, getUserPriceAlerts, getUserStockAlerts, ALERT_LIMITS } from "@trueprice-ai/db";
import { AlertesClient } from "./AlertesClient";

export default async function AlertesPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where:  { clerkId },
    select: { id: true, plan: true },
  });
  if (!user) redirect("/dashboard");

  const [priceAlerts, stockAlerts] = await Promise.all([
    getUserPriceAlerts(user.id),
    getUserStockAlerts(user.id),
  ]);

  const priceLimit = ALERT_LIMITS[user.plan] ?? 3;

  function serializeAlert<T extends { createdAt: Date; triggeredAt: Date | null; targetPrice?: { toNumber(): number } }>(a: T) {
    return {
      ...a,
      createdAt:   a.createdAt.toISOString(),
      triggeredAt: a.triggeredAt?.toISOString() ?? null,
      ...(a.targetPrice !== undefined ? { targetPrice: a.targetPrice.toNumber() } : {}),
    };
  }

  return (
    <AlertesClient
      priceAlerts={priceAlerts.map(serializeAlert)}
      stockAlerts={stockAlerts.map(serializeAlert)}
      plan={user.plan}
      priceAlertLimit={priceLimit}
    />
  );
}
