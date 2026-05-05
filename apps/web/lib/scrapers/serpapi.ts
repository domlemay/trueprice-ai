import type { ScrapedOffer } from "./types";

// Key-gated — returns [] if SERPAPI_KEY is absent.
// Used as a discovery layer for marketplaces without a clean internal API.

type SerpApiShoppingResult = {
  title?:         string;
  link?:          string;
  price?:         string;  // "$99.99"
  extracted_price?: number;
  old_price?:     string;
  extracted_old_price?: number;
  source?:        string;  // "Walmart", "Best Buy"
  thumbnail?:     string;
  in_stock?:      boolean;
  product_id?:    string;
};

type SerpApiResponse = {
  shopping_results?: SerpApiShoppingResult[];
  error?:            string;
};

const BASE_URL = "https://serpapi.com/search.json";

function normalizePrice(raw: string | undefined): number {
  if (!raw) return 0;
  return Number(raw.replace(/[^0-9.]/g, "")) || 0;
}

export async function searchSerpApiShopping(params: {
  query:          string;
  limit?:         number;
  country?:       string; // "ca" | "us"
  marketplace?:   string; // Filters results to a specific source (partial match)
}): Promise<ScrapedOffer[]> {
  const key = process.env.SERPAPI_KEY;
  if (!key) return [];

  const { query, limit = 5, country = "ca", marketplace } = params;

  try {
    const url = new URL(BASE_URL);
    url.searchParams.set("engine",    "google_shopping");
    url.searchParams.set("q",         query);
    url.searchParams.set("gl",        country);       // geo
    url.searchParams.set("hl",        country === "ca" ? "fr" : "en");
    url.searchParams.set("num",       String(limit * 3)); // over-fetch, filter after
    url.searchParams.set("api_key",   key);

    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(12_000),
    });

    if (!res.ok) return [];

    const data = await res.json() as SerpApiResponse;
    if (data.error || !Array.isArray(data.shopping_results)) return [];

    let results = data.shopping_results;
    if (marketplace) {
      results = results.filter((r) =>
        r.source?.toLowerCase().includes(marketplace.toLowerCase()),
      );
    }

    return results.slice(0, limit).map((r) => {
      const priceCurrent  = r.extracted_price ?? normalizePrice(r.price);
      const priceOriginal = (r.extracted_old_price ?? normalizePrice(r.old_price)) || priceCurrent;
      const isCA          = country === "ca";
      const discounts: ScrapedOffer["discounts"] = [];

      if (priceOriginal > priceCurrent) {
        discounts.push({
          type:          "SALE",
          label:         isCA
            ? `Économisez ${(priceOriginal - priceCurrent).toFixed(2)} $`
            : `Save $${(priceOriginal - priceCurrent).toFixed(2)}`,
          amount:        priceOriginal - priceCurrent,
          isAutoApplied: true,
        });
      }

      return {
        marketplaceSlug: isCA ? "google-shopping.ca" : "google-shopping.com",
        sellerCountry:   isCA ? "CA" : "US",
        currency:        isCA ? "CAD" : "USD",
        priceCurrent,
        priceOriginal,
        inStock:         r.in_stock !== false,
        productUrl:      r.link ?? "",
        sellerName:      r.source ?? (isCA ? "Inconnu (CA)" : "Unknown (US)"),
        shippingCost:    undefined,
        productName:     r.title,
        imageUrl:        r.thumbnail,
        discounts,
      };
    });
  } catch {
    return [];
  }
}
