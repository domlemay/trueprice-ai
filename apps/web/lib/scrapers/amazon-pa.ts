import { createHmac, createHash } from "crypto";
import type { ScrapedOffer } from "./types";

// ── AWS Signature Version 4 helpers ──────────────────────────────────────────

function sha256hex(message: string): string {
  return createHash("sha256").update(message).digest("hex");
}

function hmacSHA256(key: string | Buffer, message: string): Buffer {
  return createHmac("sha256", key).update(message).digest();
}

function getSigningKey(secret: string, date: string, region: string, service: string): Buffer {
  const kDate    = hmacSHA256(`AWS4${secret}`, date);
  const kRegion  = hmacSHA256(kDate, region);
  const kService = hmacSHA256(kRegion, service);
  return hmacSHA256(kService, "aws4_request");
}

function toAmzDate(d: Date): string {
  return d.toISOString().replace(/[:\-]|\.\d{3}/g, "").slice(0, 15) + "Z";
}

// ── PA API v5 request ─────────────────────────────────────────────────────────

type PAAPIConfig = {
  accessKey:  string;
  secretKey:  string;
  partnerTag: string;
  host:       string;
  region:     string;
  marketplace: string;
};

const PAAPI_CONFIGS: Record<string, PAAPIConfig | undefined> = {
  "amazon.ca": process.env.AMAZON_PA_ACCESS_KEY && process.env.AMAZON_PA_SECRET_KEY && process.env.AMAZON_PA_PARTNER_TAG_CA
    ? {
        accessKey:   process.env.AMAZON_PA_ACCESS_KEY,
        secretKey:   process.env.AMAZON_PA_SECRET_KEY,
        partnerTag:  process.env.AMAZON_PA_PARTNER_TAG_CA!,
        host:        "webservices.amazon.ca",
        region:      "us-east-1",
        marketplace: "www.amazon.ca",
      }
    : undefined,
  "amazon.com": process.env.AMAZON_PA_ACCESS_KEY && process.env.AMAZON_PA_SECRET_KEY && process.env.AMAZON_PA_PARTNER_TAG_US
    ? {
        accessKey:   process.env.AMAZON_PA_ACCESS_KEY,
        secretKey:   process.env.AMAZON_PA_SECRET_KEY,
        partnerTag:  process.env.AMAZON_PA_PARTNER_TAG_US!,
        host:        "webservices.amazon.com",
        region:      "us-east-1",
        marketplace: "www.amazon.com",
      }
    : undefined,
};

async function callPAAPI(config: PAAPIConfig, body: object): Promise<Response> {
  const path    = "/paapi5/searchitems";
  const service = "ProductAdvertisingAPI";
  const method  = "POST";
  const now     = new Date();
  const amzDate = toAmzDate(now);
  const dateStr = amzDate.slice(0, 8);
  const bodyStr = JSON.stringify(body);

  const payloadHash       = sha256hex(bodyStr);
  const signedHeaderNames = "content-encoding;content-type;host;x-amz-date;x-amz-target";

  const canonicalRequest = [
    method,
    path,
    "",
    `content-encoding:amz-1.0\ncontent-type:application/json; charset=UTF-8\nhost:${config.host}\nx-amz-date:${amzDate}\nx-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems\n`,
    signedHeaderNames,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStr}/${config.region}/${service}/aws4_request`;
  const stringToSign    = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256hex(canonicalRequest),
  ].join("\n");

  const signingKey = getSigningKey(config.secretKey, dateStr, config.region, service);
  const signature  = createHmac("sha256", signingKey).update(stringToSign).digest("hex");

  return fetch(`https://${config.host}${path}`, {
    method,
    headers: {
      "content-encoding": "amz-1.0",
      "content-type":     "application/json; charset=UTF-8",
      "host":             config.host,
      "x-amz-date":       amzDate,
      "x-amz-target":     "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems",
      "Authorization":    `AWS4-HMAC-SHA256 Credential=${config.accessKey}/${credentialScope}, SignedHeaders=${signedHeaderNames}, Signature=${signature}`,
    },
    body:   bodyStr,
    signal: AbortSignal.timeout(12_000),
  });
}

