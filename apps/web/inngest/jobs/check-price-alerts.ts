import { inngest } from "@trueprice-ai/shared";
import { prisma, createNotification } from "@trueprice-ai/db";
import { sendEmail } from "@/lib/email";
import { PriceAlertEmail } from "@/emails/PriceAlertEmail";
import * as React from "react";

export const checkPriceAlerts = inngest.createFunction(
  {
    id: "check-price-alerts",
    triggers: [{ cron: "0 * * * *" }], // toutes les heures
  },
  async ({ step }) => {
    const triggered = await step.run("check-alerts", async () => {
      const alerts = await prisma.priceAlert.findMany({
        where:   { isActive: true, productId: { not: null } },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              variants: {
                where:   { isActive: true },
                select:  { id: true },
              },
            },
          },
          user: {
            select: { id: true, email: true, name: true },
          },
        },
      });

      let triggeredCount = 0;
      const since = new Date(Date.now() - 24 * 60 * 60 * 1_000); // dernières 24h

      for (const alert of alerts) {
        if (!alert.product?.variants.length) continue;

        const variantIds = alert.product.variants.map((v) => v.id);

        // Chercher une offre récente sous le prix cible
        const match = await prisma.productOffer.findFirst({
          where: {
            variantId:      { in: variantIds },
            truePriceTotal: { lte: alert.targetPrice },
            inStock:        true,
            scrapedAt:      { gte: since },
            ...(alert.marketplaceIds.length > 0 && {
              marketplaceId: { in: alert.marketplaceIds },
            }),
          },
          orderBy: { truePriceTotal: "asc" },
          include: {
            marketplace: { select: { name: true, slug: true } },
          },
        });

        if (!match) continue;

        // Déclencher l'alerte
        await prisma.priceAlert.update({
          where: { id: alert.id },
          data:  { triggeredAt: new Date(), isActive: false },
        });

        // Log usage
        await prisma.usageLog.create({
          data: {
            userId:   alert.user.id,
            action:   "alert:price_triggered",
            metadata: {
              alertId:        alert.id,
              productName:    alert.product.name,
              targetPrice:    alert.targetPrice.toString(),
              triggeredPrice: match.truePriceTotal?.toString(),
              marketplace:    match.marketplace?.name ?? "—",
            },
          },
        });

        triggeredCount++;
        console.log(
          `[check-price-alerts] alerte ${alert.id} déclenchée — ${alert.product.name} @ ${match.truePriceTotal} ${alert.currency}`,
        );

        // Notification in-app
        await createNotification({
          userId: alert.user.id,
          type:   "price_alert",
          title:  `Alerte prix — ${alert.product.name}`,
          body:   `Prix atteint : ${Number(match.truePriceTotal).toLocaleString("fr-CA")} ${alert.currency} sur ${match.marketplace?.name ?? "—"}`,
          link:   "/dashboard/alertes",
        });

        // Notification email (si préférence activée)
        const pref = await prisma.notificationPreference.findFirst({
          where: { userId: alert.user.id, type: "price_alert", channel: "EMAIL", enabled: true },
        });
        if (pref) {
          await sendEmail({
            to:      alert.user.email,
            subject: `Alerte prix — ${alert.product.name} à ${match.truePriceTotal} ${alert.currency}`,
            react:   React.createElement(PriceAlertEmail, {
              userName:       alert.user.name ?? alert.user.email,
              productName:    alert.product.name,
              targetPrice:    Number(alert.targetPrice),
              triggeredPrice: Number(match.truePriceTotal),
              currency:       alert.currency,
              marketplace:    match.marketplace?.name ?? "—",
              productUrl:     match.productUrl ?? undefined,
            }),
          });
        }
      }

      return { checked: alerts.length, triggered: triggeredCount };
    });

    return triggered;
  },
);
