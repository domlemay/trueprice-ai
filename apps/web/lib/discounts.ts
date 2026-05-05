/** Logique d'application des rabais sur un prix donné. */

export type DiscountInput = {
  amountOff:     number | null;
  percentOff:    number | null;
  isAutoApplied: boolean;
  isStackable:   boolean;
};

export type DiscountResult = {
  /** Prix après application de tous les rabais auto-appliqués */
  priceFinal: number;
  /** Montant total économisé par les rabais auto-appliqués */
  autoAppliedSaving: number;
  /** Meilleur rabais conditionnel potentiel (non auto-appliqué) */
  bestConditionalSaving: number;
  /** Prix si le meilleur rabais conditionnel est appliqué en plus */
  priceWithBestConditional: number;
  /** Des rabais nécessitent une action de l'utilisateur */
  hasManualAction: boolean;
};

/**
 * Applique les rabais auto-appliqués et calcule le meilleur scénario conditionnel.
 * Les rabais non-stackable se concurrencent (on prend le meilleur).
 */
export function applyDiscounts(
  priceCurrent: number,
  discounts: DiscountInput[],
): DiscountResult {
  const auto        = discounts.filter((d) => d.isAutoApplied);
  const conditional = discounts.filter((d) => !d.isAutoApplied);

  // Rabais auto — les stackable s'accumulent, les non-stackable prennent le meilleur
  const stackable    = auto.filter((d) => d.isStackable);
  const nonStackable = auto.filter((d) => !d.isStackable);

  let price = priceCurrent;

  // Appliquer les stackable en premier (% sur prix courant puis amount)
  for (const d of stackable) {
    const saving = discountAmount(d, price);
    price = Math.max(0, price - saving);
  }

  // Prendre le meilleur non-stackable
  const bestNonStack = nonStackable.reduce((best, d) => {
    const s = discountAmount(d, price);
    return s > best ? s : best;
  }, 0);
  price = Math.max(0, price - bestNonStack);

  const autoAppliedSaving = priceCurrent - price;

  // Meilleur rabais conditionnel (calculé sur le prix après auto)
  const bestConditionalSaving = conditional.reduce((best, d) => {
    const s = discountAmount(d, price);
    return s > best ? s : best;
  }, 0);

  return {
    priceFinal:               price,
    autoAppliedSaving,
    bestConditionalSaving,
    priceWithBestConditional: Math.max(0, price - bestConditionalSaving),
    hasManualAction:          conditional.length > 0,
  };
}

function discountAmount(d: DiscountInput, basePrice: number): number {
  if (d.amountOff != null && d.amountOff > 0) return d.amountOff;
  if (d.percentOff != null && d.percentOff > 0) return (basePrice * d.percentOff) / 100;
  return 0;
}
