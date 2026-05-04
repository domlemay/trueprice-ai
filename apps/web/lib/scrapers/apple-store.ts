import type { ScrapedOffer } from "./types";

// Maps common search terms to Apple Store product family slugs
// Apple's internal product data API uses these as path segments
const FAMILY_MAP: [RegExp, string][] = [
  [/iphone\s*16\s*pro\s*max/i, "iphone-16-pro-max"],
  [/iphone\s*16\s*pro/i,       "iphone-16-pro"],
  [/iphone\s*16\s*plus/i,      "iphone-16-plus"],
  [/iphone\s*16/i,             "iphone-16"],
  [/iphone\s*15\s*pro\s*max/i, "iphone-15-pro-max"],
  [/iphone\s*15\s*pro/i,       "iphone-15-pro"],
  [/iphone\s*15\s*plus/i,      "iphone-15-plus"],
  [/iphone\s*15/i,             "iphone-15"],
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

type AppleProduct = {
  name:       string;
  price:      number;
  currency:   string;
  isInStock:  boolean;
  url:        string;
  imageUrl?:  string;
};

async function fetchAppleProducts(
  family:  string,
  country: "ca" | "us",
  limit:   number,
): Promise<AppleProduct[]> {
  // Apple's store product-data endpoint (internal but stable)
  const locale  = country === "ca" ? "en-CA" : "en-US";
  const storeId = country === "ca" ? "143455" : "143441"; // CA/US App Store IDs (used for locale routing)

  const url = `https://www.apple.com/${country}/shop/buy-${family}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept":     "text/html,application/xhtml+xml",
      "Accept-Language": locale,
    },
    signal: AbortSignal.timeout(12_000),
  });

  if (!res.ok) return [];

  const html = await res.text();

  // Extract __NEXT_DATA__ JSON embedded in Apple's Next.js store pages
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) return [];

  try {
    const nextData = JSON.parse(match[1]) as {
      props?: {
        pageProps?: {
          initialData?: {
            data?: {
              productsDisplayed?: {
                results?: Array<{
                  id:           string;
                  title?:       string;
                  baseProductUrl?: string;
                  priceDimension?: {
                    raw?: { currentPrice?: number; currency?: string };
                  };
                  availability?: { isUnavailable?: boolean };
                  images?:      Array<{ src?: string }>;
                }>;
              };
            };
          };
        };
      };
    };

    const results = nextData.props?.pageProps?.initialData?.data?.productsDisplayed?.results ?? [];

    return results.slice(0, limit).map((p) => ({
      name:      p.title ?? "Apple Product",
      price:     p.priceDimension?.raw?.currentPrice ?? 0,
      currency:  p.priceDimension?.raw?.currency ?? (country === "ca" ? "CAD" : "USD"),
      isInStock: !(p.availability?.isUnavailable ?? false),
      url:       p.baseProductUrl
        ? `https://www.apple.com${p.baseProductUrl}`
        : `https://www.apple.com/${country}/shop/buy-${family}`,
      imageUrl:  p.images?.[0]?.src,
    })).filter((p) => p.price > 0);
  } catch {
    return [];
  }
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
  if (!family) return []; // Not an Apple product

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
    priceOriginal:   p.price, // Apple rarely discounts
    inStock:         p.isInStock,
    productUrl:      p.url,
    sellerName,
    shippingCost:    0, // Apple ships free over ~50 CAD
    discounts:       [],
  }));
}
