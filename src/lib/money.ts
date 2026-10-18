/**
 * Money calculation and formatting utilities for SurplusLink AI.
 * All monetary values in the domain/API are stored in PKR minor units (1 PKR = 100 paisa / minor units).
 */

export const BUYER_FEE_PERCENTAGE = 0.02; // 2%
export const SELLER_COMMISSION_PERCENTAGE = 0.02; // 2%

export interface DealFinancials {
  subtotalMinor: number;
  buyerServiceFeeMinor: number;
  buyerTotalMinor: number;
  sellerCommissionMinor: number;
  sellerNetProceedsMinor: number;
  platformGrossRevenueMinor: number;
}

/**
 * Converts PKR major units to minor units (e.g. 12500 -> 1250000)
 */
export function toMinorUnits(pkr: number): number {
  return Math.round(pkr * 100);
}

/**
 * Converts minor units to PKR major units (e.g. 1250000 -> 12500)
 */
export function fromMinorUnits(minor: number): number {
  return minor / 100;
}

/**
 * Formats minor units into readable PKR currency string.
 * Example: 1250000 -> "Rs. 12,500"
 */
export function formatPKR(
  minor: number,
  options: { showSymbol?: boolean; compact?: boolean } = {}
): string {
  const { showSymbol = true, compact = false } = options;
  const pkr = fromMinorUnits(minor);

  if (compact && pkr >= 1000000) {
    const formatted = (pkr / 1000000).toFixed(1).replace(/\.0$/, '');
    return `${showSymbol ? 'Rs. ' : ''}${formatted}M`;
  }
  if (compact && pkr >= 1000) {
    const formatted = (pkr / 1000).toFixed(1).replace(/\.0$/, '');
    return `${showSymbol ? 'Rs. ' : ''}${formatted}k`;
  }

  const formatted = new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(pkr);

  return `${showSymbol ? 'Rs. ' : ''}${formatted}`;
}

/**
 * Calculates deal financials transparently using exact integer minor units.
 * Buyer service fee: 2% of subtotal
 * Seller commission: 2% of subtotal
 */
export function calculateDealFinancials(subtotalMinor: number): DealFinancials {
  const buyerServiceFeeMinor = Math.round(subtotalMinor * BUYER_FEE_PERCENTAGE);
  const buyerTotalMinor = subtotalMinor + buyerServiceFeeMinor;

  const sellerCommissionMinor = Math.round(subtotalMinor * SELLER_COMMISSION_PERCENTAGE);
  const sellerNetProceedsMinor = subtotalMinor - sellerCommissionMinor;

  const platformGrossRevenueMinor = buyerServiceFeeMinor + sellerCommissionMinor;

  return {
    subtotalMinor,
    buyerServiceFeeMinor,
    buyerTotalMinor,
    sellerCommissionMinor,
    sellerNetProceedsMinor,
    platformGrossRevenueMinor,
  };
}
