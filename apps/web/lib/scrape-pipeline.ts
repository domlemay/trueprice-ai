import { prisma } from "@trueprice-ai/db";
import { searchBestBuyCA }     from "./scrapers/bestbuy-ca";
import { searchBestBuyUS }     from "./scrapers/bestbuy-us";
import { searchAppleStoreCA, searchAppleStoreUS } from "./scrapers/apple-store";
import { searchAmazonCA, searchAmazonUS }          from "./scrapers/amazon-pa";
import { calculateTruePrice } from "./calculator";
import type { ScrapedOffer } from "./scrapers/types";

type Geo = { country: string; province: string; currency: string };

export async function runScrapePipeline(params: {
  searchId: string;
  query:    string;
  geo:      Geo;
}): Promise<{ searchId: string; offersCount: number }> {
  const { searchId, query, geo } = params;

  // Step 1: scraping en parallèle
  const results = await Promise.allSettled([
    searchBestBuyCA(query, 5),
    searchBestBuyUS(query, 5),
    searchAppleStoreCA(query, 3),
    searchAppleStoreUS(query, 3),
    searchAmazonCA(query, 5),
    searchAmazonUS(query, 5),
  ]);

  const rawOffers: ScrapedOffer[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") rawOffers.push(...r.value);
    else console.error("[scrape-pipeline] source failed:", r.reason);
  }

  if (rawOffers.length === 0) return { searchId, offersCount: 0 };

  // Step 2: résoudre les IDs marketplace en BD
  const slugs        = [...new Set(rawOffers.map((o) => o.marketplaceSlug))];
  const marketplaces = await prisma.marketplace.findMany({
    where:  { slug: { in: slugs } },
    select: { id: true, slug: true },
  });
  const mktMap = Object.fromEntries(marketplaces.map((m) => [m.slug, m.id]));

  // Step 3: calculer vrai coût et sauvegarder les offres
  const userCtx = {
    country:  geo?.country  ?? "CA",
    province: geo?.province ?? "QC",
    currency: geo?.currency ?? "CAD",
  };

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
      console.error("[scrape-pipeline] offre ignorée:", err);
    }
  }

  if (bestMarket) {
    await prisma.priceSearch.update({
      where: { id: searchId },
      data:  { bestTruePrice: bestTotal, bestOfferMarket: bestMarket },
    });
  }

  return { searchId, offersCount: rawOffers.length };
}
