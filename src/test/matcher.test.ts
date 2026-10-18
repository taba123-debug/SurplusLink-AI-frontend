import { describe, it, expect } from 'vitest';
import { matchLotsToRequirement } from '@/services/mock/matcher';
import { toMinorUnits } from '@/lib/money';
import { offsetDays } from '@/lib/dates';
import type { BuyerRequirement, Lot } from '@/types';

describe('Requirement to Lot Matching Engine', () => {
  const sampleLot: Lot = {
    id: 'test-lot-1',
    lotReference: 'LOT-TEST-01',
    sellerId: 'seller-1',
    sellerName: 'Lahore Test Bakery',
    sellerDescriptor: 'Verified Industrial Producer',
    sellerVerified: true,
    title: 'Sealed Tea Biscuits Master Pack',
    category: 'BISCUITS',
    description: 'High quality biscuits',
    totalQuantity: 200,
    availableQuantity: 200,
    reservedQuantity: 0,
    unitType: 'cartons',
    askingUnitPriceMinor: toMinorUnits(115),
    minPurchaseQuantity: 25,
    packagingType: 'Foil Cartons',
    expiryDate: offsetDays(45),
    storageRequirements: 'Cool and dry',
    city: 'Lahore',
    pickupRegion: 'Gulberg Industrial Area',
    pickupDeadline: offsetDays(30),
    resalePermissionConfirmed: true,
    safetyAttestationConfirmed: true,
    status: 'ACTIVE',
    images: [],
    createdAt: offsetDays(-2),
    updatedAt: offsetDays(-2),
  };

  const sampleReq: BuyerRequirement = {
    id: 'test-req-1',
    buyerId: 'buyer-1',
    buyerName: 'City Mart',
    title: '150 Biscuit Packs',
    category: 'BISCUITS',
    requiredQuantity: 150,
    maxTotalBudgetMinor: toMinorUnits(20000), // Rs. 20,000 budget
    minRemainingShelfLifeDays: 30,
    city: 'Lahore',
    preferredArea: 'Gulberg',
    status: 'ACTIVE',
    createdAt: offsetDays(-1),
  };

  it('matches compatible lots and computes high score for exact matches', () => {
    const results = matchLotsToRequirement(sampleReq, [sampleLot]);
    expect(results.length).toBe(1);

    const match = results[0];
    expect(match.compatibilityScore).toBeGreaterThanOrEqual(80);
    expect(match.quantityMatch).toBe('SURPLUS_AVAILABLE');
    expect(match.budgetCompatibility).toBe('WITHIN_BUDGET');
    expect(match.shelfLifeCompatibilityDays).toBeGreaterThanOrEqual(30);
  });

  it('ignores lots of a different category', () => {
    const ruskLot: Lot = {
      ...sampleLot,
      id: 'test-lot-2',
      category: 'RUSKS',
    };

    const results = matchLotsToRequirement(sampleReq, [ruskLot]);
    expect(results.length).toBe(0);
  });

  it('penalizes lots where minimum order exceeds buyer requirement', () => {
    const largeLot: Lot = {
      ...sampleLot,
      minPurchaseQuantity: 500, // Exceeds 150
    };

    const results = matchLotsToRequirement(sampleReq, [largeLot]);
    expect(results.length).toBe(1);
    expect(results[0].matchReasons.some((r) => r.includes('Warning: Minimum order quantity'))).toBe(true);
  });
});
