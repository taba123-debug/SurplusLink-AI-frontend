// @vitest-environment node
/// <reference types="node" />
import { describe, it, expect } from 'vitest';
import { writeFileSync } from 'node:fs';
import { env } from 'node:process';
import { HttpMarketplaceApi } from '@/services/http/httpMarketplaceApi';
import { useDemoStore } from '@/store/useDemoStore';
import type { LotExtraction, RequirementExtraction } from '@/types';

// Opt-in: creates fictional data and simulated payment in the local development backend.
describe.runIf(env.RUN_LIVE_API === '1')('real FastAPI integration', () => {
  it('runs the 200 / 150 pack scenario through the actual frontend HTTP adapter', async () => {
    const api = new HttpMarketplaceApi('http://localhost:8000/api/v1');
    const organizations = await api.loadIdentities();
    useDemoStore.getState().setOrganizations(organizations);
    const seller = organizations.find(x => x.name.startsWith('Gulberg Packaged'))!;
    const buyer = organizations.find(x => x.name.startsWith('Johar Town'))!;
    expect(seller.userId).toBeTruthy(); expect(buyer.userId).toBeTruthy();
    const select = (id: string) => useDemoStore.getState().setCurrentOrg(id);
    select(seller.id);
    const platformBefore = (await api.getDashboard('seller')).metrics.platformRevenueMinor!;
    let sellerAi: LotExtraction | undefined;
    let buyerAi: RequirementExtraction | undefined;
    const aiErrors: string[] = [];
    try { sellerAi = await api.parseSellerDescription('200 sealed biscuit packs in Gulberg, Lahore, asking Rs. 140 per pack, minimum Rs. 110, expiry in 45 days.'); }
    catch (e) { aiErrors.push(`Seller AI: ${(e as Error).message}`); }
    select(buyer.id);
    try { buyerAi = await api.parseBuyerRequirement('Need 150 sealed biscuit packs under Rs. 20,000 in Lahore, minimum 30 days remaining.'); }
    catch (e) { aiErrors.push(`Buyer AI: ${(e as Error).message}`); }
    if (buyerAi) { expect(buyerAi.required_quantity).toBe(150); expect(buyerAi.max_total_budget_minor).toBe(2000000); }
    // Explicit manual confirmation of this known fictional fixture if provider unavailable.
    select(seller.id);
    const lot = await api.createLot({ title: `Frontend verification biscuits ${Date.now()}`, category: 'BISCUITS', description: 'Fictional sealed biscuit inventory for frontend verification.',
      totalQuantity: 200, unitType: 'packs', askingUnitPriceMinor: 14000, reserveUnitPriceMinor: 11000, minPurchaseQuantity: 10,
      packagingType: 'sealed', storageRequirements: 'ambient', expiryDate: new Date(Date.now()+45*86400000).toISOString(), city: 'Lahore', pickupRegion: 'Gulberg',
      pickupAddress: 'Fictional private warehouse, Gulberg', pickupDeadline: new Date(Date.now()+3*86400000).toISOString(), resalePermissionConfirmed: true, safetyAttestationConfirmed: true });
    expect(lot.status).toBe('DRAFT');
    await api.updateLotStatus(lot.id,'ACTIVE');
    expect((await api.getOwnLots()).find(x => x.id === lot.id)?.reserveUnitPriceMinor).toBe(11000);
    const publicLot = await api.getLot(lot.id);
    expect(publicLot).not.toHaveProperty('reserveUnitPriceMinor');
    expect(JSON.stringify(publicLot)).not.toContain('Fictional private warehouse');
    select(buyer.id);
    expect((await api.getOwnLots()).some(x => x.id === lot.id)).toBe(false);
    const requirement = await api.createRequirement({ title: 'Frontend verification 150 biscuit packs', originalDescription: 'Need 150 sealed biscuit packs under Rs. 20,000 in Lahore, minimum 30 days remaining.',
      category: buyerAi?.category || 'BISCUITS', requiredQuantity: 150, unit: buyerAi?.unit || 'pack', maxTotalBudgetMinor: 2000000, minRemainingShelfLifeDays: 30, city: 'Lahore' });
    const matches = await api.getRequirementMatches(requirement.id);
    expect(matches.find(x => x.lot.id === lot.id)?.matchReasons).toContain('NEGOTIABLE');
    await expect(api.createOffer({ lotId: lot.id, requestedQuantity: 201, offeredUnitPriceMinor: 12000 })).rejects.toThrow();
    const rejected = await api.createOffer({ lotId: lot.id, requestedQuantity: 10, offeredUnitPriceMinor: 12000 });
    select(seller.id);
    expect((await api.respondToOffer(rejected.id,{ action: 'REJECT' })).status).toBe('REJECTED');
    select(buyer.id);
    const offer = await api.createOffer({ lotId: lot.id, requirementId: requirement.id, requestedQuantity: 150, offeredUnitPriceMinor: 12000 });
    select(seller.id);
    expect((await api.getOffers('seller')).some(x => x.id === offer.id)).toBe(true);
    const accepted = await api.respondToOffer(offer.id,{ action: 'ACCEPT' });
    expect(accepted.dealId).toBeTruthy();
    const id = accepted.dealId!;
    const deal = await api.getDeal(id);
    expect(deal.subtotalMinor).toBe(1800000); expect(deal.buyerTotalMinor).toBe(1836000);
    expect(deal.buyerServiceFeeMinor).toBe(36000); expect(deal.sellerCommissionMinor).toBe(36000); expect(deal.sellerNetProceedsMinor).toBe(1764000);
    expect(deal.privatePickupDetails).toBeUndefined();
    expect((await api.getLot(lot.id)).availableQuantity).toBe(50);
    select(buyer.id);
    expect((await api.createCheckout(id)).amountPayableMinor).toBe(1836000);
    expect((await api.simulatePayment(id,'FAILURE')).paymentStatus).toBe('PAYMENT_FAILED');
    const paid = await api.simulatePayment(id,'SUCCESS');
    expect(paid.paymentStatus).toBe('SIMULATED_PAID');
    expect(paid.privatePickupDetails?.warehouseAddress).toBe('Fictional private warehouse, Gulberg');
    const other = organizations.find(x => x.role === 'buyer' && x.id !== buyer.id)!;
    select(other.id);
    await expect(api.getDeal(id)).rejects.toThrow();
    select(seller.id);
    expect((await api.confirmPickup(id)).status).toBe('COMPLETED');
    const updated = (await api.getOwnLots()).find(x => x.id === lot.id)!;
    expect(updated.availableQuantity).toBe(50); expect(updated.reservedQuantity).toBe(0);
    const platformAfter = (await api.getDashboard('seller')).metrics.platformRevenueMinor!;
    expect(platformAfter - platformBefore).toBe(72000);
    writeFileSync('docs/live-api-verification.json', JSON.stringify({ verifiedAt: new Date().toISOString(), lotId: lot.id, requirementId: requirement.id, offerId: offer.id, dealId: id, buyerTotal: deal.buyerTotalMinor, sellerNet: deal.sellerNetProceedsMinor, availableQuantity: updated.availableQuantity, sellerLiveAI: !!sellerAi, buyerLiveAI: !!buyerAi, aiErrors }, null, 2));
  },180000);
});
