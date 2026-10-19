import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { formatPKR } from '@/lib/money';
import { formatDate, formatDateTime } from '@/lib/dates';
import { StatusBadge } from '@/components/ui/statusBadge';
import { FeeBreakdown } from '@/components/shared/FeeBreakdown';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/emptyState';
import { toast } from 'sonner';
import {
  FileCheck2,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Truck,
  CreditCard,
  Building2,
  Store,
  MapPin,
  Phone,
  ShieldCheck,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { useDemoStore } from '@/store/useDemoStore';

export function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { currentRole } = useDemoStore();

  const { data: deal, isLoading, isError } = useQuery({
    queryKey: ['deal', id],
    queryFn: () => api.getDeal(id!),
    enabled: !!id,
  });

  // Simulated Payment Mutation
  const paymentMutation = useMutation({
    mutationFn: (outcome: 'SUCCESS' | 'FAILURE') =>
      api.simulatePayment(deal!.id, outcome),
    onSuccess: (updatedDeal) => {
      queryClient.invalidateQueries();
      if (updatedDeal.paymentStatus === 'SIMULATED_PAID') {
        toast.success('Simulated payment confirmed!', {
          description: 'Authorized pickup information is available.',
        });
      } else {
        toast.error('Simulated payment was declined.');
      }
    },
    onError: (err: Error) => {
      toast.error('Payment simulation error', { description: err.message });
    },
  });

  // Confirm Handover/Pickup Mutation
  const pickupMutation = useMutation({
    mutationFn: () => api.confirmPickup(deal!.id),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('Inventory handover confirmed! Deal completed & settled.');
    },
    onError: (err: Error) => {
      toast.error('Handover confirmation failed', { description: err.message });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-40 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !deal) {
    return (
      <EmptyState
        title="Deal Not Found"
        description="The requested transaction agreement could not be located."
      />
    );
  }

  const isBuyer = currentRole === 'buyer';
  const isPaid = deal.paymentStatus === 'SIMULATED_PAID';
  const isCompleted = deal.status === 'COMPLETED';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div>
        <Link
          to={isBuyer ? '/buyer/deals' : '/seller/deals'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64736B] hover:text-[#176B4D] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to {isBuyer ? 'Purchased Deals' : 'Finalized Deals'}
        </Link>
      </div>

      {/* Deal Header Card */}
      <div className="rounded-2xl border border-[#E3EAE5] bg-white p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold bg-[#F8FAF8] text-[#17251F] px-2.5 py-0.5 rounded border border-[#E3EAE5]">
              {deal.dealReference}
            </span>
            <StatusBadge status={deal.status} />
            <span className="text-xs text-[#64736B]">
              Locked {formatDate(deal.createdAt)}
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-[#17251F]">
            {deal.lotTitle}
          </h1>
          <p className="text-xs text-[#64736B]" role="status">Payment: {deal.paymentStatus.replaceAll('_', ' ')} · Pickup: {deal.pickupStatus.replaceAll('_', ' ')}</p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[#64736B]">
            <span className="flex items-center gap-1 font-semibold text-[#17251F]">
              <Store className="w-3.5 h-3.5 text-[#176B4D]" />
              Buyer: {deal.buyerName}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-semibold text-[#17251F]">
              <Building2 className="w-3.5 h-3.5 text-[#176B4D]" />
              Seller: {deal.sellerName}
            </span>
            <span>•</span>
            <span>
              Agreed Volume: <strong>{deal.quantity} units</strong> @ {formatPKR(deal.unitPriceMinor)}/unit
            </span>
          </div>
        </div>

        {/* Demo Simulation Badge */}
        <div className="p-3 bg-[#EAF5EF] rounded-xl border border-[#176B4D]/20 text-xs text-[#176B4D] font-medium shrink-0">
          <div className="flex items-center gap-1 font-bold">
            <ShieldCheck className="w-4 h-4" />
            Simulated B2B Escrow Agreement
          </div>
          <p className="text-[11px] text-[#64736B] mt-0.5">
            Demonstration mode: zero real funds transferred
          </p>
        </div>
      </div>

      {/* Main Grid: Left Financials & Timeline, Right Private Pickup Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Simulated Checkout Box if Awaiting Payment */}
          {isBuyer && deal.status === 'AWAITING_PAYMENT' && (
            <div className="rounded-2xl border-2 border-[#E8A84B]/60 bg-[#FEF8EC]/40 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-[#B27318]">
                  <CreditCard className="w-5 h-5" />
                  <span>Simulated Escrow Payment Required</span>
                </div>
                <span className="text-xs bg-[#E8A84B]/20 text-[#B27318] px-2.5 py-0.5 rounded-full font-bold">
                  Demo Action
                </span>
              </div>

              <p className="text-xs text-[#17251F]/90 leading-relaxed">
                To test the confidential handover workflow, simulate a successful escrow deposit. This will lock the platform transaction and reveal pickup information authorized by the backend.
              </p>

              <div className="p-4 bg-white rounded-xl border border-[#E3EAE5] flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                <div>
                  <div className="text-xs text-[#64736B]">Total Demo Payable:</div>
                  <div className="text-2xl font-extrabold text-[#17251F]">
                    {formatPKR(deal.buyerTotalMinor)}
                  </div>
                  <div className="text-[11px] text-[#64736B]">
                    Includes Rs. {formatPKR(deal.subtotalMinor, { showSymbol: false })} subtotal + 2% buyer service fee ({formatPKR(deal.buyerServiceFeeMinor)})
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => paymentMutation.mutate('SUCCESS')}
                    isLoading={paymentMutation.isPending}
                    className="font-bold"
                  >
                    Simulate Successful Payment
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => paymentMutation.mutate('FAILURE')}
                    disabled={paymentMutation.isPending}
                    className="text-xs text-[#C44E4E]"
                  >
                    Simulate Failure
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Handover Collection CTA if Paid and Awaiting Pickup */}
          {!isBuyer && isPaid && !isCompleted && (
            <div className="rounded-2xl border border-[#176B4D]/30 bg-[#EAF5EF]/50 p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-[#176B4D]">
                  <Truck className="w-5 h-5" />
                  <span>Inventory Ready for Warehouse Pickup</span>
                </div>
                <span className="text-xs bg-[#176B4D] text-white px-2.5 py-0.5 rounded-full font-semibold">
                  Authorized
                </span>
              </div>

              <p className="text-xs text-[#17251F]/90 leading-relaxed">
                The buyer has dispatched transport to the facility. Once physical inspection and pallet loading are complete, confirm handover to conclude the deal and record commission.
              </p>

              <div className="pt-2">
                <Button
                  variant="primary"
                  onClick={() => pickupMutation.mutate()}
                  isLoading={pickupMutation.isPending}
                  className="font-bold"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Confirm Physical Handover & Finalize Deal
                </Button>
              </div>
            </div>
          )}

          {/* Financial Breakdown */}
          <FeeBreakdown
            subtotalMinor={deal.subtotalMinor}
            deal={deal}
            viewerRole={currentRole}
          />

          {/* Deal Progression Timeline */}
          <div className="rounded-2xl border border-[#E3EAE5] bg-white p-6 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-base text-[#17251F]">
              Deal Progression Timeline
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E3EAE5]">
              {deal.timeline.map((entry, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  <div
                    className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white ${
                      entry.completed
                        ? 'bg-[#176B4D]'
                        : 'bg-[#CBD5E1]'
                    }`}
                  >
                    {entry.completed ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#17251F]">
                        {entry.title}
                      </h4>
                      {entry.statusTag && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F8FAF8] text-[#176B4D] border border-[#E3EAE5]">
                          {entry.statusTag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#64736B]">{entry.description}</p>
                    <div className="text-[10px] text-[#64736B]">
                      {formatDateTime(entry.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Confidential Pickup Information */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-[#E3EAE5] bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3EAE5]">
              <div className="flex items-center gap-2 text-sm font-bold text-[#17251F]">
                {isPaid ? (
                  <Unlock className="w-4 h-4 text-[#176B4D]" />
                ) : (
                  <Lock className="w-4 h-4 text-[#64736B]" />
                )}
                <span>Private Pickup Authorization</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  isPaid ? 'bg-[#EAF5EF] text-[#176B4D]' : 'bg-neutral-100 text-[#64736B]'
                }`}
              >
                {isPaid ? 'UNLOCKED' : 'LOCKED'}
              </span>
            </div>

            {isPaid && deal.privatePickupDetails ? (
              <div className="space-y-4 text-xs">
                {/* Release Code, only if provided by backend */}
                {deal.privatePickupDetails.releaseCode && <div className="p-3.5 rounded-xl bg-[#EAF5EF] border border-[#176B4D]/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#176B4D] uppercase">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Warehouse Release Code</span>
                  </div>
                  <div className="text-xl font-mono font-extrabold text-[#17251F] tracking-wider">
                    {deal.privatePickupDetails.releaseCode}
                  </div>
                  <p className="text-[11px] text-[#64736B]">
                    Present this code at warehouse dock security for inventory release.
                  </p>
                </div>}

                {/* Warehouse Location */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[#64736B] uppercase">
                    Physical Warehouse Address
                  </span>
                  <div className="flex items-start gap-1.5 text-sm font-semibold text-[#17251F]">
                    <MapPin className="w-4 h-4 text-[#176B4D] shrink-0 mt-0.5" />
                    <span>{deal.privatePickupDetails.warehouseAddress}</span>
                  </div>
                </div>

                {/* Contact Person & Phone */}
                {deal.privatePickupDetails.contactPerson && <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[#64736B] uppercase">
                    Dispatch Coordinator
                  </span>
                  <div className="text-sm font-semibold text-[#17251F]">
                    {deal.privatePickupDetails.contactPerson}
                  </div>
                  <div className="flex items-center gap-1.5 text-[#176B4D] font-mono text-xs">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{deal.privatePickupDetails.phone}</span>
                  </div>
                </div>}

                {/* Operating Hours */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[#64736B] uppercase">
                    Dock Loading Hours
                  </span>
                  <div className="text-xs text-[#17251F]">
                    {deal.privatePickupDetails.pickupHours}
                  </div>
                </div>

                {deal.privatePickupDetails.locationNotes && (
                  <div className="p-2.5 bg-[#F8FAF8] rounded-lg border border-[#E3EAE5] text-[11px] text-[#64736B]">
                    <strong>Instructions:</strong> {deal.privatePickupDetails.locationNotes}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F8FAF8] text-[#64736B] flex items-center justify-center mx-auto border border-[#E3EAE5]">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#17251F]">
                  Confidential Logistics Secured
                </h4>
                <p className="text-xs text-[#64736B] leading-relaxed">
                  Pickup information is released by the backend after simulated payment.
                </p>
                <div className="text-[11px] text-[#176B4D] font-medium">
                  Complete simulated checkout above to unlock.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
