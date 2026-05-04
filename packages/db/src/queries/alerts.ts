import { prisma } from "../index";

export const ALERT_LIMITS: Record<string, number> = {
  FREE:           3,
  PREMIUM:        20,
  ENTERPRISE:     -1,
  ENTERPRISE_PRO: -1,
};

// ── Price Alerts ──────────────────────────────────────────────────────────────

export async function checkPriceAlertQuota(
  userId: string,
  plan: string,
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const limit = ALERT_LIMITS[plan] ?? 3;
  const used  = await prisma.priceAlert.count({ where: { userId, isActive: true } });
  return { allowed: limit < 0 || used < limit, used, limit };
}

export async function createPriceAlert(data: {
  userId:         string;
  productId?:     string;
  targetPrice:    number;
  currency?:      string;
  marketplaceIds?: string[];
}) {
  return prisma.priceAlert.create({
    data: {
      userId:         data.userId,
      productId:      data.productId ?? null,
      targetPrice:    data.targetPrice,
      currency:       data.currency ?? "CAD",
      marketplaceIds: data.marketplaceIds ?? [],
      isActive:       true,
    },
    include: {
      product: { select: { id: true, name: true, imageUrl: true, brand: true } },
    },
  });
}

export async function getUserPriceAlerts(userId: string) {
  return prisma.priceAlert.findMany({
    where:   { userId },
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { id: true, name: true, imageUrl: true, brand: true } },
    },
  });
}

export async function deletePriceAlert(userId: string, alertId: string) {
  const alert = await prisma.priceAlert.findFirst({ where: { id: alertId, userId } });
  if (!alert) return null;
  return prisma.priceAlert.delete({ where: { id: alertId } });
}

export async function togglePriceAlert(userId: string, alertId: string, isActive: boolean) {
  const alert = await prisma.priceAlert.findFirst({ where: { id: alertId, userId } });
  if (!alert) return null;
  return prisma.priceAlert.update({ where: { id: alertId }, data: { isActive } });
}

// ── Stock Alerts ──────────────────────────────────────────────────────────────

export async function createStockAlert(data: {
  userId:          string;
  productId?:      string;
  marketplaceIds?: string[];
}) {
  return prisma.stockAlert.create({
    data: {
      userId:         data.userId,
      productId:      data.productId ?? null,
      marketplaceIds: data.marketplaceIds ?? [],
      isActive:       true,
    },
    include: {
      product: { select: { id: true, name: true, imageUrl: true, brand: true } },
    },
  });
}

export async function getUserStockAlerts(userId: string) {
  return prisma.stockAlert.findMany({
    where:   { userId },
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { id: true, name: true, imageUrl: true, brand: true } },
    },
  });
}

export async function deleteStockAlert(userId: string, alertId: string) {
  const alert = await prisma.stockAlert.findFirst({ where: { id: alertId, userId } });
  if (!alert) return null;
  return prisma.stockAlert.delete({ where: { id: alertId } });
}

export async function toggleStockAlert(userId: string, alertId: string, isActive: boolean) {
  const alert = await prisma.stockAlert.findFirst({ where: { id: alertId, userId } });
  if (!alert) return null;
  return prisma.stockAlert.update({ where: { id: alertId }, data: { isActive } });
}
