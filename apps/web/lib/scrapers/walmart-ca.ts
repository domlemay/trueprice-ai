import type { ScrapedOffer } from "./types";

type WalmartCAItem = {
  name?:                 string;
  canonicalUrl?:         string;
  imageInfo?:            { thumbnailUrl?: string };
  priceInfo?:            {
    currentPrice?: { price?: number };
    wasPrice?:     { price?: number };
  };
  availabilityStatusDisplayValue?: string;
  itemId?:               string;
  sellerInfo?:           { sellerName?: string };
  brandName?:            string;
  shortDescription?:     string;
};

type WalmartCANextData = {
  props?: {
    pageProps?: {
      initialData?: {
        searchResult?: {
          itemStacks?: Array<{ items?: WalmartCAItem[] }>;
        };
      };
    };
  };
};

export async function searchWalmartCA(query: string, limit = 5): Promise<ScrapedOffer[]> {
  try {
    const url = `https://www.walmart.ca/en/search?q=${encodeURIComponent(query)}&page=1`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept":          "text/html,application/xhtml+xml",
        "Accept-Language": "fr-CA,fr;q=0.9,en-CA;q=0.8,en;q=0.7",
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) return [];

    const html   = await res.text();
    const match  = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]+?)<\/script>/);
    if (!match?.[1]) return [];

    const nextData = JSON.parse(match[1]) as WalmartCANextData;
    const stacks   = nextData.props?.pageProps?.initialData?.searchResult?.itemStacks ?? [];
    const items: WalmartCAItem[] = stacks.flatMap((s) => s.items ?? []);

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
  } catch {
    return [];
  }
}
