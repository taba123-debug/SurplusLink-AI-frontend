import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { LotFilters, ProductCategory } from '@/types';

const numberParam = (value: string | null) => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

const booleanParam = (value: string | null) => value === 'true';

export function useMarketplaceFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<LotFilters>(() => ({
    category: (searchParams.get('category') as ProductCategory | 'ALL' | null) || 'ALL',
    city: searchParams.get('city') || undefined,
    search: searchParams.get('q') || undefined,
    minQuantity: numberParam(searchParams.get('minQuantity')),
    minShelfLifeDays: numberParam(searchParams.get('shelfLife')),
    minPriceMinor: numberParam(searchParams.get('minPrice')),
    maxPriceMinor: numberParam(searchParams.get('maxPrice')),
    packagingType: searchParams.get('packaging') || undefined,
    status: (searchParams.get('status') as LotFilters['status']) || undefined,
    verifiedOnly: booleanParam(searchParams.get('verified')),
    sortBy: (searchParams.get('sort') as LotFilters['sortBy']) || 'newest',
  }), [searchParams]);

  const updateFilters = (next: LotFilters) => {
    const params = new URLSearchParams();
    const values: Record<string, string | number | boolean | undefined> = {
      category: next.category !== 'ALL' ? next.category : undefined,
      city: next.city,
      q: next.search,
      minQuantity: next.minQuantity,
      shelfLife: next.minShelfLifeDays,
      minPrice: next.minPriceMinor,
      maxPrice: next.maxPriceMinor,
      packaging: next.packagingType,
      status: next.status,
      verified: next.verifiedOnly ? true : undefined,
      sort: next.sortBy !== 'newest' ? next.sortBy : undefined,
    };

    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== false) params.set(key, String(value));
    });
    setSearchParams(params, { replace: true });
  };

  const resetFilters = () => setSearchParams({}, { replace: true });

  const activeFilterCount = [
    filters.category !== 'ALL', Boolean(filters.city), Boolean(filters.search),
    Boolean(filters.minQuantity), Boolean(filters.minShelfLifeDays),
    Boolean(filters.minPriceMinor), Boolean(filters.maxPriceMinor),
    Boolean(filters.packagingType), Boolean(filters.status), Boolean(filters.verifiedOnly),
  ].filter(Boolean).length;

  return { filters, updateFilters, resetFilters, activeFilterCount };
}
