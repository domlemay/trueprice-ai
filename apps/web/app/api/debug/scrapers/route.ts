import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { searchAmazonCA, searchAmazonUS }           from "@/lib/scrapers/amazon-pa";
import { searchBestBuyCA }                           from "@/lib/scrapers/bestbuy-ca";
import { searchBestBuyUS }                           from "@/lib/scrapers/bestbuy-us";
import { searchAppleStoreCA, searchAppleStoreUS }    from "@/lib/scrapers/apple-store";
import { searchWalmartCA }                           from "@/lib/scrapers/walmart-ca";
import { searchWalmartUS }                           from "@/lib/scrapers/walmart-us";
import { searchCostcoCA }                            from "@/lib/scrapers/costco-ca";
import { searchSerpApiShopping }                     from "@/lib/scrapers/serpapi";

// ── Dev-only guard ────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  // Defined at module level so the route returns 404 in prod immediately.
}

type ScraperResult = {
  slug:         string;
  label:        string;
  keyGated:     boolean;
  keyPresent:   boolean;
  status:       "ok" | "empty" | "error" | "skipped";
  count:        number;
  durationMs:   number;
  error?:       string;
  firstOffer?:  {
    sellerName:    string | null | undefined;
    priceCurrent:  number;
    currency:      string;
    productUrl:    string | null | undefined;
    inStock:       boolean;
  };
};

const SCRAPERS: Array<{
  slug:      string;
  label:     string;
  keyGated:  boolean;
  keyEnv?:   string;
  fn:        (q: string) => Promise<ReturnType<typeof searchAmazonCA>>;
}> = [
  {
    slug:     "apple.ca",
    label:    "Apple Store Canada",
    keyGated: false,
    fn:       (q) => searchAppleStoreCA(q, 3),
  },
  {
    slug:     "apple.com",
    label:    "Apple Store US",
    keyGated: false,
    fn:       (q) => searchAppleStoreUS(q, 3),
  },
  {
    slug:     "bestbuy.ca",
    label:    "Best Buy Canada",
    keyGated: false,
    fn:       (q) => searchBestBuyCA(q, 3),
  },
  {
    slug:     "bestbuy.com",
    label:    "Best Buy US",
    keyGated: true,
    keyEnv:   "BESTBUY_US_API_KEY",
    fn:       (q) => searchBestBuyUS(q, 3),
  },
  {
    slug:     "walmart.ca",
    label:    "Walmart Canada",
    keyGated: false,
    fn:       (q) => searchWalmartCA(q, 3),
  },
  {
    slug:     "walmart.com",
    label:    "Walmart US",
    keyGated: false,
    fn:       (q) => searchWalmartUS(q, 3),
  },
  {
    slug:     "costco.ca",
    label:    "Costco Canada",
    keyGated: false,
    fn:       (q) => searchCostcoCA(q, 3),
  },
  {
    slug:     "amazon.ca",
    label:    "Amazon Canada (PA API)",
    keyGated: true,
    keyEnv:   "AMAZON_PA_ACCESS_KEY",
    fn:       (q) => searchAmazonCA(q, 3),
  },
  {
    slug:     "amazon.com",
    label:    "Amazon US (PA API)",
    keyGated: true,
    keyEnv:   "AMAZON_PA_ACCESS_KEY",
    fn:       (q) => searchAmazonUS(q, 3),
  },
  {
    slug:     "serpapi.ca",
    label:    "SerpAPI Google Shopping CA",
    keyGated: true,
    keyEnv:   "SERPAPI_KEY",
    fn:       (q) => searchSerpApiShopping({ query: q, limit: 3, country: "ca" }),
  },
  {
    slug:     "serpapi.com",
    label:    "SerpAPI Google Shopping US",
    keyGated: true,
    keyEnv:   "SERPAPI_KEY",
    fn:       (q) => searchSerpApiShopping({ query: q, limit: 3, country: "us" }),
  },
];

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 });
  }

  const query = req.nextUrl.searchParams.get("q") ?? "iphone 15 pro";

  const tasks = SCRAPERS.map(async (scraper): Promise<ScraperResult> => {
    const keyPresent = scraper.keyGated
      ? !!(scraper.keyEnv && process.env[scraper.keyEnv])
      : true;

    const t0 = Date.now();

    try {
      const offers     = await scraper.fn(query);
      const durationMs = Date.now() - t0;
      const first      = offers[0];

      return {
        slug:       scraper.slug,
        label:      scraper.label,
        keyGated:   scraper.keyGated,
        keyPresent,
        status:     offers.length > 0 ? "ok" : "empty",
        count:      offers.length,
        durationMs,
        firstOffer: first
          ? {
              sellerName:   first.sellerName,
              priceCurrent: first.priceCurrent,
              currency:     first.currency,
              productUrl:   first.productUrl,
              inStock:      first.inStock,
            }
          : undefined,
      };
    } catch (err) {
      return {
        slug:       scraper.slug,
        label:      scraper.label,
        keyGated:   scraper.keyGated,
        keyPresent,
        status:     "error",
        count:      0,
        durationMs: Date.now() - t0,
        error:      err instanceof Error ? err.message : String(err),
      };
    }
  });

  const results = await Promise.all(tasks);

  const summary = {
    query,
    totalOffers:   results.reduce((s, r) => s + r.count, 0),
    working:       results.filter((r) => r.status === "ok").length,
    empty:         results.filter((r) => r.status === "empty").length,
    errors:        results.filter((r) => r.status === "error").length,
    missingKeys:   results.filter((r) => r.keyGated && !r.keyPresent).map((r) => r.slug),
  };

  return NextResponse.json({ summary, scrapers: results }, { status: 200 });
}
