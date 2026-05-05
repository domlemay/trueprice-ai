import type { ScrapedOffer } from "./types";

// Maps common search terms to Apple Store product family slugs
const FAMILY_MAP: [RegExp, string][] = [
  [/iphone\s*16\s*pro\s*max/i, "iphone-16-pro-max"],
  [/iphone\s*16\s*pro/i,       "iphone-16-pro"],
  [/iphone\s*16\s*plus/i,      "iphone-16-plus"],
  [/iphone\s*16/i,             "iphone-16"],
  [/iphone\s*15\s*pro\s*max/i, "iphone-15-pro-max"],
  [/iphone\s*15\s*pro/i,       "iphone-15-pro"],
  [/iphone\s*15\s*plus/i,      "iphone-15-plus"],
  [/iphone\s*15/i,             "iphone-15"],
  [/iphone\s*14\s*pro\s*max/i, "iphone-14-pro-max"],
  [/iphone\s*14\s*pro/i,       "iphone-14-pro"],
  [/iphone\s*14/i,             "iphone-14"],
  [/macbook\s*pro\s*16/i,      "macbook-pro-16"],
  [/macbook\s*pro\s*14/i,      "macbook-pro-14"],
  [/macbook\s*pro/i,           "macbook-pro-14"],
  [/macbook\s*air\s*15/i,      "macbook-air-15-m4"],
  [/macbook\s*air/i,           "macbook-air-13-m4"],
  [/ipad\s*pro\s*13/i,         "ipad-pro-13"],
  [/ipad\s*pro/i,              "ipad-pro-11"],
  [/ipad\s*air/i,              "ipad-air"],
  [/ipad\s*mini/i,             "ipad-mini"],
  [/ipad/i,                    "ipad"],
  [/apple\s*watch\s*ultra/i,   "apple-watch-ultra"],
  [/apple\s*watch/i,           "apple-watch-series-10"],
  [/airpods\s*pro/i,           "airpods-pro"],
  [/airpods\s*max/i,           "airpods-max"],
  [/airpods/i,                 "airpods"],
  [/apple\s*tv/i,              "apple-tv-4k"],
  [/mac\s*mini/i,              "mac-mini"],
  [/mac\s*studio/i,            "mac-studio"],
  [/mac\s*pro/i,               "mac-pro"],
  [/imac/i,                    "imac"],
];

function detectFamily(query: string): string | null {
  for (const [re, family] of FAMILY_MAP) {
    if (re.test(query)) return family;
  }
  return null;
}

type AppleItem = {
  id?:              string;
  title?:           string;
  name?:            string;
  baseProductUrl?:  string;
  url?:             string;
  priceDimension?:  { raw?: { currentPrice?: number; currency?: string } };
  price?:           { raw?: { currentPrice?: number; currency?: string } } | number;
  availability?:    { isUnavailable?: boolean };
  images?:          Array<{ src?: string }>;
};

// Finds the first array in __NEXT_DATA__ whose items have Apple-specific fields
// (priceDimension, baseProductUrl). More resilient than hard-coded paths.
function findAppleItems(obj: unknown, depth = 0): AppleItem[] {
  if (depth > 12 || obj === null || typeof obj !== "object") return [];
  if (Array.isArray(obj)) {
    if (obj.length > 0) {
      const first = obj[0] as Record<string, unknown>;
      if (
        typeof first.priceDimension === "object" ||
        typeof first.baseProductUrl === "string" ||
        (typeof first.title === "string" && typeof first.availability === "object")
      ) {
        return obj as AppleItem[];
      }
    }
    for (const item of obj) {
      const r = findAppleItems(item, depth + 1);
      if (r.length > 0) return r;
    }
    return [];
  }
  for (const val of Object.values(obj as Record<string, unknown>)) {
    const r = findAppleItems(val, depth + 1);
    if (r.length > 0) return r;
  }
  return [];
}

// JSON-LD fallback: Apple buy pages include schema.org Product data
type SchemaOffer = { price?: string | number; priceCurrency?: string; availability?: string };
type SchemaProduct = {
  "@type"?: string;
  name?:    string;
  url?:     string;
  image?:   string | string[];
  offers?:  SchemaOffer | SchemaOffer[];
};

function extractJsonLd(html: string): SchemaProduct[] {
  const out: SchemaProduct[] = [];
  const re = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      const j = JSON.parse(m[1]) as SchemaProduct | { "@graph"?: SchemaProduct[] };
      if (Array.isArray((j as { "@graph"?: SchemaProduct[] })["@graph"])) {
        out.push(...(j as { "@graph": SchemaProduct[] })["@graph"].filter((x) => x["@type"] === "Product"));
      } else if ((j as SchemaProduct)["@type"] === "Product") {
        out.push(j as SchemaProduct);
      }
    } catch { /* malformed block */ }
  }
  return out;
}

