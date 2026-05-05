import { inngest } from "@trueprice-ai/shared";
import { prisma, createNotification } from "@trueprice-ai/db";
import { sendEmail } from "@/lib/email";
import { StockAlertEmail } from "@/emails/StockAlertEmail";
import * as React from "react";

export const checkStockAlerts = inngest.createFunction(
  {
    id: "check-stock-alerts",
    triggers: [{ cron: "30 * * * *" }], // toutes les heures (décalé de 30 min)
  },
  async ({ step }) => {
    const triggered = await step.run("check-alerts", async () => {
      const alerts = await prisma.stockAlert.findMany({
        where:   { isActive: true, productId: { not: null } },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              variants: {
                where:  { isActive: true },
                select: { id: true },
              },
            },
          },
          user: {
            select: { id: true, email: true, name: true },
          },
        },
      });

      let triggeredCount = 0;
      const since = new Date(Date.now() - 24 * 60 * 60 * 1_000);

      for (const alert of alerts) {
        if (!alert.product?.variants.length) continue;

        const variantIds = alert.product.variants.map((v) => v.id);

        const match = await prisma.productOffer.findFirst({
          where: {
            variantId:    { in: variantIds },
            inStock:      true,
            scrapedAt:    { gte: since },
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

        await prisma.stockAlert.update({
          where: { id: alert.id },
          data:  { triggeredAt: new Date(), isActive: false },
        });

        const mktName = match.marketplace?.name ?? match.marketplaceId ?? "—";

        await prisma.usageLog.create({
          data: {
            userId:   alert.user.id,
            action:   "alert:stock_triggered",
            metadata: {
              alertId:     alert.id,
              productName: alert.product.name,
              marketplace: mktName,
            },
          },
        });

        triggeredCount++;
        console.log(
          `[check-stock-alerts] alerte ${alert.id} déclenchée — ${alert.product.name} en stock sur ${mktName}`,
        );

        // Notification in-app
        await createNotification({
          userId: alert.user.id,
          type:   "stock_alert",
          title:  `Retour en stock — ${alert.product.name}`,
          body:   `Disponible sur ${mktName}`,
          link:   "/dashboard/alertes",
        });

        // Notification email
        const pref = await prisma.notificationPreference.findFirst({
          where: { userId: alert.user.id, type: "stock_alert", channel: "EMAIL", enabled: true },
        });
        if (pref) {
          await sendEmail({
            to:      alert.user.email,
            subject: `Retour en stock — ${alert.product.name} sur ${mktName}`,
            react:   React.createElement(StockAlertEmail, {
              userName:    alert.user.name ?? alert.user.email,
              productName: alert.product.name,
              marketplace: mktName,
              productUrl:  match.productUrl ?? undefined,
            }),
          });
        }
      }

      return { checked: alerts.length, triggered: triggeredCount };
    });

    return triggered;
  },
);
