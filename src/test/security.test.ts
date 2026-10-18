import { describe, it, expect, beforeEach } from 'vitest';
import { MockMarketplaceApi } from '@/services/mock/mockMarketplaceApi';
import { useDemoStore } from '@/store/useDemoStore';

describe('Confidential Seller Reserve Price Security', () => {
  let mockApi: MockMarketplaceApi;

  beforeEach(() => {
    localStorage.clear();
    mockApi = new MockMarketplaceApi();
  });

  it('strips confidential reserve price when buyer requests lots', async () => {
    useDemoStore.getState().setCurrentRole('buyer');

    const lots = await mockApi.getLots();
    expect(lots.length).toBeGreaterThan(0);

    for (const lot of lots) {
      expect(lot.reserveUnitPriceMinor).toBeUndefined();
    }

    const singleLot = await mockApi.getLot(lots[0].id);
    expect(singleLot.reserveUnitPriceMinor).toBeUndefined();
  });

  it('allows owning seller to see their own confidential reserve price', async () => {
    useDemoStore.getState().setCurrentRole('seller');
    const currentOrg = useDemoStore.getState().currentOrg;

    const lots = await mockApi.getLots();
    const myLots = lots.filter((l) => l.sellerId === currentOrg.id);

    expect(myLots.length).toBeGreaterThan(0);
    // Owning seller can inspect their own reserve price
    expect(myLots[0].reserveUnitPriceMinor).toBeDefined();
  });
});
