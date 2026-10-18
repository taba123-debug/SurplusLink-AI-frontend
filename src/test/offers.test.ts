import { describe, it, expect, beforeEach } from 'vitest';
import { MockMarketplaceApi } from '@/services/mock/mockMarketplaceApi';
import { useDemoStore } from '@/store/useDemoStore';
import { toMinorUnits } from '@/lib/money';

describe('Offer State Transitions and Duplicate Prevention', () => {
  let mockApi: MockMarketplaceApi;

  beforeEach(() => {
    localStorage.clear();
    useDemoStore.getState().setCurrentRole('seller');
    mockApi = new MockMarketplaceApi();
  });

  it('accepts a pending offer and creates exactly one deal', async () => {
    const offers = await mockApi.getOffers();
    const pendingOffer = offers.find((o) => o.status === 'PENDING');
    expect(pendingOffer).toBeDefined();

    const accepted = await mockApi.respondToOffer(pendingOffer!.id, { action: 'ACCEPT' });
    expect(accepted.status).toBe('ACCEPTED');
    expect(accepted.dealId).toBeDefined();

    const deals = await mockApi.getDeals();
    const deal = deals.find((d) => d.id === accepted.dealId);
    expect(deal).toBeDefined();
    expect(deal?.status).toBe('AWAITING_PAYMENT');
  });

  it('prevents duplicate offer acceptance', async () => {
    const offers = await mockApi.getOffers();
    const pendingOffer = offers.find((o) => o.status === 'PENDING');

    // First acceptance
    await mockApi.respondToOffer(pendingOffer!.id, { action: 'ACCEPT' });

    // Second acceptance must throw error
    await expect(
      mockApi.respondToOffer(pendingOffer!.id, { action: 'ACCEPT' })
    ).rejects.toThrow(/already been accepted/i);
  });

  it('handles counter-offers correctly', async () => {
    const offers = await mockApi.getOffers();
    const pendingOffer = offers.find((o) => o.status === 'PENDING');

    const counterPrice = toMinorUnits(120);
    const countered = await mockApi.respondToOffer(pendingOffer!.id, {
      action: 'COUNTER',
      counterUnitPriceMinor: counterPrice,
      counterNote: 'Adjusted price for shipping',
    });

    expect(countered.status).toBe('COUNTERED');
    expect(countered.sellerCounterUnitPriceMinor).toBe(counterPrice);
    expect(countered.sellerCounterNote).toBe('Adjusted price for shipping');
  });
});
