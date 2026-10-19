import { ApiError } from '@/components/shared/ApiError';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { formatPKR } from '@/lib/money';
import { formatDate } from '@/lib/dates';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/emptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  BookmarkCheck,
  Sparkles,
  ArrowRight,
  Trash2,
  MapPin,
  Calendar,
  Boxes,
  Plus,
} from 'lucide-react';
import type { BuyerRequirement } from '@/types';

export function BuyerRequirementsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: requirements, isLoading, error, refetch } = useQuery({
    queryKey: ['requirements'],
    queryFn: () => api.getRequirements(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteRequirement(id),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('Requirement paused successfully');
    },
    onError: (err: Error) => {
      toast.error('Failed to pause requirement', { description: err.message });
    },
  });

  if (error) return <ApiError error={error} retry={refetch} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E3EAE5]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#176B4D] mb-1">
            <BookmarkCheck className="w-4 h-4" />
            Buyer Procurement Demand
          </div>
          <h1 className="text-2xl font-extrabold text-[#17251F]">
            Saved Inventory Requirements
          </h1>
          <p className="text-sm text-[#64736B] mt-1">
            Active demand profiles configured for automatic two-way matching with incoming bakery supplier surplus batches.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/buyer/ai-sourcing')}
          className="shrink-0"
        >
          <Sparkles className="w-4 h-4 text-[#E8A84B]" />
          Create Requirement with AI
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : !requirements || requirements.length === 0 ? (
        <EmptyState
          icon={<BookmarkCheck className="w-8 h-8 text-[#176B4D]" />}
          title="No Saved Requirements"
          description="You haven't saved any wholesale procurement requirements yet. Use the AI sourcing tool to describe what stock you need."
          actionLabel="Describe Requirements with AI"
          onAction={() => navigate('/buyer/ai-sourcing')}
        />
      ) : (
        <div className="space-y-4">
          {requirements.map((req) => (
            <div
              key={req.id}
              className="rounded-2xl border border-[#E3EAE5] bg-white p-5 hover:border-[#176B4D]/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xs"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#EAF5EF] text-[#176B4D]">
                    {req.category}
                  </span>
                  <span className="text-xs text-[#64736B]">
                    Created {formatDate(req.createdAt)}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#F8FAF8] text-[#17251F] font-medium border border-[#E3EAE5]">
                    Status: {req.status}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-base text-[#17251F] truncate">
                  {req.title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#64736B]">
                  <span className="flex items-center gap-1">
                    <Boxes className="w-3.5 h-3.5 text-[#176B4D]" />
                    Quantity: <strong>{req.requiredQuantity} units</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Budget: <strong>{formatPKR(req.maxTotalBudgetMinor)}</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#64736B]" />
                    Min Shelf-life: <strong>{req.minRemainingShelfLifeDays} days</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#64736B]" />
                    {req.city} {req.preferredArea ? `(${req.preferredArea})` : ''}
                  </span>
                </div>
              </div>

              {/* Matches badge & Action Buttons */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-[#E3EAE5]">
                <div className="text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#EAF5EF] text-[#176B4D] font-bold text-xs">
                    <Sparkles className="w-3 h-3 text-[#E8A84B]" />
                    <span>{req.matchCount ?? 0} Compatible Batches</span>
                  </div>
                </div>

                <Link
                  to={`/buyer/requirements/${req.id}/matches`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#176B4D] text-white text-xs font-bold hover:bg-[#10553C] transition-colors"
                >
                  <span>View Matches</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to pause this saved requirement?')) {
                      deleteMutation.mutate(req.id);
                    }
                  }}
                  className="p-2 rounded-xl text-[#64736B] hover:text-[#C44E4E] hover:bg-[#FDF2F2] transition-colors cursor-pointer"
                  title="Pause requirement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
