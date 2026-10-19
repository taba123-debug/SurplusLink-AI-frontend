import { describe, it, expect } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { FeeBreakdown } from '@/components/shared/FeeBreakdown';
import { mapLot } from '@/services/http/httpMarketplaceApi';
import type { LotPrivate } from '@/services/http/contracts';
import type { Deal } from '@/types';

describe('backend data boundaries', () => {
  it('drops seller-only fields even when accidentally present in a public payload', () => {
    const source: LotPrivate = { id: 'lot-1', seller_org_id: 'seller-1', product_name: 'Biscuits', category: 'biscuits', description: 'Sealed biscuits',
      quantity_total: 200, quantity_reserved: 0, quantity_sold: 0, available_quantity: 200, unit: 'pack', asking_unit_price_minor: 14000,
      minimum_order_quantity: 10, packaging_type: 'sealed', storage_type: 'ambient', manufacture_date: null, expiry_date: '2026-12-03',
      city: 'lahore', pickup_area: 'Gulberg', pickup_deadline: '2026-10-22T10:00:00Z', resale_confirmed: true, information_confirmed: true,
      status: 'ACTIVE', created_at: '2026-10-19T10:00:00Z', min_unit_price_minor: 11000, pickup_address: 'PRIVATE ADDRESS', original_description: 'PRIVATE SELLER NOTES' };
    const publicLot = mapLot(source);
    expect(publicLot).not.toHaveProperty('reserveUnitPriceMinor');
    expect(JSON.stringify(publicLot)).not.toContain('PRIVATE');
    expect(mapLot(source, source).reserveUnitPriceMinor).toBe(11000);
  });

  it('renders backend financial values without applying frontend fee formulas', () => {
    const deal = { subtotalMinor: 10000, buyerServiceFeeMinor: 777, sellerCommissionMinor: 888, buyerTotalMinor: 10777, sellerNetProceedsMinor: 9112 } as Deal;
    render(<FeeBreakdown subtotalMinor={10000} deal={deal} />);
    expect(screen.getByText('Rs. 107.77')).toBeDefined();
    expect(screen.getByText('Rs. 91.12')).toBeDefined();
    expect(screen.getByText('Rs. 7.77')).toBeDefined();
    expect(screen.getByText('Rs. 8.88')).toBeDefined();
    cleanup();
  });
});
