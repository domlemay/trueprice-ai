export type ScrapedOffer = {
  marketplaceSlug: string;
  sellerCountry:   string;
  currency:        string;
  priceCurrent:    number;
  priceOriginal:   number;
  inStock:         boolean;
  productUrl:      string;
  sellerName:      string;
  shippingCost?:   number; // 0 si offert, null si inconnu
  sku?:            string;
  discounts?:      ScrapedDiscount[];
  // Product catalog fields (Phase 2F)
  productName?:    string;
  brand?:          string;
  asin?:           string;
  imageUrl?:       string;
  isPrime?:        boolean;
};

export type ScrapedDiscount = {
  type:          string;   // "SALE" | "COUPON" | "AUTOMATIC" | etc.
  label:         string;
  amount?:       number;
  percent?:      number;
  code?:         string;
  isAutoApplied: boolean;
  expiresAt?:    Date;
};
