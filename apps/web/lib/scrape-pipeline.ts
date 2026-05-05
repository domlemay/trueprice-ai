import { prisma } from "@trueprice-ai/db";
import { searchBestBuyCA }                from "./scrapers/bestbuy-ca";
import { searchBestBuyUS }                from "./scrapers/bestbuy-us";
import { searchAppleStoreCA, searchAppleStoreUS } from "./scrapers/apple-store";
import { searchAmazonCA, searchAmazonUS }  from "./scrapers/amazon-pa";
import { searchWalmartCA }                 from "./scrapers/walmart-ca";
import { searchWalmartUS }                 from "./scrapers/walmart-us";
import { searchCostcoCA }                  from "./scrapers/costco-ca";
import { calculateTruePrice }              from "./calculator";
import { linkOfferToProduct }              from "./product-catalog";
import type { ScrapedOffer }               from "./scrapers/types";

type Geo = { country: string; province: string; currency: string };

// ─── Registre des scrapers par slug ───────────────────────────────────────────

type ScraperFn = (query: string, limit: number) => Promise<ScrapedOffer[]>;

const SCRAPERS: Record<string, ScraperFn> = {
  "amazon.ca":   (q, n) => searchAmazonCA(q, n),
  "amazon.com":  (q, n) => searchAmazonUS(q, n),
  "bestbuy.ca":  (q, n) => searchBestBuyCA(q, n),
  "bestbuy.com": (q, n) => searchBestBuyUS(q, n),
  "apple.ca":    (q, n) => searchAppleStoreCA(q, n),
  "apple.com":   (q, n) => searchAppleStoreUS(q, n),
  "walmart.ca":  (q, n) => searchWalmartCA(q, n),
  "walmart.com": (q, n) => searchWalmartUS(q, n),
  "costco.ca":   (q, n) => searchCostcoCA(q, n),
};

const ALL_SLUGS = Object.keys(SCRAPERS);

// ─── Helpers Redis (optionnel en dev) ─────────────────────────────────────────

function normalizeQuery(q: string) {
  return q.toLowerCase().replace(/\s+/g, "_").slice(0, 80);
}

async function cacheGet(key: string): Promise<ScrapedOffer[] | null> {
  try {
    const { redis } = await import("./redis");
    return await redis.get<ScrapedOffer[]>(key);
  } catch { return null; }
}

async function cacheSet(key: string, value: ScrapedOffer[]) {
  try {
    const { redis } = await import("./redis");
    await redis.set(key, value, { ex: 6 * 60 * 60 }); // TTL 6h
  } catch { /* Redis optionnel */ }
}

async function trackScrapeAttempt(slug: string, success: boolean) {
  try {
    const { redis } = await import("./redis");
    const bucket    = Math.floor(Date.now() / 3_600_000);
    const totalKey  = `scrape:total:${slug}:${bucket}`;
    const errorKey  = `scrape:errors:${slug}:${bucket}`;
    await redis.incr(totalKey);
    await redis.expire(totalKey, 7_200); // 2 heures
    if (!success) {
      await redis.incr(errorKey);
      await redis.expire(errorKey, 7_200);
    }
  } catch { /* Redis optionnel */ }
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

export async function runScrapePipeline(params: {
  searchId:           string;
  query:              string;
  geo:                Geo;
  marketplaceSlugs?:  string[];  // si absent → toutes les marketplaces
}): Promise<{ searchId: string; offersCount: number }> {
  const { searchId, query, geo, marketplaceSlugs } = params;
  const slugsToRun = marketplaceSlugs?.length ? marketplaceSlugs : ALL_SLUGS;
  const nKey       = normalizeQuery(query);

  // Step 1: scraping en parallèle avec cache Redis par marketplace
  const scrapeTasks = slugsToRun.map(async (slug): Promise<ScrapedOffer[]> => {
    const fn = SCRAPERS[slug];
    if (!fn) return [];

    const cacheKey = `scrape:${slug}:${nKey}`;
    const cached   = await cacheGet(cacheKey);
    if (cached) return cached;

    try {
      const offers = await fn(query, 5);
      await cacheSet(cacheKey, offers);
      await trackScrapeAttempt(slug, true);
      return offers;
    } catch (err) {
      console.error(`[scrape-pipeline] ${slug} failed:`, err);
      await trackScrapeAttempt(slug, false);
      return [];
    }
  });

  const settled  = await Promise.allSettled(scrapeTasks);
  const rawOffers: ScrapedOffer[] = [];
  for (const r of settled) {
    if (r.status === "fulfilled") rawOffers.push(...r.value);
  }

  if (rawOffers.length === 0) return { searchId, offersCount: 0 };

  // Step 2: résoudre les IDs marketplace en BD
  const slugs        = [...new Set(rawOffers.map((o) => o.marketplaceSlug))];
  const marketplaces = await prisma.marketplace.findMany({
    where:  { slug: { in: slugs } },
    select: { id: true, slug: true },
  });
  const mktMap = Object.fromEntries(marketplaces.map((m) => [m.slug, m.id]));

  // Step 3: calculer vrai coût, sauvegarder les offres, enregistrer catalog
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

      const mktId = mktMap[offer.marketplaceSlug] ?? null;

      const saved = await prisma.productOffer.create({
        data: {
          searchId,
          marketplaceId:  mktId,
          sellerName:     offer.sellerName,
          sellerCountry:  offer.sellerCountry,
          currency:       offer.currency,
          productUrl:     offer.productUrl,
          priceOriginal:  offer.priceOriginal,
          priceCurrent:   offer.priceCurrent,
          exchangeRate:   calc.exchangeRate,
          shippingCost:   calc.shippingCost,
          dutyRate:       calc.dutyRate,
          dutyAmount:     calc.dutyAmount,
          taxRate:        calc.taxRate,
          taxAmount:      calc.taxAmount,
          brokerageFee:   calc.brokerageFee,
          truePriceTotal: calc.truePriceTotal,
          inStock:        offer.inStock,
          isPrime:        offer.isPrime ?? false,
        },
      });

      if (offer.discounts?.length) {
        await prisma.discount.createMany({
          data: offer.discounts.map((d) => ({
            offerId:       saved.id,
            type:          d.type as never,
            label:         d.label,
            amountOff:     d.amount  ?? null,
            percentOff:    d.percent ?? null,
            code:          d.code    ?? null,
            isAutoApplied: d.isAutoApplied,
            expiresAt:     d.expiresAt ?? null,
          })),
        });
      }

      await linkOfferToProduct(offer, saved.id, mktId);

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
