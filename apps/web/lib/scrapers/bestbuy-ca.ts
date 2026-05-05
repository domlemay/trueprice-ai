import type { ScrapedOffer } from "./types";

// Best Buy CA: scrapes the search HTML page + __NEXT_DATA__ JSON.
// The internal API at /api/2.0/json/search returned 404 as of May 2026.

type BBProduct = {
  name?:          string;
  salePrice?:     number;
  regularPrice?:  number;
  availability?:  string;
  sku?:           string | number;
  productUrl?:    string;
  thumbnailImage?: string;
};

// Recursively finds the first array whose first element has `salePrice` or `regularPrice`.
// Best Buy CA restructures __NEXT_DATA__ paths across redesigns, so this is path-agnostic.
function extractProducts(obj: unknown, depth = 0): BBProduct[] {
  if (depth > 10 || obj === null || typeof obj !== "object") return [];
  if (Array.isArray(obj)) {
    if (obj.length > 0) {
      const first = obj[0] as Record<string, unknown>;
      if (typeof first.salePrice === "number" || typeof first.regularPrice === "number") {
        return obj as BBProduct[];
      }
    }
    for (const item of obj) {
      const r = extractProducts(item, depth + 1);
      if (r.length > 0) return r;
    }
    return [];
  }
  for (const val of Object.values(obj as Record<string, unknown>)) {
    const r = extractProducts(val, depth + 1);
    if (r.length > 0) return r;
  }
  return [];
}

export async function searchBestBuyCA(query: string, limit = 5): Promise<ScrapedOffer[]> {
  const searchUrl = `https://www.bestbuy.ca/en-ca/search?query=${encodeURIComponent(query)}`;

  const res = await fetch(searchUrl, {
    headers: {
      "User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept":          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-CA,en;q=0.9,fr-CA;q=0.8",
      "Referer":         "https://www.bestbuy.ca/",
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) throw new Error(`Best Buy CA: ${res.status}`);

  const html  = await res.text();
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) throw new Error("Best Buy CA: __NEXT_DATA__ absent");

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(match[1]) as Record<string, unknown>;
  } catch {
    throw new Error("Best Buy CA: JSON parse failed");
  }

  // Path is unknown across Best Buy CA redesigns — use recursive finder.
  const products = extractProducts(data);

  if (products.length === 0) throw new Error("Best Buy CA: 0 products in __NEXT_DATA__");

  return products
    .filter((p) => typeof p.salePrice === "number" && (p.salePrice ?? 0) > 0)
    .slice(0, limit)
    .map((p) => {
      const inStock  = ["InStoreAndOnline", "OnlineOnly"].includes(p.availability ?? "");
      const discounts: ScrapedOffer["discounts"] = [];

      if (p.regularPrice && p.salePrice! < p.regularPrice) {
        discounts.push({
          type:          "SALE",
          label:         `Économisez ${(p.regularPrice - p.salePrice!).toFixed(2)} $`,
          amount:        p.regularPrice - p.salePrice!,
          isAutoApplied: true,
        });
      }

      return {
        marketplaceSlug: "bestbuy.ca",
        sellerCountry:   "CA",
        currency:        "CAD",
        priceCurrent:    p.salePrice!,
        priceOriginal:   p.regularPrice ?? p.salePrice!,
        inStock,
        productUrl:      p.productUrl?.startsWith("http")
          ? p.productUrl
          : `https://www.bestbuy.ca${p.productUrl ?? ""}`,
        sellerName:      "Best Buy Canada",
        shippingCost:    0,
        sku:             String(p.sku ?? ""),
        discounts,
      };
    });
}
