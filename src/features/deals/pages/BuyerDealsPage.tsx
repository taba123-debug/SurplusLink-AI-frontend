import { ApiError } from '@/components/shared/ApiError';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { formatPKR } from '@/lib/money';
import { formatDate } from '@/lib/dates';
import { StatusBadge } from '@/components/ui/statusBadge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/emptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  Building2,
  ArrowRight,
  CreditCard,
  Lock,
  Unlock,
  CheckCircle2,
} from 'lucide-react';

export function BuyerDealsPage() {
  const navigate = useNavigate();

  const { data: deals, isLoading, error, refetch } = useQuery({
    queryKey: ['deals', 'buyer'],
    queryFn: () => api.getDeals('buyer'),
  });

  if (error) return <ApiError error={error} retry={refetch} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E3EAE5]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#176B4D] mb-1">
            <FileCheck2 className="w-4 h-4" />
            Confirmed Wholesale Agreements
          </div>
          <h1 className="text-2xl font-extrabold text-[#17251F]">
            My Purchased Deals
          </h1>
          <p className="text-sm text-[#64736B] mt-1">
            Review agreed deals, simulate checkout deposits, and unlock warehouse dispatch passes for physical inventory pickup.
          </p>
        </div>

        <Link to="/marketplace">
          <Button variant="outline" size="sm">
            Explore More Inventory
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
          title="No Confirmed Deals Yet"
          description="You haven't locked any wholesale deals yet. Submit an offer on surplus inventory to begin."
          actionLabel="View Marketplace"
          onAction={() => navigate('/marketplace')}
        />
      ) : (
        <div className="space-y-4">
          {deals.map((deal) => {
            const isPaid = deal.paymentStatus === 'SIMULATED_PAID';

            return (
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
                      Agreed {formatDate(deal.createdAt)}
                    </span>
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#176B4D] bg-[#EAF5EF] px-2 py-0.5 rounded">
                        <Unlock className="w-3 h-3" />
                        Pickup Unlocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B27318] bg-[#FEF8EC] px-2 py-0.5 rounded">
                        <Lock className="w-3 h-3" />
                        Simulated Payment Pending
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading font-bold text-base text-[#17251F]">
                    {deal.lotTitle}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#64736B]">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[#176B4D]" />
                      Supplier: {deal.sellerName}
                    </span>
                    <span>•</span>
                    <span>
                      Quantity: <strong>{deal.quantity} units</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Unit Price: <strong>{formatPKR(deal.unitPriceMinor)}</strong>
                    </span>
                    <span>•</span>
                    <span className="font-bold text-[#17251F]">
                      Total: {formatPKR(deal.buyerTotalMinor)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E3EAE5]">
                  <Link to={`/buyer/deals/${deal.id}`} className="w-full sm:w-auto">
                    <Button
                      variant={!isPaid ? 'primary' : 'outline'}
                      size="sm"
                      className="w-full font-semibold"
                    >
                      {!isPaid ? (
                        <>
                          <CreditCard className="w-3.5 h-3.5 mr-1" />
                          Simulate Checkout
                        </>
                      ) : (
                        <>
                          <FileCheck2 className="w-3.5 h-3.5 mr-1" />
                          View Pickup Pass
                        </>
                      )}
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
