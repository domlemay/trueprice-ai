import type { ScrapedOffer } from "./types";

const API_URL = "https://www.bestbuy.ca/api/2.0/json/search";

type BestBuyProduct = {
  name:          string;
  salePrice:     number;
  regularPrice:  number;
  availability:  string; // "InStoreAndOnline" | "OnlineOnly" | "SoldOut" | "ComingSoon"
  sku:           string;
  modelNumber?:  string;
  productUrl:    string;
};

type BestBuyResponse = {
  products:      BestBuyProduct[];
  totalProducts: number;
};

export async function searchBestBuyCA(query: string, limit = 5): Promise<ScrapedOffer[]> {
  const url = new URL(API_URL);
  url.searchParams.set("query",    query);
  url.searchParams.set("from",     "0");
  url.searchParams.set("size",     String(limit));
  url.searchParams.set("language", "en");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; TruePriceAI/1.0; +https://truepricai.ca)" },
    signal:  AbortSignal.timeout(10_000),
  });

  if (!res.ok) throw new Error(`Best Buy CA API: ${res.status}`);

  const data = await res.json() as BestBuyResponse;
  if (!Array.isArray(data.products)) return [];

  return data.products
    .filter((p) => typeof p.salePrice === "number" && p.salePrice > 0)
    .map((p) => {
      const inStock = ["InStoreAndOnline", "OnlineOnly"].includes(p.availability ?? "");
      const discounts: ScrapedOffer["discounts"] = [];

      if (p.regularPrice && p.salePrice < p.regularPrice) {
        discounts.push({
          type:          "SALE",
          label:         `Économisez ${(p.regularPrice - p.salePrice).toFixed(2)} $`,
          amount:        p.regularPrice - p.salePrice,
          isAutoApplied: true,
        });
      }

      return {
        marketplaceSlug: "bestbuy.ca",
        sellerCountry:   "CA",
        currency:        "CAD",
        priceCurrent:    p.salePrice,
        priceOriginal:   p.regularPrice ?? p.salePrice,
        inStock,
        productUrl:      p.productUrl?.startsWith("http")
          ? p.productUrl
          : `https://www.bestbuy.ca${p.productUrl ?? ""}`,
        sellerName:      "Best Buy Canada",
        shippingCost:    0, // livraison gratuite sur la plupart des commandes ≥ 35 $
        sku:             p.sku,
        discounts,
      };
    });
}
