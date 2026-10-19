import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import type { LotFilters } from '@/types';
import { LotCard } from '../components/LotCard';
import { LotFiltersComponent } from '../components/LotFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/emptyState';
import { Button } from '@/components/ui/button';
import { Sparkles, SlidersHorizontal, ArrowUpDown, Package, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export function MarketplacePage() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<LotFilters>({
    category: (searchParams.get('category') || 'ALL') as LotFilters['category'],
    sortBy: 'newest',
  });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const { data: lots, isLoading, isError, refetch } = useQuery({
    queryKey: ['lots', filters],
    queryFn: () => api.getLots(filters),
  });

  const handleResetFilters = () => {
    setFilters({ category: 'ALL', sortBy: 'newest' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero / Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E3EAE5]">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#176B4D] mb-2">
            <span className="w-2 h-2 rounded-full bg-[#176B4D]" />
            Verified Wholesale Surplus Lots
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17251F] tracking-tight">
            Wholesale Opportunities
          </h1>
          <p className="mt-2 text-sm text-[#64736B] leading-relaxed">
            Browse verified bakery surplus inventory directly from commercial manufacturers in Pakistan. Negotiate prices, inspect shelf life, and close secure wholesale deals with full confidentiality.
          </p>
        </div>

        {/* AI Sourcing Banner CTA */}
        <div className="bg-[#EAF5EF] border border-[#176B4D]/20 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 max-w-md shrink-0 shadow-xs">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#176B4D] uppercase">
              <Sparkles className="w-4 h-4 text-[#E8A84B]" />
              Need Specific Stock?
            </div>
            <p className="text-xs text-[#17251F] font-medium mt-1">
              Describe your inventory requirement in plain Urdu/English.
            </p>
          </div>
          <Link
            to="/buyer/ai-sourcing"
            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#176B4D] text-white text-xs font-bold hover:bg-[#10553C] transition-colors"
          >
            AI Sourcing
          </Link>
        </div>
      </div>

      {/* Controls Bar: Count, Mobile filter button, Sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[#17251F]">
            {isLoading ? 'Loading lots...' : `${lots?.length || 0} Available Wholesale Lots`}
          </span>
          <span className="hidden sm:inline text-[#E3EAE5]">•</span>
          <span className="hidden sm:inline text-xs text-[#64736B]">
            All prices in Pakistani Rupees (PKR)
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 text-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
          </Button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs text-[#64736B]">
            <ArrowUpDown className="w-3.5 h-3.5 hidden sm:inline" />
            <span className="hidden sm:inline">Sort by:</span>
            <select
              value={filters.sortBy || 'newest'}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  sortBy: e.target.value as LotFilters['sortBy'],
                })
              }
              className="h-9 rounded-xl border border-[#E3EAE5] bg-white px-3 text-xs text-[#17251F] font-medium focus:outline-none focus:ring-2 focus:ring-[#176B4D]"
            >
              <option value="newest">Recently Listed</option>
              <option value="expiry_soon">Shortest Shelf-Life</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="qty_desc">Largest Quantity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid & Filters Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-1 rounded-2xl border border-[#E3EAE5] bg-white p-5 sticky top-24 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E3EAE5]">
            <span className="text-sm font-bold text-[#17251F] flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-[#176B4D]" />
              Filter Catalog
            </span>
          </div>
          <LotFiltersComponent
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Product Cards Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-[#E3EAE5] bg-white p-4 space-y-3">
                  <Skeleton className="aspect-16/10 w-full rounded-xl" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="pt-4 border-t border-[#E3EAE5] flex justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-8 w-20 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <EmptyState
              title="Failed to Load Inventory"
              description="An error occurred while fetching surplus lots from the database."
              actionLabel="Retry"
              onAction={() => refetch()}
            />
          ) : !lots || lots.length === 0 ? (
            <EmptyState
              icon={<Package className="w-8 h-8 text-[#176B4D]" />}
              title="No Wholesale Lots Match Your Filters"
              description="Try broadening your search keywords, price constraints, or minimum quantity filters."
              actionLabel="Reset Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {lots.map((lot) => (
                <LotCard key={lot.id} lot={lot} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer / Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E3EAE5]">
                <h3 className="font-bold text-base text-[#17251F]">Filter Wholesale Lots</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-[#64736B] hover:text-[#17251F]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <LotFiltersComponent
                filters={filters}
                onFilterChange={setFilters}
                onReset={handleResetFilters}
              />
            </div>

            <div className="pt-6 border-t border-[#E3EAE5] mt-6">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setMobileFilterOpen(false)}
              >
                Apply & View ({lots?.length || 0}) Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
