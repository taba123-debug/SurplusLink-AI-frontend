import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { formatPKR } from '@/lib/money';
import { formatDate } from '@/lib/dates';
import { StatusBadge } from '@/components/ui/statusBadge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/emptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  HandCoins,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  CreditCard,
} from 'lucide-react';
import type { Offer, OfferStatus } from '@/types';

export function BuyerOffersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'COUNTERED' | 'ACCEPTED'>('ALL');

  const { data: offers, isLoading } = useQuery({
    queryKey: ['offers', 'buyer'],
    queryFn: () => api.getOffers('buyer'),
  });

  // Accept seller counter-offer mutation
  const acceptCounterMutation = useMutation({
    mutationFn: (offerId: string) =>
      api.respondToOffer(offerId, { action: 'ACCEPT' }),
    onSuccess: (updatedOffer) => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Accepted seller counter terms!', {
        description: 'Deal generated and awaiting simulated payment.',
      });
      if (updatedOffer.dealId) {
        navigate(`/buyer/deals/${updatedOffer.dealId}`);
      }
    },
    onError: (err: Error) => {
      toast.error('Failed to accept counter-offer', { description: err.message });
    },
  });

  const filteredOffers = (offers || []).filter((o) => {
    if (filterTab === 'ALL') return true;
    if (filterTab === 'PENDING') return o.status === 'PENDING';
    if (filterTab === 'COUNTERED') return o.status === 'COUNTERED';
    if (filterTab === 'ACCEPTED') return o.status === 'ACCEPTED';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E3EAE5]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#176B4D] mb-1">
            <HandCoins className="w-4 h-4" />
            Wholesale Procurement Negotiations
          </div>
          <h1 className="text-2xl font-extrabold text-[#17251F]">
            My Submitted Offers
          </h1>
          <p className="text-sm text-[#64736B] mt-1">
            Track wholesale proposals, review supplier counter-offers, and proceed to checkout when agreements are finalized.
          </p>
        </div>

        <Link to="/marketplace">
          <Button variant="outline" size="sm">
            Browse More Wholesale Lots
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E3EAE5]">
        {[
          { label: 'All Offers', value: 'ALL' },
          { label: 'Awaiting Seller Response', value: 'PENDING' },
          { label: 'Countered by Seller', value: 'COUNTERED' },
          { label: 'Accepted & Deals', value: 'ACCEPTED' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterTab(tab.value as typeof filterTab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterTab === tab.value
                ? 'bg-[#176B4D] text-white shadow-2xs'
                : 'text-[#64736B] hover:text-[#17251F] hover:bg-[#F8FAF8]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Offers List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : filteredOffers.length === 0 ? (
        <EmptyState
          icon={<HandCoins className="w-8 h-8 text-[#176B4D]" />}
          title="No Offers in this Category"
          description="You haven't submitted any offers matching this filter. Explore the marketplace to find surplus lots and make an offer."
          actionLabel="View Wholesale Catalog"
          onAction={() => navigate('/marketplace')}
        />
      ) : (
        <div className="space-y-4">
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className="rounded-2xl border border-[#E3EAE5] bg-white p-5 hover:border-[#176B4D]/30 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xs"
            >
              {/* Left Details */}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#64736B] bg-[#F8FAF8] px-2 py-0.5 rounded border border-[#E3EAE5]">
                    {offer.offerReference}
                  </span>
                  <StatusBadge status={offer.status} />
                  <span className="text-xs text-[#64736B]">
                    Submitted {formatDate(offer.createdAt)}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-base text-[#17251F]">
                  {offer.lotTitle}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#64736B]">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#176B4D]" />
                    {offer.sellerDescriptor}
                  </span>
                  <span>•</span>
                  <span>
                    Requested: <strong>{offer.requestedQuantity} units</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Proposed Price: <strong>{formatPKR(offer.offeredUnitPriceMinor)}/unit</strong>
                  </span>
                  <span>•</span>
                  <span className="text-[#17251F] font-semibold">
                    Subtotal: {formatPKR(offer.offerSubtotalMinor)}
                  </span>
                </div>

                {/* Counter Offer Callout if Countered */}
                {offer.status === 'COUNTERED' && offer.sellerCounterUnitPriceMinor && (
                  <div className="p-3.5 rounded-xl bg-[#FEF8EC] border border-[#E8A84B]/40 text-xs space-y-1.5 mt-2">
                    <div className="flex items-center gap-1.5 font-bold text-[#B27318]">
                      <AlertCircle className="w-4 h-4" />
                      <span>Seller Counter-Proposed: {formatPKR(offer.sellerCounterUnitPriceMinor)}/unit</span>
                      {offer.sellerCounterQuantity && (
                        <span>for {offer.sellerCounterQuantity} units</span>
                      )}
                    </div>
                    {offer.sellerCounterNote && (
                      <p className="text-[#17251F]/90 italic">
                        "{offer.sellerCounterNote}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Right Action Center */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#E3EAE5]">
                {offer.status === 'ACCEPTED' && offer.dealId && (
                  <Link to={`/buyer/deals/${offer.dealId}`} className="w-full sm:w-auto">
                    <Button variant="primary" size="sm" className="w-full font-bold">
                      <CreditCard className="w-3.5 h-3.5 mr-1" />
                      Simulated Checkout & Pickup
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                )}

                {offer.status === 'COUNTERED' && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => acceptCounterMutation.mutate(offer.id)}
                      isLoading={acceptCounterMutation.isPending}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Accept Counter
                    </Button>
                    <Link to={`/marketplace/${offer.lotId}`}>
                      <Button variant="outline" size="sm">
                        View Lot
                      </Button>
                    </Link>
                  </div>
                )}

                {offer.status === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#64736B] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#B27318]" />
                      Under Supplier Review
                    </span>
                    <Link to={`/marketplace/${offer.lotId}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        View Lot
                      </Button>
                    </Link>
                  </div>
                )}

                {(offer.status === 'REJECTED' || offer.status === 'EXPIRED') && (
                  <Link to="/marketplace">
                    <Button variant="outline" size="sm">
                      Find Alternative Lots
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
