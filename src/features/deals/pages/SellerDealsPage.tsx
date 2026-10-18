import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { formatPKR } from '@/lib/money';
import { formatDate } from '@/lib/dates';
import { StatusBadge } from '@/components/ui/statusBadge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/emptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import {
  FileCheck2,
  Store,
  ArrowRight,
  Truck,
  CheckCircle2,
} from 'lucide-react';

export function SellerDealsPage() {
  const { data: deals, isLoading } = useQuery({
    queryKey: ['deals', 'seller'],
    queryFn: () => api.getDeals('seller'),
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E3EAE5]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#176B4D] mb-1">
            <FileCheck2 className="w-4 h-4" />
            Supplier Dispatch & Settlements
          </div>
          <h1 className="text-2xl font-extrabold text-[#17251F]">
            Finalized Wholesale Deals
          </h1>
          <p className="text-sm text-[#64736B] mt-1">
            Manage accepted buyer purchase agreements, coordinate warehouse vehicle collection, and track net proceeds.
          </p>
        </div>

        <Link to="/seller/inventory/new">
          <Button variant="primary" size="sm">
            List New Surplus Inventory
          </Button>
        </Link>
      </div>

      {/* Deals List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : !deals || deals.length === 0 ? (
        <EmptyState
          icon={<FileCheck2 className="w-8 h-8 text-[#176B4D]" />}
          title="No Finalized Deals Yet"
          description="When you accept incoming buyer offers, your confirmed sales agreements will be recorded here."
          actionLabel="View Incoming Offers"
          onAction={() => {}}
        />
      ) : (
        <div className="space-y-4">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="rounded-2xl border border-[#E3EAE5] bg-white p-5 hover:border-[#176B4D]/30 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xs"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-[#F8FAF8] px-2 py-0.5 rounded border border-[#E3EAE5]">
                    {deal.dealReference}
                  </span>
                  <StatusBadge status={deal.status} />
                  <span className="text-xs text-[#64736B]">
                    Accepted {formatDate(deal.createdAt)}
                  </span>
                  {deal.paymentStatus === 'SIMULATED_PAID' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#176B4D] bg-[#EAF5EF] px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      Payment Simulated
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-bold text-base text-[#17251F]">
                  {deal.lotTitle}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#64736B]">
                  <span className="flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-[#176B4D]" />
                    Buyer: <strong>{deal.buyerName}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Volume: <strong>{deal.quantity} units</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Agreed Price: <strong>{formatPKR(deal.unitPriceMinor)}/unit</strong>
                  </span>
                  <span>•</span>
                  <span className="font-bold text-[#176B4D]">
                    Net Proceeds: {formatPKR(deal.sellerNetProceedsMinor)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E3EAE5]">
                <Link to={`/seller/deals/${deal.id}`} className="w-full sm:w-auto">
                  <Button variant="secondary" size="sm" className="w-full font-semibold">
                    <Truck className="w-3.5 h-3.5 mr-1" />
                    Manage Handover
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
