import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@trueprice-ai/db";
import { SearchClient } from "./SearchClient";

export default async function RecherchePage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where:  { clerkId },
    select: { id: true, plan: true, searchCountMonth: true },
  });
  if (!user) redirect("/dashboard");

  const recentSearches = await prisma.priceSearch.findMany({
    where:   { userId: user.id },
    orderBy: { createdAt: "desc" },
    take:    10,
    select: {
      id: true, query: true, inputType: true,
      bestTruePrice: true, bestOfferMarket: true,
      createdAt: true,
      _count: { select: { offers: true } },
    },
  });

  const PLAN_LIMITS: Record<string, number> = {
    FREE: 10, PREMIUM: 200, ENTERPRISE: -1, ENTERPRISE_PRO: -1,
  };
  const searchLimit = PLAN_LIMITS[user.plan] ?? 10;

  return (
    <SearchClient
      plan={user.plan}
      searchCountMonth={user.searchCountMonth}
      searchLimit={searchLimit}
      recentSearches={recentSearches.map((s) => ({
        ...s,
        bestTruePrice: s.bestTruePrice ? Number(s.bestTruePrice) : null,
        createdAt: s.createdAt.toISOString(),
      }))}
    />
  );
}
