import type { ScrapedOffer } from "./types";

const API_BASE = "https://api.bestbuy.com/v1";

type BBUSProduct = {
  name:          string;
  salePrice:     number;
  regularPrice:  number;
  inStoreAvailability: boolean;
  onlineAvailability:  boolean;
  url:           string;
  sku:           number;
  thumbnailImage?: string;
};

type BBUSResponse = {
  products: BBUSProduct[];
  total:    number;
};

export async function searchBestBuyUS(query: string, limit = 5): Promise<ScrapedOffer[]> {
  const apiKey = process.env.BESTBUY_US_API_KEY;
  if (!apiKey) return []; // Key not configured — skip silently

  const url = new URL(`${API_BASE}/products(search=${encodeURIComponent(query)})`);
  url.searchParams.set("format",   "json");
  url.searchParams.set("apiKey",   apiKey);
  url.searchParams.set("pageSize", String(limit));
  url.searchParams.set("show",     "name,salePrice,regularPrice,inStoreAvailability,onlineAvailability,url,sku,thumbnailImage");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; TruePriceAI/1.0; +https://truepricai.ca)" },
    signal:  AbortSignal.timeout(10_000),
  });

  if (!res.ok) throw new Error(`Best Buy US API: ${res.status}`);

  const data = await res.json() as BBUSResponse;
  if (!Array.isArray(data.products)) return [];

  return data.products
    .filter((p) => typeof p.salePrice === "number" && p.salePrice > 0)
    .map((p) => {
      const inStock   = p.inStoreAvailability || p.onlineAvailability;
      const discounts: ScrapedOffer["discounts"] = [];

      if (p.regularPrice && p.salePrice < p.regularPrice) {
        discounts.push({
          type:          "SALE",
          label:         `Save $${(p.regularPrice - p.salePrice).toFixed(2)}`,
          amount:        p.regularPrice - p.salePrice,
          isAutoApplied: true,
        });
      }

      return {
        marketplaceSlug: "bestbuy.com",
        sellerCountry:   "US",
        currency:        "USD",
        priceCurrent:    p.salePrice,
        priceOriginal:   p.regularPrice ?? p.salePrice,
        inStock,
        productUrl:      p.url?.startsWith("http") ? p.url : `https://www.bestbuy.com${p.url ?? ""}`,
        sellerName:      "Best Buy US",
        shippingCost:    0, // Free shipping on most US orders
        sku:             String(p.sku),
        discounts,
      };
    });
}
