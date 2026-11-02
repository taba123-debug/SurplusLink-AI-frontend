import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { queryKeys } from '@/shared/api/queryKeys';
import type { LotFilters } from '@/types';

export function useMarketplaceLots(filters: LotFilters) {
  return useQuery({
    queryKey: queryKeys.lots.list(filters),
    queryFn: () => api.getLots(filters),
  });
}

export function useMarketplaceLot(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.lots.detail(id ?? ''),
    queryFn: () => api.getLot(id!),
    enabled: Boolean(id),
  });
}
