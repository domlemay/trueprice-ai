import { inngest } from "@trueprice-ai/shared";

// Stub Phase 2 — les scrapers réels sont implémentés en Phase 3
// Chaque step est retryable indépendamment (Inngest natif)
export const scrapeSearch = inngest.createFunction(
  { id: "scrape/price-search", retries: 3, triggers: [{ event: "scrape/price-search" }] },
  async ({ event, step }) => {
    const { searchId, query, geo } = event.data as {
      searchId: string;
      query: string;
      geo: { country: string; province: string; currency: string };
    };

    // Step 1 : vérifier le cache Redis (Phase 3C)
    await step.run("check-cache", async () => {
      // TODO Phase 3 : vérifier `price:{marketplace}:{sku}` dans Redis
      console.log(`[scrape] cache check — searchId=${searchId}`);
    });

    // Step 2 : dispatcher par marketplace (Phase 3B)
    await step.run("dispatch-scrapers", async () => {
      // TODO Phase 3 : appeler Amazon PA API, Best Buy API, Crawlee/Firecrawl
      console.log(`[scrape] dispatching — query="${query}" country=${geo.country}`);
    });

    // Step 3 : calculer vrai prix et sauvegarder (Phase 2D)
    await step.run("calculate-true-price", async () => {
      // TODO : appeler calculateTruePrice() pour chaque offre scrappée
      // puis prisma.priceSearch.update({ where: { id: searchId }, data: { bestTruePrice, bestOfferMarket } })
      console.log(`[scrape] calculating true price — searchId=${searchId}`);
    });

    return { searchId, status: "stub" };
  },
);
