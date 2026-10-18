import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { formatPKR } from '@/lib/money';
import { formatDate } from '@/lib/dates';
import { StatusBadge } from '@/components/ui/statusBadge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/emptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { CounterOfferDialog } from '../components/CounterOfferDialog';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  HandCoins,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  Store,
  Calendar,
  Boxes,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import type { Offer } from '@/types';

export function SellerOffersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [counterModalOffer, setCounterModalOffer] = useState<Offer | null>(null);

  const { data: offers, isLoading } = useQuery({
    queryKey: ['offers', 'seller'],
    queryFn: () => api.getOffers('seller'),
  });

  // Accept offer mutation
  const acceptMutation = useMutation({
    mutationFn: (offerId: string) =>
      api.respondToOffer(offerId, { action: 'ACCEPT' }),
    onSuccess: (updatedOffer) => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['lots'] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Offer accepted! Deal agreement generated.', {
        description: 'Stock has been reserved. Awaiting buyer simulated payment.',
      });
      if (updatedOffer.dealId) {
        navigate(`/seller/deals/${updatedOffer.dealId}`);
      }
    },
    onError: (err: Error) => {
      toast.error('Failed to accept offer', { description: err.message });
    },
  });

  // Reject offer mutation
  const rejectMutation = useMutation({
    mutationFn: (offerId: string) =>
      api.respondToOffer(offerId, { action: 'REJECT' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      toast.info('Offer declined.');
    },
    onError: (err: Error) => {
      toast.error('Failed to reject offer', { description: err.message });
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E3EAE5]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#176B4D] mb-1">
            <HandCoins className="w-4 h-4" />
            Supplier Commercial Desk
          </div>
          <h1 className="text-2xl font-extrabold text-[#17251F]">
            Incoming Buyer Offers
          </h1>
          <p className="text-sm text-[#64736B] mt-1">
            Review wholesale purchase proposals from verified retailers. Accept to lock deal agreements and reserve inventory, or counter with revised terms.
          </p>
        </div>

        <Link to="/seller/inventory">
          <Button variant="outline" size="sm">
            View My Surplus Inventory
          </Button>
        </Link>
      </div>

      {/* Offers List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : !offers || offers.length === 0 ? (
        <EmptyState
          icon={<HandCoins className="w-8 h-8 text-[#176B4D]" />}
          title="No Active Incoming Offers"
          description="Your active surplus lots currently have no pending buyer proposals. Make sure your inventory is active and prices are competitive."
          actionLabel="Check Inventory"
          onAction={() => navigate('/seller/inventory')}
        />
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
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
                    Received {formatDate(offer.createdAt)}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-base text-[#17251F]">
                  {offer.lotTitle}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#64736B]">
                  <span className="flex items-center gap-1 text-[#17251F] font-semibold">
                    <Store className="w-3.5 h-3.5 text-[#176B4D]" />
                    Buyer: {offer.buyerName}
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

                {offer.pickupPreference && (
                  <p className="text-xs text-[#64736B]">
                    Buyer Pickup Note: <em>"{offer.pickupPreference}"</em>
                  </p>
                )}

                {offer.status === 'COUNTERED' && (
                  <div className="p-3 bg-[#FEF8EC] rounded-xl text-xs text-[#B27318] border border-[#E8A84B]/30">
                    You countered this offer at <strong>{formatPKR(offer.sellerCounterUnitPriceMinor || 0)}/unit</strong>. Awaiting buyer confirmation.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#E3EAE5]">
                {offer.status === 'PENDING' && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => acceptMutation.mutate(offer.id)}
                      isLoading={acceptMutation.isPending}
                      className="font-bold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Accept ({formatPKR(offer.offerSubtotalMinor)})
                    </Button>

                    <Button
                      variant="accent"
                      size="sm"
                      onClick={() => setCounterModalOffer(offer)}
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 mr-1" />
                      Counter
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (window.confirm('Decline this wholesale offer?')) {
                          rejectMutation.mutate(offer.id);
                        }
                      }}
                      className="text-[#C44E4E] hover:bg-[#FDF2F2]"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Decline
                    </Button>
                  </>
                )}

                {offer.status === 'ACCEPTED' && offer.dealId && (
                  <Link to={`/seller/deals/${offer.dealId}`}>
                    <Button variant="secondary" size="sm" className="font-semibold">
                      View Agreed Deal
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                )}

                {offer.status === 'COUNTERED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCounterModalOffer(offer)}
                  >
                    Update Counter
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Counter Offer Modal */}
      {counterModalOffer && (
        <CounterOfferDialog
          offer={counterModalOffer}
          open={!!counterModalOffer}
          onOpenChange={(open) => !open && setCounterModalOffer(null)}
        />
      )}
    </div>
  );
}
