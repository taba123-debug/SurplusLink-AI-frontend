import { ApiError } from '@/components/shared/ApiError';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { formatPKR } from '@/lib/money';
import { formatDate, getDaysRemaining } from '@/lib/dates';
import { StatusBadge } from '@/components/ui/statusBadge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  PackagePlus,
  Boxes,
  HandCoins,
  FileCheck2,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useDemoStore } from '@/store/useDemoStore';

export function SellerDashboardPage() {
  const navigate = useNavigate();
  const { currentOrg } = useDemoStore();

  const { data: summary, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', 'seller'],
    queryFn: () => api.getDashboard('seller'),
  });

  const { data: lots } = useQuery({
    queryKey: ['lots', 'seller'],
    queryFn: () => api.getOwnLots ? api.getOwnLots() : api.getLots(),
  });

  const { data: requirements } = useQuery({
    queryKey: ['requirements'],
    queryFn: () => api.getRequirements(),
  });

  if (error) return <ApiError error={error} retry={refetch} />;

  if (isLoading || !summary) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const { metrics, recentDeals, recentOffers } = summary;

  // Filter lots belonging to current seller nearing expiry (<= 45 days)
  const sellerLots = (lots || []).filter((l) => l.sellerId === currentOrg.id);
  const expiringLots = sellerLots
    .filter((l) => l.status === 'ACTIVE' && getDaysRemaining(l.expiryDate) <= 45)
    .sort((a, b) => getDaysRemaining(a.expiryDate) - getDaysRemaining(b.expiryDate));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E3EAE5]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#176B4D] mb-1">
            <Building2 className="w-4 h-4" />
            Supplier Operational Hub
          </div>
          <h1 className="text-2xl font-extrabold text-[#17251F]">
            {currentOrg.name} Dashboard
          </h1>
          <p className="text-sm text-[#64736B] mt-1">
            {currentOrg.businessType} • {currentOrg.area}, {currentOrg.city}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/seller/inventory/new">
            <Button variant="primary" size="sm" className="font-bold">
              <PackagePlus className="w-4 h-4 mr-1.5" />
              List New Surplus
            </Button>
          </Link>
          <Link to="/seller/analytics">
            <Button variant="outline" size="sm">
              View Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold text-[#64736B] uppercase mb-1">
            Active Lots
          </div>
          <div className="text-2xl font-extrabold text-[#17251F]">
            {metrics.activeLots ?? 0}
          </div>
          <p className="text-[10px] text-[#64736B] mt-0.5">Live on marketplace</p>
        </div>

        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold text-[#64736B] uppercase mb-1">
            Units Listed
          </div>
          <div className="text-2xl font-extrabold text-[#17251F]">
            {metrics.unitsListed ?? 0}
          </div>
          <p className="text-[10px] text-[#64736B] mt-0.5">Total surplus volume</p>
        </div>

        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold text-[#64736B] uppercase mb-1">
            Pending Offers
          </div>
          <div className="text-2xl font-extrabold text-[#B27318]">
            {metrics.pendingOffers}
          </div>
          <p className="text-[10px] text-[#64736B] mt-0.5">Awaiting your review</p>
        </div>

        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold text-[#64736B] uppercase mb-1">
            Accepted Deals
          </div>
          <div className="text-2xl font-extrabold text-[#17251F]">
            {metrics.acceptedDeals}
          </div>
          <p className="text-[10px] text-[#64736B] mt-0.5">Agreements locked</p>
        </div>

        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold text-[#64736B] uppercase mb-1">
            Completed Sales
          </div>
          <div className="text-2xl font-extrabold text-[#176B4D]">
            {formatPKR(metrics.completedDealValueMinor)}
          </div>
          <p className="text-[10px] text-[#64736B] mt-0.5">Simulated volume</p>
        </div>

        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold text-[#64736B] uppercase mb-1">
            Est. 2% Platform Fee
          </div>
          <div className="text-2xl font-extrabold text-[#17251F]">
            {formatPKR(metrics.platformFeesMinor)}
          </div>
          <p className="text-[10px] text-[#64736B] mt-0.5">Transparent 2% fee</p>
        </div>
      </div>

      {/* Expiry Urgency Alert Banner if any lots are nearing expiry */}
      {expiringLots.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#FEF8EC] border border-[#E8A84B]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#B27318] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-[#17251F]">
                Inventory Attention: {expiringLots.length} Batch(es) Nearing Expiry
              </h4>
              <p className="text-xs text-[#64736B] mt-0.5">
                "{expiringLots[0].title}" has {getDaysRemaining(expiringLots[0].expiryDate)} days of shelf-life remaining. Review incoming buyer offers or adjust asking price to accelerate clearance.
              </p>
            </div>
          </div>
          <Link to="/seller/offers" className="shrink-0">
            <Button variant="accent" size="sm" className="text-xs font-bold">
              Review Offers
            </Button>
          </Link>
        </div>
      )}

      {/* Main Grid: Incoming Offers vs Compatible Buyer Demand */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Incoming Buyer Offers */}
        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3EAE5]">
            <h3 className="font-heading font-bold text-base text-[#17251F] flex items-center gap-2">
              <HandCoins className="w-4 h-4 text-[#176B4D]" />
              Incoming Buyer Proposals
            </h3>
            <Link to="/seller/offers" className="text-xs font-semibold text-[#176B4D] hover:underline">
              View All ({recentOffers.length})
            </Link>
          </div>

          {recentOffers.length === 0 ? (
            <p className="text-xs text-[#64736B] py-6 text-center">
              No pending buyer offers at this time.
            </p>
          ) : (
            <div className="divide-y divide-[#E3EAE5]">
              {recentOffers.map((o) => (
                <div key={o.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="font-bold text-[#17251F] truncate">{o.lotTitle}</div>
                    <div className="text-[#64736B]">
                      Buyer: <strong>{o.buyerName}</strong> • {o.requestedQuantity} units @ {formatPKR(o.offeredUnitPriceMinor)}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <StatusBadge status={o.status} />
                    <Link to="/seller/offers">
                      <Button variant="outline" size="sm" className="h-7 text-[11px] px-2 font-semibold">
                        Action
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Compatible Retail Buyer Demand in Marketplace */}
        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3EAE5]">
            <h3 className="font-heading font-bold text-base text-[#17251F] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E8A84B]" />
              Compatible Retail Buyer Demand
            </h3>
            <span className="text-xs text-[#64736B]">Active Marketplace Needs</span>
          </div>

          {!requirements || requirements.length === 0 ? (
            <p className="text-xs text-[#64736B] py-6 text-center">
              No active retail requirements currently listed.
            </p>
          ) : (
            <div className="divide-y divide-[#E3EAE5]">
              {requirements.slice(0, 4).map((req) => (
                <div key={req.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="font-bold text-[#17251F] truncate">
                      {req.buyerName} wants {req.requiredQuantity} {req.category.toLowerCase()}
                    </div>
                    <div className="text-[#64736B]">
                      Budget: {formatPKR(req.maxTotalBudgetMinor)} • Location: {req.city}
                    </div>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#EAF5EF] text-[#176B4D] font-semibold shrink-0">
                    Compatible
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
