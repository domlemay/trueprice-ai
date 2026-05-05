import type { ScrapedOffer } from "./types";

type WalmartUSItem = {
  name?:                           string;
  canonicalUrl?:                   string;
  imageInfo?:                      { thumbnailUrl?: string };
  priceInfo?:                      {
    currentPrice?: { price?: number };
    wasPrice?:     { price?: number };
  };
  availabilityStatusDisplayValue?: string;
  itemId?:                         string;
  manufacturerName?:               string;
  fulfillmentBadge?:               string; // "FREE pickup today", "2-day shipping"
};

type WalmartUSNextData = {
  props?: {
    pageProps?: {
      initialData?: {
        searchResult?: {
          itemStacks?: Array<{ items?: WalmartUSItem[] }>;
        };
      };
    };
  };
};

export async function searchWalmartUS(query: string, limit = 5): Promise<ScrapedOffer[]> {
  try {
    const url = `https://www.walmart.com/search?q=${encodeURIComponent(query)}&affinityOverride=default`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept":          "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) return [];

    const html  = await res.text();
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]+?)<\/script>/);
    if (!match?.[1]) return [];

    const nextData = JSON.parse(match[1]) as WalmartUSNextData;
    const stacks   = nextData.props?.pageProps?.initialData?.searchResult?.itemStacks ?? [];
    const items: WalmartUSItem[] = stacks.flatMap((s) => s.items ?? []);

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
            label:         `Save $${(priceOriginal - priceCurrent).toFixed(2)}`,
            amount:        priceOriginal - priceCurrent,
            isAutoApplied: true,
          });
        }

        return {
          marketplaceSlug: "walmart.com",
          sellerCountry:   "US",
          currency:        "USD",
          priceCurrent,
          priceOriginal,
          inStock:         (p.availabilityStatusDisplayValue ?? "").toLowerCase() !== "out of stock",
          productUrl:      p.canonicalUrl?.startsWith("http")
            ? p.canonicalUrl
            : `https://www.walmart.com${p.canonicalUrl ?? ""}`,
          sellerName:      "Walmart US",
          shippingCost:    0,
          sku:             p.itemId,
          productName:     p.name,
          brand:           p.manufacturerName,
          imageUrl:        p.imageInfo?.thumbnailUrl,
          discounts,
        };
      });
  } catch {
    return [];
  }
}
