import { getExchangeRate } from "./exchange";
import { getTaxRate } from "./tax-rates";
import { calculateDuty } from "./duties";

export type OfferInput = {
  priceCurrent:  number;
  priceOriginal?: number;
  currency:      string;  // devise du vendeur ("USD", "CAD", …)
  sellerCountry: string;  // pays du vendeur ("US", "CA", …)
  shippingCost?: number;  // en devise du vendeur, 0 si offert
  inStock?:      boolean;
};

export type UserContext = {
  country:  string;  // "CA"
  province: string;  // "QC"
  currency: string;  // "CAD"
};

export type TruePriceResult = {
  priceInUserCurrency: number;
  shippingCost:        number;
  exchangeRate:        number;
  dutyRate:            number;
  dutyAmount:          number;
  taxRate:             number;
  taxAmount:           number;
  brokerageFee:        number;
  truePriceTotal:      number;
  taxLabel:            string;
  breakdown: {
    base:     number;
    shipping: number;
    duty:     number;
    tax:      number;
    brokerage:number;
  };
};

export async function calculateTruePrice(
  offer: OfferInput,
  userCtx: UserContext,
): Promise<TruePriceResult> {
  const exchangeRate = await getExchangeRate(offer.currency, userCtx.currency);

  const priceInUserCurrency    = r(offer.priceCurrent  * exchangeRate);
  const shippingInUserCurrency = r((offer.shippingCost ?? 0) * exchangeRate);

  const { dutyRate, dutyAmount, brokerageFee } = calculateDuty(
    priceInUserCurrency,
    offer.sellerCountry,
    userCtx.country,
    shippingInUserCurrency,
  );

  const { rate: taxRate, label: taxLabel } = getTaxRate(userCtx.country, userCtx.province);
  const taxBase   = priceInUserCurrency + r(dutyAmount) + shippingInUserCurrency;
  const taxAmount = r(taxBase * taxRate);

  const truePriceTotal = r(
    priceInUserCurrency + shippingInUserCurrency + r(dutyAmount) + taxAmount + r(brokerageFee),
  );

  return {
    priceInUserCurrency,
    shippingCost:  shippingInUserCurrency,
    exchangeRate,
    dutyRate,
    dutyAmount:    r(dutyAmount),
    taxRate,
    taxAmount,
    brokerageFee:  r(brokerageFee),
    truePriceTotal,
    taxLabel,
    breakdown: {
      base:      priceInUserCurrency,
      shipping:  shippingInUserCurrency,
      duty:      r(dutyAmount),
      tax:       taxAmount,
      brokerage: r(brokerageFee),
    },
  };
}

function r(n: number) {
  return Math.round(n * 100) / 100;
}
