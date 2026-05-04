import { inngest } from "@trueprice-ai/shared";
import { prisma } from "@trueprice-ai/db";
import { searchBestBuyCA } from "@/lib/scrapers/bestbuy-ca";
import { calculateTruePrice } from "@/lib/calculator";
import type { ScrapedOffer } from "@/lib/scrapers/types";

type Geo = { country: string; province: string; currency: string };

export const scrapeSearch = inngest.createFunction(
  { id: "scrape/price-search", retries: 3, triggers: [{ event: "scrape/price-search" }] },
  async ({ event, step }) => {
    const { searchId, query, geo } = event.data as {
      searchId: string;
      query:    string;
      geo:      Geo;
    };

    // ── Step 1 : scraping en parallèle ──────────────────────────────────────
    const rawOffers = await step.run("scrape-sources", async () => {
      const results = await Promise.allSettled([
        searchBestBuyCA(query, 5),
        // Phase 3B : ajouter Amazon PA API, Best Buy US, Apple, etc.
      ]);

      const offers: ScrapedOffer[] = [];
      for (const r of results) {
        if (r.status === "fulfilled") offers.push(...r.value);
        else console.error("[scrape] source failed:", r.reason);
      }
      return offers;
    });

    if (rawOffers.length === 0) return { searchId, offersCount: 0 };

    // ── Step 2 : résoudre les IDs marketplace en BD ──────────────────────────
    const slugs       = [...new Set(rawOffers.map((o) => o.marketplaceSlug))];
    const marketplaces = await step.run("resolve-marketplaces", () =>
      prisma.marketplace.findMany({
        where:  { slug: { in: slugs } },
        select: { id: true, slug: true },
      }),
    );
    const mktMap = Object.fromEntries(marketplaces.map((m) => [m.slug, m.id]));

    // ── Step 3 : calculer vrai coût et sauvegarder les offres ───────────────
    const userCtx = {
      country:  geo?.country  ?? "CA",
      province: geo?.province ?? "QC",
      currency: geo?.currency ?? "CAD",
    };

    await step.run("save-offers", async () => {
      let bestTotal  = Infinity;
      let bestMarket = "";

      for (const offer of rawOffers) {
        try {
          const calc = await calculateTruePrice(
            {
              priceCurrent:  offer.priceCurrent,
              priceOriginal: offer.priceOriginal,
              currency:      offer.currency,
              sellerCountry: offer.sellerCountry,
              shippingCost:  offer.shippingCost ?? 0,
            },
            userCtx,
          );

          const saved = await prisma.productOffer.create({
            data: {
              searchId,
              marketplaceId: mktMap[offer.marketplaceSlug] ?? null,
              sellerName:    offer.sellerName,
              sellerCountry: offer.sellerCountry,
              currency:      offer.currency,
              productUrl:    offer.productUrl,
              priceOriginal: offer.priceOriginal,
              priceCurrent:  offer.priceCurrent,
              exchangeRate:  calc.exchangeRate,
              shippingCost:  calc.shippingCost,
              dutyRate:      calc.dutyRate,
              dutyAmount:    calc.dutyAmount,
              taxRate:       calc.taxRate,
              taxAmount:     calc.taxAmount,
              brokerageFee:  calc.brokerageFee,
              truePriceTotal:calc.truePriceTotal,
              inStock:       offer.inStock,
            },
          });

          // Sauvegarder les rabais détectés
          if (offer.discounts?.length) {
            await prisma.discount.createMany({
              data: offer.discounts.map((d) => ({
                offerId:       saved.id,
                type:          d.type as never,
                label:         d.label,
                amount:        d.amount ?? null,
                percent:       d.percent ?? null,
                code:          d.code ?? null,
                isAutoApplied: d.isAutoApplied,
                expiresAt:     d.expiresAt ?? null,
              })),
            });
          }

          if (calc.truePriceTotal < bestTotal) {
            bestTotal  = calc.truePriceTotal;
            bestMarket = offer.marketplaceSlug;
          }
        } catch (err) {
          console.error("[scrape] offre ignorée:", err);
        }
      }

      if (bestMarket) {
        await prisma.priceSearch.update({
          where: { id: searchId },
          data:  { bestTruePrice: bestTotal, bestOfferMarket: bestMarket },
        });
      }
    });

    return { searchId, offersCount: rawOffers.length };
  },
);
