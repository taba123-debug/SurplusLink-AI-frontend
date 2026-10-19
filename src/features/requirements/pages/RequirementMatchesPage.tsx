import { ApiError } from '@/components/shared/ApiError';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { formatPKR } from '@/lib/money';
import { LotCard } from '@/features/marketplace/components/LotCard';
import { EmptyState } from '@/components/ui/emptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Sliders, Boxes, MapPin, Calendar } from 'lucide-react';

export function RequirementMatchesPage() {
  const { id } = useParams<{ id: string }>();

  const { data: requirement, isLoading: reqLoading } = useQuery({
    queryKey: ['requirement', id],
    queryFn: () => api.getRequirement(id!),
    enabled: !!id,
  });

  const { data: matches, isLoading: matchesLoading, error, refetch } = useQuery({
    queryKey: ['requirement-matches', id],
    queryFn: () => api.getRequirementMatches(id!),
    enabled: !!id,
  });

  const isLoading = reqLoading || matchesLoading;

  if (error) return <ApiError error={error} retry={refetch} />;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!requirement) {
    return (
      <EmptyState
        title="Requirement Not Found"
        description="The requested procurement requirement does not exist."
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/buyer/requirements"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64736B] hover:text-[#176B4D] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Saved Requirements
        </Link>
      </div>

      {/* Requirement Summary Card */}
      <div className="rounded-2xl border border-[#E3EAE5] bg-white p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase bg-[#EAF5EF] text-[#176B4D]">
              {requirement.category}
            </span>
            <span className="text-xs text-[#64736B]">Requirement Profile</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#17251F]">
            {requirement.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#64736B]">
            <span className="flex items-center gap-1 text-[#17251F] font-semibold">
              <Boxes className="w-3.5 h-3.5 text-[#176B4D]" />
              {requirement.requiredQuantity} units required
            </span>
            <span>•</span>
            <span>
              Max Budget: <strong>{formatPKR(requirement.maxTotalBudgetMinor)}</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Min Shelf Life: {requirement.minRemainingShelfLifeDays}+ days
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {requirement.city}
            </span>
          </div>
        </div>

        <Link to="/buyer/ai-sourcing">
          <Button variant="outline" size="sm" className="text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#E8A84B] mr-1.5" />
            Rerun with AI Sourcing
          </Button>
        </Link>
      </div>

      {/* Match Results Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg text-[#17251F]">
            Compatible Wholesale Batches ({matches?.length || 0})
          </h2>
          <span className="text-xs text-[#64736B]">
            Ranked by AI compatibility & budget score
          </span>
        </div>

        {!matches || matches.length === 0 ? (
          <EmptyState
            title="No Compatible Batches Found Yet"
            description="There are currently no active lots that meet this requirement. When manufacturers upload compatible inventory, it will automatically appear here."
            actionLabel="Browse Marketplace"
            onAction={() => { window.location.href = '/marketplace'; }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map(({ lot, compatibilityScore, matchReasons, budgetCompatibility }) => (
              <LotCard
                requirementId={requirement.id}
                requiredQuantity={requirement.requiredQuantity}
                key={lot.id}
                lot={lot}
                matchScore={compatibilityScore}
                matchReasons={matchReasons}
                budgetCompatibility={budgetCompatibility}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