// ── Public search functions ───────────────────────────────────────────────────

type PAAPIItem = {
  ASIN:           string;
  DetailPageURL:  string;
  ItemInfo?: {
    Title?: { DisplayValue?: string };
    ByLineInfo?: { Brand?: { DisplayValue?: string } };
  };
  Offers?: {
    Listings?: Array<{
      Price?: {
        Amount?:   number;
        Currency?: string;
      };
      Availability?: { Message?: string; Type?: string };
      DeliveryInfo?: { IsPrimeEligible?: boolean };
      Promotions?: Array<{
        DiscountPercent?: number;
        Type?:            string;
      }>;
    }>;
  };
  Images?: {
    Primary?: { Medium?: { URL?: string } };
  };
};

function mapItem(
  item: PAAPIItem,
  marketplaceSlug: string,
  sellerCountry: string,
): ScrapedOffer | null {
  const listing     = item.Offers?.Listings?.[0];
  const priceCurrent = listing?.Price?.Amount;
  if (!priceCurrent || priceCurrent <= 0) return null;

  const currency      = listing?.Price?.Currency ?? (sellerCountry === "CA" ? "CAD" : "USD");
  const availability  = listing?.Availability?.Type ?? "";
  const inStock       = availability === "Now" || availability === "InStock";
  const isPrime       = listing?.DeliveryInfo?.IsPrimeEligible ?? false;

  const discounts: ScrapedOffer["discounts"] = [];
  for (const promo of listing?.Promotions ?? []) {
    if (promo.DiscountPercent) {
      discounts.push({
        type:          promo.Type === "Lightning" ? "FLASH" : "COUPON",
        label:         `${promo.DiscountPercent}% off`,
        percent:       promo.DiscountPercent,
        isAutoApplied: promo.Type === "Lightning",
      });
    }
  }

  return {
    marketplaceSlug,
    sellerCountry,
    currency,
    priceCurrent,
    priceOriginal:   priceCurrent, // PA API doesn't always expose original price in SearchItems
    inStock,
    productUrl:      item.DetailPageURL,
    sellerName:      sellerCountry === "CA" ? "Amazon Canada" : "Amazon US",
    shippingCost:    isPrime ? 0 : undefined, // Prime = free; otherwise unknown
    sku:             item.ASIN,
    discounts,
  };
}

async function searchAmazon(
  query:           string,
  marketplaceKey:  keyof typeof PAAPI_CONFIGS,
  sellerCountry:   string,
  limit:           number,
): Promise<ScrapedOffer[]> {
  const config = PAAPI_CONFIGS[marketplaceKey];
  if (!config) return []; // Keys not configured — skip silently

  const body = {
    Keywords:    query,
    Marketplace: config.marketplace,
    PartnerTag:  config.partnerTag,
    PartnerType: "Associates",
    ItemCount:   limit,
    Resources:   [
      "ItemInfo.Title",
      "ItemInfo.ByLineInfo",
      "Offers.Listings.Price",
      "Offers.Listings.Availability.Type",
      "Offers.Listings.DeliveryInfo.IsPrimeEligible",
      "Offers.Listings.Promotions",
      "Images.Primary.Medium",
    ],
  };

  const res = await callPAAPI(config, body);
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Amazon PA API (${marketplaceKey}): ${res.status} ${errText.slice(0, 200)}`);
  }

  const data = await res.json() as {
    SearchResult?: { Items?: PAAPIItem[] };
    Errors?:       Array<{ Code: string; Message: string }>;
  };

  if (data.Errors?.length) {
    throw new Error(`Amazon PA API errors: ${data.Errors.map((e) => e.Code).join(", ")}`);
  }

  return (data.SearchResult?.Items ?? [])
    .map((item) => mapItem(item, marketplaceKey, sellerCountry))
    .filter((o): o is ScrapedOffer => o !== null);
}

export function searchAmazonCA(query: string, limit = 5): Promise<ScrapedOffer[]> {
  return searchAmazon(query, "amazon.ca", "CA", limit);
}

export function searchAmazonUS(query: string, limit = 5): Promise<ScrapedOffer[]> {
  return searchAmazon(query, "amazon.com", "US", limit);
}