type AppleProduct = {
  name:      string;
  price:     number;
  currency:  string;
  isInStock: boolean;
  url:       string;
};

async function fetchAppleProducts(
  family:  string,
  country: "ca" | "us",
  limit:   number,
): Promise<AppleProduct[]> {
  const locale = country === "ca" ? "en-CA" : "en-US";
  const url    = `https://www.apple.com/${country}/shop/buy-${family}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept":          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": locale,
      "Referer":         "https://www.apple.com/",
    },
    signal: AbortSignal.timeout(12_000),
  });

  if (!res.ok) throw new Error(`Apple ${country.toUpperCase()}: HTTP ${res.status}`);

  const html = await res.text();

  // ── Strategy 1: __NEXT_DATA__ recursive finder ────────────────────────────
  const ndMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (ndMatch) {
    try {
      const nd   = JSON.parse(ndMatch[1]) as unknown;
      const items = findAppleItems(nd);

      if (items.length > 0) {
        const currency = country === "ca" ? "CAD" : "USD";
        return items
          .slice(0, limit)
          .map((p) => {
            const rawPrice =
              (p.priceDimension as { raw?: { currentPrice?: number } } | undefined)?.raw?.currentPrice ??
              (typeof p.price === "number" ? p.price : 0);
            return {
              name:      p.title ?? p.name ?? "Apple Product",
              price:     rawPrice,
              currency,
              isInStock: !(p.availability?.isUnavailable ?? false),
              url:       p.baseProductUrl
                ? `https://www.apple.com${p.baseProductUrl}`
                : p.url ?? `https://www.apple.com/${country}/shop/buy-${family}`,
            };
          })
          .filter((p) => p.price > 0);
      }
    } catch (e) {
      throw new Error(`Apple ${country.toUpperCase()}: __NEXT_DATA__ parse error — ${e instanceof Error ? e.message : e}`);
    }
  }

  // ── Strategy 2: JSON-LD structured data ────────────────────────────────────
  const ldProducts = extractJsonLd(html);
  if (ldProducts.length > 0) {
    const currency = country === "ca" ? "CAD" : "USD";
    return ldProducts
      .slice(0, limit)
      .flatMap((p) => {
        const offersRaw = p.offers;
        const offers = Array.isArray(offersRaw) ? offersRaw : offersRaw ? [offersRaw] : [];
        return offers.map((o) => ({
          name:      p.name ?? "Apple Product",
          price:     typeof o.price === "number" ? o.price : Number(String(o.price ?? "0").replace(/[^0-9.]/g, "")) || 0,
          currency:  o.priceCurrency ?? currency,
          isInStock: (o.availability ?? "").toLowerCase().includes("instock"),
          url:       p.url ?? `https://www.apple.com/${country}/shop/buy-${family}`,
        }));
      })
      .filter((p) => p.price > 0)
      .slice(0, limit);
  }

  throw new Error(`Apple ${country.toUpperCase()}: no product data found (tried __NEXT_DATA__ + JSON-LD). URL: ${url}`);
}

export async function searchAppleStoreCA(query: string, limit = 3): Promise<ScrapedOffer[]> {
  return searchAppleStore(query, "ca", limit);
}

export async function searchAppleStoreUS(query: string, limit = 3): Promise<ScrapedOffer[]> {
  return searchAppleStore(query, "us", limit);
}

async function searchAppleStore(
  query:   string,
  country: "ca" | "us",
  limit:   number,
): Promise<ScrapedOffer[]> {
  const family = detectFamily(query);
  if (!family) return []; // Not an Apple product — skip without error

  const products = await fetchAppleProducts(family, country, limit);

  const currency      = country === "ca" ? "CAD" : "USD";
  const sellerCountry = country === "ca" ? "CA" : "US";
  const slug          = country === "ca" ? "apple.ca" : "apple.com";
  const sellerName    = country === "ca" ? "Apple Store Canada" : "Apple Store US";

  return products.map((p) => ({
    marketplaceSlug: slug,
    sellerCountry,
    currency,
    priceCurrent:    p.price,
    priceOriginal:   p.price,
    inStock:         p.isInStock,
    productUrl:      p.url,
    sellerName,
    shippingCost:    0,
    discounts:       [],
  }));
}
