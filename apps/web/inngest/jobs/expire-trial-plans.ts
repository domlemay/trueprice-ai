import { inngest } from "@trueprice-ai/shared";
import { prisma } from "@trueprice-ai/db";

export const expireTrialPlans = inngest.createFunction(
  {
    id: "expire-trial-plans",
    triggers: [{ cron: "0 6 * * *" }], // quotidien à 6h UTC
  },
  async ({ step }) => {
    const result = await step.run("expire-trials", async () => {
      const now = new Date();

      // Users en période d'essai expirée sans abonnement actif
      const expired = await prisma.user.findMany({
        where: {
          isTrialing:  true,
          trialEndsAt: { lt: now },
        },
        select: { id: true, email: true, trialEndsAt: true },
      });

      let downgraded = 0;
      for (const user of expired) {
        // Vérifier qu'aucune subscription active n'existe
        const activeSub = await prisma.subscription.findFirst({
          where: {
            userId: user.id,
            status: { in: ["ACTIVE", "TRIALING"] },
          },
        });
        if (activeSub) continue;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan:        "FREE",
            isTrialing:  false,
            trialEndsAt: null,
            trialPlan:   null,
            adsEnabled:  true,
          },
        });

        await prisma.usageLog.create({
          data: {
            userId:   user.id,
            action:   "plan:trial_expired",
            metadata: { trialEndsAt: user.trialEndsAt?.toISOString() },
          },
        });

        downgraded++;
        console.log(`[expire-trial-plans] user ${user.id} (${user.email}) → FREE`);
      }

      return { checked: expired.length, downgraded };
    });

    return result;
  },
);
