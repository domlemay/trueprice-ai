import { Suspense } from "react";
import { PricingClient } from "./PricingClient";

type PriceIds = {
  premiumMonthlyCAD: string;
  premiumYearlyCAD: string;
  premiumMonthlyUSD: string;
  premiumYearlyUSD: string;
  enterpriseMonthlyCAD: string;
  enterpriseYearlyCAD: string;
  enterpriseMonthlyUSD: string;
  enterpriseYearlyUSD: string;
};

export default function AbonnementPage() {
  const priceIds: PriceIds = {
    premiumMonthlyCAD:    process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY!,
    premiumYearlyCAD:     process.env.STRIPE_PRICE_ID_PREMIUM_YEARLY!,
    premiumMonthlyUSD:    process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY_USD!,
    premiumYearlyUSD:     process.env.STRIPE_PRICE_ID_PREMIUM_YEARLY_USD!,
    enterpriseMonthlyCAD: process.env.STRIPE_PRICE_ID_ENTERPRISE_MONTHLY!,
    enterpriseYearlyCAD:  process.env.STRIPE_PRICE_ID_ENTERPRISE_YEARLY!,
    enterpriseMonthlyUSD: process.env.STRIPE_PRICE_ID_ENTERPRISE_MONTHLY_USD!,
    enterpriseYearlyUSD:  process.env.STRIPE_PRICE_ID_ENTERPRISE_YEARLY_USD!,
  };

  return (
    <Suspense>
      <PricingClient priceIds={priceIds} />
    </Suspense>
  );
}
