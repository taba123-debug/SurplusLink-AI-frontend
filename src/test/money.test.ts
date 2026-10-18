import { describe, it, expect } from 'vitest';
import {
  toMinorUnits,
  fromMinorUnits,
  formatPKR,
  calculateDealFinancials,
  BUYER_FEE_PERCENTAGE,
  SELLER_COMMISSION_PERCENTAGE,
} from '@/lib/money';

describe('Money and Commission Economics', () => {
  it('converts PKR to integer minor units correctly', () => {
    expect(toMinorUnits(12500)).toBe(1250000);
    expect(toMinorUnits(99.5)).toBe(9950);
  });

  it('converts minor units back to PKR', () => {
    expect(fromMinorUnits(1250000)).toBe(12500);
    expect(fromMinorUnits(9950)).toBe(99.5);
  });

  it('formats PKR currency with commas and Rs. symbol', () => {
    expect(formatPKR(1250000)).toBe('Rs. 12,500');
    expect(formatPKR(1250000, { showSymbol: false })).toBe('12,500');
    expect(formatPKR(150000000, { compact: true })).toBe('Rs. 1.5M');
  });

  it('calculates transparent deal financials matching the 2% platform specification', () => {
    // Example from Codex prompt:
    // Accepted subtotal: Rs. 12,500 (1,250,000 minor)
    // Buyer service fee (2%): Rs. 250 (25,000 minor)
    // Buyer checkout total: Rs. 12,750 (1,275,000 minor)
    // Seller commission (2%): Rs. 250 (25,000 minor)
    // Seller net proceeds: Rs. 12,250 (1,225,000 minor)
    // Platform gross fee: Rs. 500 (50,000 minor)
    const subtotalMinor = toMinorUnits(12500); // 1,250,000
    const financials = calculateDealFinancials(subtotalMinor);

    expect(financials.subtotalMinor).toBe(1250000);
    expect(financials.buyerServiceFeeMinor).toBe(25000); // Rs. 250
    expect(financials.buyerTotalMinor).toBe(1275000); // Rs. 12,750
    expect(financials.sellerCommissionMinor).toBe(25000); // Rs. 250
    expect(financials.sellerNetProceedsMinor).toBe(1225000); // Rs. 12,250
    expect(financials.platformGrossRevenueMinor).toBe(50000); // Rs. 500

    expect(BUYER_FEE_PERCENTAGE).toBe(0.02);
    expect(SELLER_COMMISSION_PERCENTAGE).toBe(0.02);
  });
});
