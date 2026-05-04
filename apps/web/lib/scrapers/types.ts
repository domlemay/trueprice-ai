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
