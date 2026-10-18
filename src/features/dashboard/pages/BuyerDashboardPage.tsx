import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { formatPKR } from '@/lib/money';
import { formatDate } from '@/lib/dates';
import { StatusBadge } from '@/components/ui/statusBadge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store,
  Sparkles,
  BookmarkCheck,
  HandCoins,
  FileCheck2,
  PackageSearch,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useDemoStore } from '@/store/useDemoStore';

export function BuyerDashboardPage() {
  const navigate = useNavigate();
  const { currentOrg } = useDemoStore();

  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard', 'buyer'],
    queryFn: () => api.getDashboard('buyer'),
  });

  const { data: lots } = useQuery({
    queryKey: ['lots'],
    queryFn: () => api.getLots(),
  });

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E3EAE5]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#176B4D] mb-1">
            <Store className="w-4 h-4" />
            Retail Procurement Portal
          </div>
          <h1 className="text-2xl font-extrabold text-[#17251F]">
            Welcome, {currentOrg.name}
          </h1>
          <p className="text-sm text-[#64736B] mt-1">
            {currentOrg.businessType} • {currentOrg.area}, {currentOrg.city}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/buyer/ai-sourcing">
            <Button variant="primary" size="sm" className="font-bold">
              <Sparkles className="w-4 h-4 mr-1 text-[#E8A84B]" />
              AI Inventory Sourcing
            </Button>
          </Link>
          <Link to="/marketplace">
            <Button variant="outline" size="sm">
              Browse Lots
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#64736B] mb-2">
            <span className="text-xs font-semibold uppercase">Saved Requirements</span>
            <BookmarkCheck className="w-4 h-4 text-[#176B4D]" />
          </div>
          <div className="text-2xl font-extrabold text-[#17251F]">
            {metrics.activeRequirements ?? 0}
          </div>
          <p className="text-[11px] text-[#64736B] mt-1">Active demand profiles</p>
        </div>

        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#64736B] mb-2">
            <span className="text-xs font-semibold uppercase">Pending Offers</span>
            <HandCoins className="w-4 h-4 text-[#B27318]" />
          </div>
          <div className="text-2xl font-extrabold text-[#17251F]">
            {metrics.pendingOffers}
          </div>
          <p className="text-[11px] text-[#64736B] mt-1">Awaiting seller response</p>
        </div>

        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#64736B] mb-2">
            <span className="text-xs font-semibold uppercase">Agreed Deals</span>
            <FileCheck2 className="w-4 h-4 text-[#176B4D]" />
          </div>
          <div className="text-2xl font-extrabold text-[#17251F]">
            {metrics.acceptedDeals}
          </div>
          <p className="text-[11px] text-[#64736B] mt-1">Total locked contracts</p>
        </div>

        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#64736B] mb-2">
            <span className="text-xs font-semibold uppercase">Completed Purchases</span>
            <TrendingUp className="w-4 h-4 text-[#176B4D]" />
          </div>
          <div className="text-2xl font-extrabold text-[#176B4D]">
            {formatPKR(metrics.completedDealValueMinor)}
          </div>
          <p className="text-[11px] text-[#64736B] mt-1">Simulated completed volume</p>
        </div>
      </div>

      {/* Main Grid: Left Recent Offers, Right Recent Deals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Offers */}
        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3EAE5]">
            <h3 className="font-heading font-bold text-base text-[#17251F] flex items-center gap-2">
              <HandCoins className="w-4 h-4 text-[#176B4D]" />
              Recent Procurement Offers
            </h3>
            <Link to="/buyer/offers" className="text-xs font-semibold text-[#176B4D] hover:underline">
              View All ({recentOffers.length})
            </Link>
          </div>

          {recentOffers.length === 0 ? (
            <p className="text-xs text-[#64736B] py-6 text-center">
              No recent offers. Browse wholesale surplus lots to initiate proposals.
            </p>
          ) : (
            <div className="divide-y divide-[#E3EAE5]">
              {recentOffers.map((o) => (
                <div key={o.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="font-bold text-[#17251F] truncate">{o.lotTitle}</div>
                    <div className="text-[#64736B]">
                      {o.requestedQuantity} units @ {formatPKR(o.offeredUnitPriceMinor)}/unit
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <StatusBadge status={o.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Deals */}
        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3EAE5]">
            <h3 className="font-heading font-bold text-base text-[#17251F] flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#176B4D]" />
              Confirmed Wholesale Deals
            </h3>
            <Link to="/buyer/deals" className="text-xs font-semibold text-[#176B4D] hover:underline">
              View All ({recentDeals.length})
            </Link>
          </div>

          {recentDeals.length === 0 ? (
            <p className="text-xs text-[#64736B] py-6 text-center">
              No confirmed deals yet. Once a seller accepts your offer, deals will appear here.
            </p>
          ) : (
            <div className="divide-y divide-[#E3EAE5]">
              {recentDeals.map((d) => (
                <div key={d.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="font-bold text-[#17251F] truncate">{d.lotTitle}</div>
                    <div className="text-[#64736B]">
                      {d.quantity} units • Total: <strong>{formatPKR(d.buyerTotalMinor)}</strong>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <StatusBadge status={d.status} />
                    <Link to={`/buyer/deals/${d.id}`}>
                      <Button variant="outline" size="sm" className="h-7 text-[11px] px-2">
                        Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
