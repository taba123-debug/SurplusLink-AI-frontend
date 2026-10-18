import { describe, it, expect, beforeEach } from 'vitest';
import { MockMarketplaceApi } from '@/services/mock/mockMarketplaceApi';
import { useDemoStore, SEED_ORGANIZATIONS } from '@/store/useDemoStore';
import { toMinorUnits } from '@/lib/money';
import { offsetDays } from '@/lib/dates';

describe('Complete End-to-End Marketplace Trading Scenario', () => {
  let mockApi: MockMarketplaceApi;

  beforeEach(() => {
    localStorage.clear();
    mockApi = new MockMarketplaceApi();
  });

  it('executes full buyer-to-seller lifecycle from AI sourcing to settled commission', async () => {
    // 1. Seller (Punjab Biscuits Ltd) lists 200 biscuit packs
    useDemoStore.getState().setCurrentOrg(SEED_ORGANIZATIONS[0].id); // seller
    const createdLot = await mockApi.createLot({
      title: 'Premium Milk Tea Biscuits Batch E2E',
      category: 'BISCUITS',
      description: 'Fresh surplus production batch in sealed master cartons.',
      totalQuantity: 200,
      unitType: 'packs',
      askingUnitPriceMinor: toMinorUnits(115),
      reserveUnitPriceMinor: toMinorUnits(100),
      minPurchaseQuantity: 25,
      packagingType: 'Airtight Master Packaging',
      expiryDate: offsetDays(50),
      pickupDeadline: offsetDays(30),
      storageRequirements: 'Dry ambient warehouse',
      city: 'Lahore',
      pickupRegion: 'Gulberg Industrial Area',
      resalePermissionConfirmed: true,
      safetyAttestationConfirmed: true,
    });
    expect(createdLot.id).toBeDefined();
    expect(createdLot.availableQuantity).toBe(200);

    // 2. Buyer (City Mart Superstores) describes requirement in everyday language
    useDemoStore.getState().setCurrentOrg(SEED_ORGANIZATIONS[3].id); // buyer
    const buyerPrompt = 'I need 150 sealed biscuit packs under Rs. 20,000 in Lahore, with at least 30 days of shelf life remaining.';

    // 3. AI requirement is parsed deterministically
    const extraction = await mockApi.parseBuyerRequirement(buyerPrompt);
    expect(extraction.category).toBe('BISCUITS');
    expect(extraction.required_quantity).toBe(150);
    expect(extraction.city).toBe('Lahore');
    expect(extraction.min_remaining_shelf_life_days).toBe(30);

    // 4. Buyer saves requirement and finds compatible lots
    const savedReq = await mockApi.createRequirement({
      title: '150 Biscuit Packs for Johar Town Mart',
      category: extraction.category,
      requiredQuantity: extraction.required_quantity,
      maxTotalBudgetMinor: extraction.max_total_budget_minor,
      minRemainingShelfLifeDays: extraction.min_remaining_shelf_life_days,
      city: extraction.city,
    });

    const matches = await mockApi.getRequirementMatches(savedReq.id);
    expect(matches.length).toBeGreaterThan(0);
    const targetMatch = matches.find((m) => m.lot.id === createdLot.id);
    expect(targetMatch).toBeDefined();
    expect(targetMatch?.compatibilityScore).toBeGreaterThanOrEqual(80);

    // 5. Buyer makes a wholesale offer (150 units at Rs. 108/unit)
    const offer = await mockApi.createOffer({
      lotId: createdLot.id,
      requestedQuantity: 150,
      offeredUnitPriceMinor: toMinorUnits(108),
      pickupPreference: 'Buyer van pickup on Wednesday',
    });
    expect(offer.id).toBeDefined();
    expect(offer.status).toBe('PENDING');

    // 6. Switch to Seller (Punjab Biscuits) to review and accept offer
    useDemoStore.getState().setCurrentOrg(SEED_ORGANIZATIONS[0].id); // seller
    const acceptedOffer = await mockApi.respondToOffer(offer.id, { action: 'ACCEPT' });
    expect(acceptedOffer.status).toBe('ACCEPTED');
    expect(acceptedOffer.dealId).toBeDefined();

    // Verify stock reservation on the lot
    const updatedLot = await mockApi.getLot(createdLot.id);
    expect(updatedLot.availableQuantity).toBe(50); // 200 - 150
    expect(updatedLot.reservedQuantity).toBe(150);

    // 7. Deal is created with AWAITING_PAYMENT status
    const deal = await mockApi.getDeal(acceptedOffer.dealId!);
    expect(deal.status).toBe('AWAITING_PAYMENT');
    expect(deal.paymentStatus).toBe('UNPAID');
    expect(deal.subtotalMinor).toBe(toMinorUnits(150 * 108)); // Rs. 16,200
    expect(deal.buyerServiceFeeMinor).toBe(toMinorUnits(324)); // 2% of 16,200 = 324
    expect(deal.sellerCommissionMinor).toBe(toMinorUnits(324)); // 2% of 16,200 = 324
    expect(deal.privatePickupDetails).toBeUndefined(); // Confidential before payment

    // 8. Buyer performs simulated checkout
    useDemoStore.getState().setCurrentOrg(SEED_ORGANIZATIONS[3].id); // buyer
    const paidDeal = await mockApi.simulatePayment(deal.id, 'SUCCESS');
    expect(paidDeal.paymentStatus).toBe('SIMULATED_PAID');
    expect(paidDeal.status).toBe('PAID_AWAITING_PICKUP');

    // 9. Private pickup details are unlocked
    expect(paidDeal.privatePickupDetails).toBeDefined();
    expect(paidDeal.privatePickupDetails?.releaseCode).toMatch(/^SL-OTP-/);
    expect(paidDeal.privatePickupDetails?.warehouseAddress).toContain('Lahore');

    // 10. Handover completed and deal finalized
    const completedDeal = await mockApi.confirmPickup(paidDeal.id);
    expect(completedDeal.status).toBe('COMPLETED');
    expect(completedDeal.pickupStatus).toBe('COLLECTED');

    // 11. Dashboard reflects commission and transaction totals
    useDemoStore.getState().setCurrentOrg(SEED_ORGANIZATIONS[0].id); // seller
    const sellerDashboard = await mockApi.getDashboard('seller');
    expect(sellerDashboard.metrics.completedDealValueMinor).toBeGreaterThanOrEqual(completedDeal.subtotalMinor);
    expect(sellerDashboard.metrics.platformFeesMinor).toBeGreaterThanOrEqual(completedDeal.sellerCommissionMinor);
  });
});
