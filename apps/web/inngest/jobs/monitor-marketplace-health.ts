import { inngest } from "@trueprice-ai/shared";
import { prisma } from "@trueprice-ai/db";

// Lecture optionnelle des compteurs Redis (graceful si Redis absent)
async function getRedisCounters(slug: string, hourBucket: number) {
  try {
    const { redis } = await import("@/lib/redis");
    const [errors, total] = await Promise.all([
      redis.get<number>(`scrape:errors:${slug}:${hourBucket}`),
      redis.get<number>(`scrape:total:${slug}:${hourBucket}`),
    ]);
    return { errors: errors ?? 0, total: total ?? 0 };
  } catch {
    return { errors: 0, total: 0 };
  }
}

export const monitorMarketplaceHealth = inngest.createFunction(
  {
    id:       "monitor-marketplace-health",
    triggers: [{ cron: "*/30 * * * *" }], // toutes les 30 minutes
  },
  async ({ step }) => {
    const results = await step.run("check-marketplaces", async () => {
      const marketplaces = await prisma.marketplace.findMany({
        where:  { isActive: true },
        select: { id: true, slug: true, name: true, status: true },
      });

      const hourBucket = Math.floor(Date.now() / 3_600_000);
      let updatedCount = 0;

      for (const mkt of marketplaces) {
        const counters = await getRedisCounters(mkt.slug, hourBucket);

        // Pas de données Redis → pas de changement
        if (counters.total === 0) continue;

        const errorRate = counters.errors / counters.total;
        let newStatus: "OPERATIONAL" | "DEGRADED" | "DOWN" = "OPERATIONAL";

        if (errorRate >= 0.9)       newStatus = "DOWN";
        else if (errorRate >= 0.1)  newStatus = "DEGRADED";

        if (newStatus === mkt.status) continue;

        // Mettre à jour le statut
        await prisma.marketplace.update({
          where: { id: mkt.id },
          data:  { status: newStatus, lastCheckedAt: new Date() },
        });

        // Enregistrer dans l'historique
        await prisma.marketplaceStatusLog.create({
          data: {
            marketplaceId: mkt.id,
            status:        newStatus,
            message:       `Taux d'échec : ${Math.round(errorRate * 100)}% (${counters.errors}/${counters.total})`,
          },
        });

        // Résoudre l'entrée DEGRADED/DOWN précédente si on repasse OPERATIONAL
        if (newStatus === "OPERATIONAL") {
          await prisma.marketplaceStatusLog.updateMany({
            where: {
              marketplaceId: mkt.id,
              resolvedAt:    null,
              status:        { in: ["DEGRADED", "DOWN"] },
            },
            data: { resolvedAt: new Date() },
          });
        }

        console.log(`[monitor] ${mkt.name} : ${mkt.status} → ${newStatus} (erreurs ${Math.round(errorRate * 100)}%)`);
        updatedCount++;
      }

      return { checked: marketplaces.length, updated: updatedCount };
    });

    return results;
  },
);
