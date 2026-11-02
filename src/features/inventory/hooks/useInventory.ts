import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { queryKeys } from '@/shared/api/queryKeys';
import { useDemoStore } from '@/store/useDemoStore';
import type { LotStatus } from '@/types';

export function useSellerInventory() {
  const organizationId = useDemoStore((state) => state.currentOrg.id);

  return useQuery({
    queryKey: queryKeys.lots.own(organizationId),
    queryFn: () => api.getOwnLots ? api.getOwnLots() : api.getLots(),
  });
}

export function useUpdateLotStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LotStatus }) =>
      api.updateLotStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lots.all });
      toast.success(`Lot status updated to ${variables.status}`);
    },
    onError: (error: Error) => {
      toast.error('Failed to update lot status', { description: error.message });
    },
  });
}
