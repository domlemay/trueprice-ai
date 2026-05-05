import { inngest } from "@trueprice-ai/shared";
import { prisma } from "@trueprice-ai/db";

export const cleanExpiredSearches = inngest.createFunction(
  {
    id: "clean-expired-searches",
    triggers: [{ cron: "0 2 * * *" }], // quotidien à 2h UTC
  },
  async ({ step }) => {
    const result = await step.run("delete-searches", async () => {
      const now = new Date();

      // Supprimer les recherches avec expiresAt dépassé
      const { count } = await prisma.priceSearch.deleteMany({
        where: {
          expiresAt: { lt: now, not: null },
        },
      });

      console.log(`[clean-expired-searches] ${count} recherches supprimées`);
      return { deleted: count };
    });

    return result;
  },
);
