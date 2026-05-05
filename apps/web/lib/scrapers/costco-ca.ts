import type { ScrapedOffer } from "./types";

// Costco.ca doesn't expose a public JSON search API.
// We parse the JSON-LD structured data embedded in their search HTML.
// Falls back to [] on any error or anti-bot response.

type SchemaProduct = {
  "@type":        string;
  name?:          string;
  url?:           string;
  image?:         string | string[];
  brand?:         { "@type": string; name?: string } | string;
  offers?: {
    "@type":       string;
    price?:        number | string;
    priceCurrency?: string;
    availability?: string;
    sku?:          string;
  };
};

type SchemaItemList = {
  "@type":        string;
  itemListElement?: Array<{
    "@type":  string;
    item?:    SchemaProduct;
    position?: number;
  }>;
};

function extractBrand(brand: SchemaProduct["brand"]): string | undefined {
  if (!brand) return undefined;
  if (typeof brand === "string") return brand;
  return brand.name;
}

export async function searchCostcoCA(query: string, limit = 5): Promise<ScrapedOffer[]> {
  try {
    const url = `https://www.costco.ca/CatalogSearch?keyword=${encodeURIComponent(query)}&lang=en-CA`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept":          "text/html,application/xhtml+xml",
        "Accept-Language": "fr-CA,fr;q=0.9,en-CA;q=0.8",
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) return [];

    const html    = await res.text();
    const matches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/g)];

    const products: SchemaProduct[] = [];

    for (const m of matches) {
      try {
        const json = JSON.parse(m[1]) as SchemaItemList | SchemaProduct;
        if (json["@type"] === "ItemList" && Array.isArray((json as SchemaItemList).itemListElement)) {
          for (const el of (json as SchemaItemList).itemListElement ?? []) {
            if (el.item) products.push(el.item);
          }
        } else if (json["@type"] === "Product") {
          products.push(json as SchemaProduct);
        }
      } catch {
        // skip malformed block
      }
    }

    return products
      .filter((p) => {
        const price = Number(p.offers?.price);
        return !isNaN(price) && price > 0;
      })
      .slice(0, limit)
      .map((p) => {
        const priceCurrent = Number(p.offers!.price!);
        const imageUrl     = Array.isArray(p.image) ? p.image[0] : p.image;
        const isInStock    = (p.offers?.availability ?? "").toLowerCase().includes("instock");

        return {
          marketplaceSlug: "costco.ca",
          sellerCountry:   "CA",
          currency:        p.offers?.priceCurrency ?? "CAD",
          priceCurrent,
          priceOriginal:   priceCurrent,
          inStock:         isInStock,
          productUrl:      p.url ?? `https://www.costco.ca`,
          sellerName:      "Costco Canada",
          shippingCost:    0,
          sku:             p.offers?.sku,
          productName:     p.name,
          brand:           extractBrand(p.brand),
          imageUrl,
          discounts:       [],
        };
      });
  } catch {
    return [];
  }
}
