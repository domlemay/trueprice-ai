// CUSMA (ex-ALENA) — source : ASFC / CBSA mai 2026
// Franchise courrier : 20 $ CAD → pas de droits ni frais de courtage
// Franchise formelle : 800 $ USD → dédouanement simplifié sans droits (la plupart des produits)

const CUSMA_COURIER_EXEMPTION_CAD = 20;

// Frais de courtage estimés — moyennes DHL/UPS/FedEx
const BROKERAGE_TABLE: { maxCAD: number; feeCAD: number }[] = [
  { maxCAD: 40,       feeCAD: 14.50  },
  { maxCAD: 100,      feeCAD: 22.50  },
  { maxCAD: 200,      feeCAD: 30.00  },
  { maxCAD: 350,      feeCAD: 42.00  },
  { maxCAD: 500,      feeCAD: 55.00  },
  { maxCAD: 1_000,    feeCAD: 75.00  },
  { maxCAD: Infinity, feeCAD: 110.00 },
];

export type DutyResult = {
  dutyRate: number;
  dutyAmount: number;
  brokerageFee: number;
  exempted: boolean;
};

export function calculateDuty(
  priceInCAD: number,
  fromCountry: string,
  toCountry: string,
  shippingCostCAD: number,
): DutyResult {
  if (toCountry !== "CA" || fromCountry !== "US") {
    return { dutyRate: 0, dutyAmount: 0, brokerageFee: 0, exempted: true };
  }

  const totalValueCAD = priceInCAD + shippingCostCAD;

  if (totalValueCAD <= CUSMA_COURIER_EXEMPTION_CAD) {
    return { dutyRate: 0, dutyAmount: 0, brokerageFee: 0, exempted: true };
  }

  // La plupart des produits de consommation CUSMA ont droit 0 %
  // Frais de courtage s'appliquent dès qu'on dépasse la franchise courrier
  return {
    dutyRate:    0,
    dutyAmount:  0,
    brokerageFee: getBrokerageFee(priceInCAD),
    exempted:    false,
  };
}

function getBrokerageFee(priceCAD: number): number {
  for (const tier of BROKERAGE_TABLE) {
    if (priceCAD <= tier.maxCAD) return tier.feeCAD;
  }
  return BROKERAGE_TABLE[BROKERAGE_TABLE.length - 1].feeCAD;
}
