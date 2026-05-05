import { inngest } from "@trueprice-ai/shared";
import { prisma } from "@trueprice-ai/db";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const RETENTION_DAYS = 30;

export const gdprDeleteUsers = inngest.createFunction(
  {
    id: "gdpr-delete-users",
    triggers: [{ cron: "0 3 * * *" }], // quotidien à 3h UTC
  },
  async ({ step }) => {
    const result = await step.run("delete-users", async () => {
      const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1_000);

      const users = await prisma.user.findMany({
        where: {
          gdprDeleteRequestedAt: { lt: cutoff, not: null },
        },
        select: { id: true, clerkId: true, email: true, stripeCustomerId: true },
      });

      let deleted = 0;
      for (const user of users) {
        try {
          // Annuler abonnements Stripe actifs
          if (stripe && user.stripeCustomerId) {
            const subs = await stripe.subscriptions.list({
              customer: user.stripeCustomerId,
              status:   "active",
            });
            for (const sub of subs.data) {
              await stripe.subscriptions.cancel(sub.id);
            }
          }

          // Supprimer l'utilisateur (cascade BD via Prisma relations)
          await prisma.user.delete({ where: { id: user.id } });

          deleted++;
          console.log(`[gdpr-delete-users] user ${user.id} (${user.email}) supprimé`);
        } catch (err) {
          console.error(`[gdpr-delete-users] erreur pour ${user.id}:`, err);
        }
      }

      return { found: users.length, deleted };
    });

    return result;
  },
);
