import { prisma } from "@trueprice-ai/db";
import { findOrCreateProduct, findOrCreateVariant, recordPriceHistory } from "@trueprice-ai/db";
import type { ScrapedOffer } from "./scrapers/types";

// Links a scraped offer to the Product catalog and records PriceHistory.
// Called after ProductOffer is saved so we have the marketplace ID.
export async function linkOfferToProduct(
  offer:         ScrapedOffer,
  offerId:       string,
  marketplaceId: string | null | undefined,
): Promise<void> {
  if (!offer.productName) return;

  try {
    const product = await findOrCreateProduct({
      name:     offer.productName,
      brand:    offer.brand,
      imageUrl: offer.imageUrl,
    });

    const variantName = [offer.brand, offer.productName].filter(Boolean).join(" ") || offer.productName;
    const variant = await findOrCreateVariant({
      productId: product.id,
      name:      variantName,
      asin:      offer.asin,
      sku:       offer.sku,
      imageUrl:  offer.imageUrl,
    });

    await prisma.productOffer.update({
      where: { id: offerId },
      data:  { variantId: variant.id },
    });

    await recordPriceHistory({
      productId:     product.id,
      variantId:     variant.id,
      marketplaceId: marketplaceId ?? undefined,
      price:         offer.priceCurrent,
      currency:      offer.currency,
    });
  } catch (err) {
    console.error("[product-catalog] link failed:", err);
  }
}
