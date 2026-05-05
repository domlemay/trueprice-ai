import { prisma } from "../index";

export type FindOrCreateProductParams = {
  name:      string;
  brand?:    string;
  imageUrl?: string;
  category?: string;
};

export type FindOrCreateVariantParams = {
  productId: string;
  name:      string;
  asin?:     string;
  sku?:      string;
  imageUrl?: string;
};

export type RecordPriceHistoryParams = {
  productId?:    string;
  variantId?:    string;
  marketplaceId?: string;
  price:         number;
  currency:      string;
};

export async function findOrCreateProduct(params: FindOrCreateProductParams) {
  const { name, brand, imageUrl, category } = params;

  const existing = await prisma.product.findFirst({
    where: {
      name,
      brand: brand ?? null,
    },
  });

  if (existing) return existing;

  return prisma.product.create({
    data: { name, brand, imageUrl, category },
  });
}

export async function findOrCreateVariant(params: FindOrCreateVariantParams) {
  const { productId, name, asin, sku, imageUrl } = params;

  if (asin) {
    const byAsin = await prisma.productVariant.findUnique({ where: { asin } });
    if (byAsin) return byAsin;
  }

  const existing = await prisma.productVariant.findFirst({
    where: { productId, name },
  });

  if (existing) return existing;

  return prisma.productVariant.create({
    data: { productId, name, asin, sku, imageUrl },
  });
}

export async function recordPriceHistory(params: RecordPriceHistoryParams) {
  return prisma.priceHistory.create({
    data: {
      productId:     params.productId,
      variantId:     params.variantId,
      marketplaceId: params.marketplaceId,
      price:         params.price,
      currency:      params.currency,
    },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where:   { id },
    include: { variants: true },
  });
}

export async function getProductWithPriceHistory(id: string) {
  return prisma.product.findUnique({
    where:   { id },
    include: {
      variants:     true,
      priceHistory: {
        orderBy: { recordedAt: "desc" },
        take:    100,
      },
    },
  });
}
