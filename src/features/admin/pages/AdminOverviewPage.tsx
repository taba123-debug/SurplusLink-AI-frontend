import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { formatPKR } from '@/lib/money';
import { formatDate } from '@/lib/dates';
import { StatusBadge } from '@/components/ui/statusBadge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SEED_ORGANIZATIONS } from '@/store/useDemoStore';
import { toast } from 'sonner';
import {
  Shield,
  RotateCcw,
  Building2,
  Store,
  CheckCircle2,
  TrendingUp,
  FileCheck2,
  HandCoins,
  Boxes,
} from 'lucide-react';

export function AdminOverviewPage() {
  const queryClient = useQueryClient();

  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: () => api.getDashboard('admin'),
  });

  const handleResetData = () => {
    if (window.confirm('Reset all demo state to original seed data? This will clear any created lots, offers, and deals.')) {
      localStorage.removeItem('surpluslink_mock_db_v1');
      queryClient.invalidateQueries();
      toast.success('Demo data restored to pristine initial seed fixtures!');
    }
  };

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

  const { metrics, recentDeals } = summary;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E3EAE5]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700 mb-1">
            <Shield className="w-4 h-4" />
            Marketplace Operator Portal
          </div>
          <h1 className="text-2xl font-extrabold text-[#17251F]">
            SurplusLink Platform Governance
          </h1>
          <p className="text-sm text-[#64736B] mt-1">
            System-wide operational oversight, verified business directory, and simulated commission ledger across Pakistan.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleResetData}
          className="text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          Reset All Demo Data
        </Button>
      </div>

      {/* Network KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-5 shadow-xs">
          <div className="text-xs font-semibold text-[#64736B] uppercase mb-1">
            Active Surplus Batches
          </div>
          <div className="text-2xl font-extrabold text-[#17251F]">
            {metrics.activeLots}
          </div>
          <p className="text-[11px] text-[#64736B] mt-1">Across 3 verified suppliers</p>
        </div>

        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-5 shadow-xs">
          <div className="text-xs font-semibold text-[#64736B] uppercase mb-1">
            Negotiation Offers
          </div>
          <div className="text-2xl font-extrabold text-[#B27318]">
            {metrics.pendingOffers}
          </div>
          <p className="text-[11px] text-[#64736B] mt-1">Pending buyer proposals</p>
        </div>

        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-5 shadow-xs">
          <div className="text-xs font-semibold text-[#64736B] uppercase mb-1">
            Total Wholesale Traded
          </div>
          <div className="text-2xl font-extrabold text-[#176B4D]">
            {formatPKR(metrics.completedDealValueMinor)}
          </div>
          <p className="text-[11px] text-[#64736B] mt-1">Simulated completed volume</p>
        </div>

        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-5 shadow-xs">
          <div className="text-xs font-semibold text-[#64736B] uppercase mb-1">
            Platform Gross Fee (4%)
          </div>
          <div className="text-2xl font-extrabold text-[#17251F]">
            {formatPKR(metrics.platformFeesMinor)}
          </div>
          <p className="text-[11px] text-[#64736B] mt-1">2% buyer + 2% seller</p>
        </div>
      </div>

      {/* Registered Organizations Directory */}
      <div className="rounded-2xl border border-[#E3EAE5] bg-white p-6 shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-base text-[#17251F]">
          Verified Marketplace Trading Organizations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SEED_ORGANIZATIONS.map((org) => (
            <div
              key={org.id}
              className="p-4 rounded-xl border border-[#E3EAE5] bg-[#F8FAF8] flex items-center justify-between text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#17251F] text-sm">{org.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded uppercase text-[10px] font-bold ${
                      org.role === 'buyer'
                        ? 'bg-[#EAF5EF] text-[#176B4D]'
                        : org.role === 'seller'
                        ? 'bg-[#FEF8EC] text-[#B27318]'
                        : 'bg-purple-50 text-purple-700'
                    }`}
                  >
                    {org.role}
                  </span>
                </div>
                <div className="text-[#64736B]">
                  {org.businessType} • {org.area}, {org.city}
                </div>
                <div className="text-[11px] text-[#64736B]">
                  Contact: {org.contactPerson} ({org.phone})
                </div>
              </div>

              {org.verified && (
                <span className="flex items-center gap-1 text-[11px] text-[#176B4D] font-semibold bg-white border border-[#176B4D]/20 px-2 py-0.5 rounded-lg shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Platform Deals */}
      <div className="rounded-2xl border border-[#E3EAE5] bg-white p-6 shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-base text-[#17251F]">
          Recent Marketplace Trade Ledger
        </h3>

        <div className="divide-y divide-[#E3EAE5]">
          {recentDeals.map((deal) => (
            <div key={deal.id} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div className="min-w-0">
                <div className="font-bold text-[#17251F] truncate">{deal.lotTitle}</div>
                <div className="text-[#64736B]">
                  {deal.buyerName} ➔ {deal.sellerName} • {deal.quantity} units • {formatPKR(deal.subtotalMinor)}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-bold text-[#176B4D]">
                  Platform Fee: {formatPKR(deal.platformGrossRevenueMinor)}
                </span>
                <StatusBadge status={deal.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
