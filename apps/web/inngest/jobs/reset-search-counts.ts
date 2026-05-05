import { inngest } from "@trueprice-ai/shared";
import { prisma } from "@trueprice-ai/db";

export const resetSearchCounts = inngest.createFunction(
  {
    id: "reset-search-counts",
    triggers: [{ cron: "0 0 1 * *" }], // 1er du mois à minuit UTC
  },
  async ({ step }) => {
    const result = await step.run("reset-counts", async () => {
      const now = new Date();

      const { count } = await prisma.user.updateMany({
        where: {
          searchCountMonth: { gt: 0 },
        },
        data: {
          searchCountMonth: 0,
          searchResetAt:    now,
        },
      });

      // Reset tokens IA en même temps (même cadence mensuelle)
      const { count: aiCount } = await prisma.user.updateMany({
        where: { aiTokensUsed: { gt: 0 } },
        data:  { aiTokensUsed: 0, aiTokensResetAt: now },
      });

      console.log(`[reset-search-counts] ${count} users reset (searches), ${aiCount} users reset (AI tokens)`);
      return { searchReset: count, aiTokensReset: aiCount };
    });

    return result;
  },
);
