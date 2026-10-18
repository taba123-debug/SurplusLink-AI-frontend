import { describe, it, expect, beforeEach } from 'vitest';
import { MockMarketplaceApi } from '@/services/mock/mockMarketplaceApi';
import { useDemoStore } from '@/store/useDemoStore';

describe('Deals, Checkout & Logistics Authorization', () => {
  let mockApi: MockMarketplaceApi;

  beforeEach(() => {
    localStorage.clear();
    useDemoStore.getState().setCurrentRole('buyer');
    mockApi = new MockMarketplaceApi();
  });

  it('locks confidential pickup details before payment and unlocks after simulated payment', async () => {
    const deals = await mockApi.getDeals('admin');
    const unpaidDeal = deals.find((d) => d.paymentStatus === 'UNPAID');
    expect(unpaidDeal).toBeDefined();

    // Verify private details are locked prior to payment
    expect(unpaidDeal?.privatePickupDetails).toBeUndefined();

    // Simulate payment success
    const paidDeal = await mockApi.simulatePayment(unpaidDeal!.id, 'SUCCESS');
    expect(paidDeal.paymentStatus).toBe('SIMULATED_PAID');
    expect(paidDeal.pickupStatus).toBe('READY_FOR_PICKUP');
    expect(paidDeal.status).toBe('PAID_AWAITING_PICKUP');

    // Verify private pickup details are now unlocked
    expect(paidDeal.privatePickupDetails).toBeDefined();
    expect(paidDeal.privatePickupDetails?.warehouseAddress).toBeTruthy();
    expect(paidDeal.privatePickupDetails?.releaseCode).toMatch(/^SL-OTP-/);
    expect(paidDeal.privatePickupDetails?.phone).toBeTruthy();
  });

  it('allows pickup confirmation and completes deal', async () => {
    const deals = await mockApi.getDeals();
    const paidDeal = deals.find((d) => d.paymentStatus === 'SIMULATED_PAID' && d.status !== 'COMPLETED');
    expect(paidDeal).toBeDefined();

    const completed = await mockApi.confirmPickup(paidDeal!.id);
    expect(completed.status).toBe('COMPLETED');
    expect(completed.pickupStatus).toBe('COLLECTED');
    expect(completed.completedAt).toBeDefined();
  });
});
