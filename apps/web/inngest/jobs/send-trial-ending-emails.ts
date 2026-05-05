import { inngest } from "@trueprice-ai/shared";
import { prisma } from "@trueprice-ai/db";
import { sendEmail } from "@/lib/email";
import { TrialEndingEmail } from "@/emails/TrialEndingEmail";
import * as React from "react";

export const sendTrialEndingEmails = inngest.createFunction(
  {
    id: "send-trial-ending-emails",
    triggers: [{ cron: "0 10 * * *" }], // quotidien à 10h UTC
  },
  async ({ step }) => {
    const result = await step.run("send-emails", async () => {
      const in3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1_000);
      const in4Days = new Date(Date.now() + 4 * 24 * 60 * 60 * 1_000);

      // Users dont l'essai se termine dans ~3 jours et qu'on n'a pas encore notifié
      const users = await prisma.user.findMany({
        where: {
          isTrialing:  true,
          trialEndsAt: { gte: in3Days, lt: in4Days },
        },
        select: { id: true, email: true, name: true, trialEndsAt: true },
      });

      let sent = 0;
      for (const user of users) {
        const endsAt = user.trialEndsAt?.toLocaleDateString("fr-CA", {
          day: "numeric", month: "long", year: "numeric",
        }) ?? "—";

        const { error } = await sendEmail({
          to:      user.email,
          subject: `Votre essai PREMIUM se termine le ${endsAt}`,
          react:   React.createElement(TrialEndingEmail, {
            userName:    user.name ?? user.email,
            trialEndsAt: endsAt,
            upgradeUrl:  "https://truepricai.ca/dashboard/abonnement#upgrade",
          }),
        });

        await prisma.usageLog.create({
          data: {
            userId:   user.id,
            action:   "email:trial_ending_sent",
            metadata: { trialEndsAt: user.trialEndsAt?.toISOString(), error: error ?? null },
          },
        });

        if (!error) sent++;
        console.log(`[send-trial-ending-emails] ${user.email} — ${error ?? "envoyé"}`);
      }

      return { found: users.length, sent };
    });

    return result;
  },
);
