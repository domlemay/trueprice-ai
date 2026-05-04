import { prisma } from "../index";

const MARKETPLACES = [
  {
    name: "Amazon Canada",     slug: "amazon.ca",    url: "https://www.amazon.ca",      country: "CA", currency: "CAD",
    supportsDeliveryCheck: true, requiresProxy: false,
  },
  {
    name: "Amazon USA",        slug: "amazon.com",   url: "https://www.amazon.com",     country: "US", currency: "USD",
    supportsDeliveryCheck: true, requiresProxy: false,
  },
  {
    name: "Best Buy Canada",   slug: "bestbuy.ca",   url: "https://www.bestbuy.ca",     country: "CA", currency: "CAD",
    supportsDeliveryCheck: true, requiresProxy: false,
  },
  {
    name: "Best Buy USA",      slug: "bestbuy.com",  url: "https://www.bestbuy.com",    country: "US", currency: "USD",
    supportsDeliveryCheck: true, requiresProxy: false,
  },
  {
    name: "Apple Store Canada",slug: "apple.ca",     url: "https://www.apple.com/ca",   country: "CA", currency: "CAD",
    supportsDeliveryCheck: true, requiresProxy: false,
  },
  {
    name: "Apple Store USA",   slug: "apple.com",    url: "https://www.apple.com",      country: "US", currency: "USD",
    supportsDeliveryCheck: true, requiresProxy: false,
  },
  {
    name: "Walmart Canada",    slug: "walmart.ca",   url: "https://www.walmart.ca",     country: "CA", currency: "CAD",
    supportsDeliveryCheck: false, requiresProxy: true,
  },
  {
    name: "Walmart USA",       slug: "walmart.com",  url: "https://www.walmart.com",    country: "US", currency: "USD",
    supportsDeliveryCheck: false, requiresProxy: false,
  },
  {
    name: "Costco Canada",     slug: "costco.ca",    url: "https://www.costco.ca",      country: "CA", currency: "CAD",
    supportsDeliveryCheck: false, requiresProxy: true,
  },
  {
    name: "Amazon France",     slug: "amazon.fr",    url: "https://www.amazon.fr",      country: "FR", currency: "EUR",
    supportsDeliveryCheck: true, requiresProxy: false,
  },
  {
    name: "Amazon Allemagne",  slug: "amazon.de",    url: "https://www.amazon.de",      country: "DE", currency: "EUR",
    supportsDeliveryCheck: true, requiresProxy: false,
  },
  {
    name: "Amazon UK",         slug: "amazon.co.uk", url: "https://www.amazon.co.uk",   country: "GB", currency: "GBP",
    supportsDeliveryCheck: true, requiresProxy: false,
  },
] as const;

export async function seedMarketplaces() {
  let created = 0;
  for (const m of MARKETPLACES) {
    await prisma.marketplace.upsert({
      where:  { slug: m.slug },
      create: { ...m, isActive: true, status: "OPERATIONAL" },
      update: { name: m.name, url: m.url, currency: m.currency },
    });
    created++;
  }
  console.log(`[seed] ${created} marketplaces upserted`);
}
