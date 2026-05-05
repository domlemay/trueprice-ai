import type { ScrapedOffer } from "./types";

type WalmartCAItem = {
  name?:                           string;
  canonicalUrl?:                   string;
  imageInfo?:                      { thumbnailUrl?: string };
  priceInfo?:                      {
    currentPrice?: { price?: number };
    wasPrice?:     { price?: number };
  };
  availabilityStatusDisplayValue?: string;
  itemId?:                         string;
  sellerInfo?:                     { sellerName?: string };
  brandName?:                      string;
};

// Recursively finds the first array in __NEXT_DATA__ whose items have
// Walmart-specific fields (priceInfo.currentPrice). Path-agnostic across redesigns.
function findWalmartItems(obj: unknown, depth = 0): WalmartCAItem[] {
  if (depth > 12 || obj === null || typeof obj !== "object") return [];
  if (Array.isArray(obj)) {
    if (obj.length > 0) {
      const first = obj[0] as Record<string, unknown>;
      const pi    = first.priceInfo as Record<string, unknown> | undefined;
      if (
        typeof pi?.currentPrice === "object" ||
        (typeof first.canonicalUrl === "string" && typeof first.itemId !== "undefined")
      ) {
        return obj as WalmartCAItem[];
      }
    }
    for (const item of obj) {
      const r = findWalmartItems(item, depth + 1);
      if (r.length > 0) return r;
    }
    return [];
  }
  for (const val of Object.values(obj as Record<string, unknown>)) {
    const r = findWalmartItems(val, depth + 1);
    if (r.length > 0) return r;
  }
  return [];
}

export async function searchWalmartCA(query: string, limit = 5): Promise<ScrapedOffer[]> {
  const url = `https://www.walmart.ca/en/search?q=${encodeURIComponent(query)}&page=1`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept":          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "fr-CA,fr;q=0.9,en-CA;q=0.8,en;q=0.7",
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) throw new Error(`Walmart CA: HTTP ${res.status}`);

  const html  = await res.text();
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) throw new Error("Walmart CA: __NEXT_DATA__ absent");

  let nd: unknown;
  try {
    nd = JSON.parse(match[1]);
  } catch (e) {
    throw new Error(`Walmart CA: JSON parse error — ${e instanceof Error ? e.message : e}`);
  }

  const items = findWalmartItems(nd);
  if (items.length === 0) throw new Error("Walmart CA: 0 items found in __NEXT_DATA__");

  return items
    .filter((p) => typeof p.priceInfo?.currentPrice?.price === "number")
    .slice(0, limit)
    .map((p) => {
      const priceCurrent  = p.priceInfo!.currentPrice!.price!;
      const priceOriginal = p.priceInfo?.wasPrice?.price ?? priceCurrent;
      const discounts: ScrapedOffer["discounts"] = [];

      if (priceOriginal > priceCurrent) {
        discounts.push({
          type:          "SALE",
          label:         `Économisez ${(priceOriginal - priceCurrent).toFixed(2)} $`,
          amount:        priceOriginal - priceCurrent,
          isAutoApplied: true,
        });
      }

      return {
        marketplaceSlug: "walmart.ca",
        sellerCountry:   "CA",
        currency:        "CAD",
        priceCurrent,
        priceOriginal,
        inStock:         (p.availabilityStatusDisplayValue ?? "").toLowerCase() !== "out of stock",
        productUrl:      p.canonicalUrl?.startsWith("http")
          ? p.canonicalUrl
          : `https://www.walmart.ca${p.canonicalUrl ?? ""}`,
        sellerName:      p.sellerInfo?.sellerName ?? "Walmart Canada",
        shippingCost:    0,
        sku:             p.itemId,
        productName:     p.name,
        brand:           p.brandName,
        imageUrl:        p.imageInfo?.thumbnailUrl,
        discounts,
      };
    });
}
