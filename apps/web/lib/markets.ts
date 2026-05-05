// Marketplaces accessibles selon le pays de l'utilisateur
// Ordre = priorité d'affichage (marché local d'abord)

export const MARKET_MATRIX: Record<string, string[]> = {
  CA: [
    "amazon.ca", "bestbuy.ca", "apple.ca", "walmart.ca", "costco.ca",
    "amazon.com", "bestbuy.com", "apple.com", "walmart.com",
  ],
  US: [
    "amazon.com", "bestbuy.com", "apple.com", "walmart.com",
    "amazon.ca",  "bestbuy.ca",  "apple.ca",  "walmart.ca",
  ],
  FR: ["amazon.fr", "apple.ca", "amazon.de"],
  DE: ["amazon.de", "apple.ca", "amazon.fr"],
  GB: ["amazon.co.uk", "apple.ca"],
};

// Marketplaces nécessitant un proxy (scraping plus délicat)
export const PROXY_REQUIRED: Set<string> = new Set(["walmart.ca", "costco.ca"]);

// Livraison directe Canada sans transitaire
export const DIRECT_SHIP_TO_CA: Set<string> = new Set([
  "amazon.ca", "bestbuy.ca", "apple.ca", "walmart.ca", "costco.ca",
  "amazon.com", "bestbuy.com", "apple.com", "walmart.com",
]);

export function getAccessibleMarkets(country: string): string[] {
  return MARKET_MATRIX[country] ?? MARKET_MATRIX.CA;
}

export function isMarketAccessible(country: string, slug: string): boolean {
  return getAccessibleMarkets(country).includes(slug);
}

export function canShipDirectlyToCA(slug: string): boolean {
  return DIRECT_SHIP_TO_CA.has(slug);
}
