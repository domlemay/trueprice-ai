import { prisma } from "../index";
import type { InputType } from "@prisma/client";

const PLAN_LIMITS: Record<string, number> = {
  FREE:           10,
  PREMIUM:        200,
  ENTERPRISE:     Infinity,
  ENTERPRISE_PRO: Infinity,
};

export async function createSearch(data: {
  userId?:         string;
  organizationId?: string;
  query:           string;
  inputType?:      InputType;
  productUrl?:     string;
  quantity?:       number;
  userCountry?:    string;
  userCurrency?:   string;
  userRegion?:     string;
  tags?:           string[];
}) {
  return prisma.priceSearch.create({
    data: {
      ...data,
      inputType: data.inputType ?? "KEYWORD",
      quantity:  data.quantity  ?? 1,
      tags:      data.tags      ?? [],
    },
  });
}

export async function deduplicateSearch(
  userId: string,
  query: string,
  withinHours = 6,
): Promise<string | null> {
  const cutoff = new Date(Date.now() - withinHours * 60 * 60 * 1_000);
  const existing = await prisma.priceSearch.findFirst({
    where: {
      userId,
      query,
      createdAt: { gte: cutoff },
      offers:    { some: {} },
    },
    orderBy: { createdAt: "desc" },
    select:  { id: true },
  });
  return existing?.id ?? null;
}

export async function getSearchById(id: string) {
  return prisma.priceSearch.findUnique({
    where: { id },
    include: {
      offers: {
        include: { discounts: true, marketplace: true },
        orderBy: { truePriceTotal: "asc" },
      },
      product: true,
    },
  });
}

export async function getUserSearchHistory(
  userId: string,
  limit = 20,
  cursor?: string,
) {
  return prisma.priceSearch.findMany({
    where:   { userId },
    orderBy: { createdAt: "desc" },
    take:    limit,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id:              true,
      query:           true,
      inputType:       true,
      bestTruePrice:   true,
      bestOfferMarket: true,
      aiSummary:       true,
      createdAt:       true,
      _count:          { select: { offers: true } },
    },
  });
}

export async function checkSearchQuota(
  userId: string,
  plan: string,
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { searchCountMonth: true },
  });
  if (!user) return { allowed: false, used: 0, limit: 0 };

  const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE;
  return { allowed: user.searchCountMonth < limit, used: user.searchCountMonth, limit };
}
