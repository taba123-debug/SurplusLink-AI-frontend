import { useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { formatPKR } from '@/lib/money';
import { formatDate, getDaysRemaining, getShelfLifeUrgency } from '@/lib/dates';
import { StatusBadge } from '@/components/ui/statusBadge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FeeBreakdown } from '@/components/shared/FeeBreakdown';
import { OfferDialog } from '@/features/offers/components/OfferDialog';
import { LotCard } from '../components/LotCard';
import {
  MapPin,
  Calendar,
  Boxes,
  ShieldCheck,
  Lock,
  ArrowLeft,
  Truck,
  CheckCircle2,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';

export function LotDetailPage() {
  const { lotId } = useParams<{ lotId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [now] = useState(() => Date.now());
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);

  const { data: lot, isLoading, isError } = useQuery({
    queryKey: ['lot', lotId],
    queryFn: () => api.getLot(lotId!),
    enabled: !!lotId,
  });

  const { data: allLots } = useQuery({
    queryKey: ['lots'],
    queryFn: () => api.getLots(),
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="lg:col-span-2 aspect-16/10 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !lot) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-xl font-bold text-[#17251F]">Wholesale Lot Not Found</h2>
        <p className="mt-2 text-sm text-[#64736B]">The requested inventory lot does not exist or may have been closed.</p>
        <Button variant="primary" className="mt-6" onClick={() => navigate('/marketplace')}>
          Return to Marketplace
        </Button>
      </div>
    );
  }

  const daysLeft = getDaysRemaining(lot.expiryDate);
  const urgency = getShelfLifeUrgency(daysLeft);

  const estimatedSubtotalMinor =
    lot.askingUnitPriceMinor ? lot.askingUnitPriceMinor * lot.minPurchaseQuantity : 250000;


  // Related lots from same category
  const relatedLots = allLots
    ?.filter((l) => l.category === lot.category && l.id !== lot.id)
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb back */}
      <div className="flex items-center gap-2 text-xs text-[#64736B]">
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 hover:text-[#176B4D] transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Wholesale Opportunities
        </Link>
        <span>/</span>
        <span className="text-[#17251F] font-semibold truncate max-w-xs">{lot.title}</span>
      </div>

      {/* Main Grid: Left 2 cols Media & Specs, Right 1 col Offer Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Visual Image & Status */}
          <div className="relative aspect-16/10 rounded-2xl overflow-hidden border border-[#E3EAE5] bg-white shadow-xs">
            <img
              src={lot.images[0] || 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=1200&q=80'}
              alt={lot.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/95 text-[#17251F] shadow-sm backdrop-blur-xs">
                {lot.category}
              </span>
              {lot.sellerVerified && (
                <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-[#EAF5EF]/95 text-[#176B4D] shadow-sm backdrop-blur-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Industrial Producer
                </span>
              )}
            </div>
            <div className="absolute top-4 right-4">
              <StatusBadge status={lot.status} />
            </div>
          </div>

          {/* Title & Confidential Supplier Banner */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#64736B]">
              <span>Lot Reference: {lot.lotReference}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#176B4D]">
                <Clock className="w-3.5 h-3.5" />
                Listed {formatDate(lot.createdAt)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17251F] tracking-tight leading-snug">
              {lot.title}
            </h1>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#F8FAF8] border border-[#E3EAE5] text-xs text-[#64736B]">
              <Lock className="w-4 h-4 text-[#176B4D] shrink-0" />
              <span>
                <strong>Confidential Supplier:</strong> {lot.sellerDescriptor}. Direct factory name, dispatch contact, and specific warehouse bay are revealed upon deal agreement.
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-heading font-bold text-base text-[#17251F]">Batch Overview & Description</h3>
            <p className="text-sm text-[#17251F]/90 leading-relaxed whitespace-pre-line bg-white p-5 rounded-2xl border border-[#E3EAE5]">
              {lot.description}
            </p>
          </div>

          {/* Specifications Table */}
          <div className="rounded-2xl border border-[#E3EAE5] bg-white overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-[#E3EAE5] bg-[#F8FAF8]">
              <h3 className="font-heading font-bold text-sm text-[#17251F]">
                Technical & Logistics Specifications
              </h3>
            </div>
            <div className="divide-y divide-[#E3EAE5] text-xs sm:text-sm">
              <div className="grid grid-cols-2 sm:grid-cols-3 px-6 py-3.5">
                <span className="text-[#64736B] font-medium">Total Available Stock</span>
                <span className="sm:col-span-2 font-bold text-[#17251F]">
                  {lot.availableQuantity} {lot.unitType} (Total batch: {lot.totalQuantity})
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 px-6 py-3.5">
                <span className="text-[#64736B] font-medium">Minimum Purchase Lot</span>
                <span className="sm:col-span-2 font-semibold text-[#17251F]">
                  {lot.minPurchaseQuantity} {lot.unitType}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 px-6 py-3.5">
                <span className="text-[#64736B] font-medium">Packaging Specification</span>
                <span className="sm:col-span-2 text-[#17251F]">{lot.packagingType}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 px-6 py-3.5">
                <span className="text-[#64736B] font-medium">Expiry & Remaining Shelf-Life</span>
                <span className="sm:col-span-2 flex items-center gap-2">
                  <span className="font-bold text-[#17251F]">{formatDate(lot.expiryDate)}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      urgency === 'critical'
                        ? 'bg-[#FDF2F2] text-[#C44E4E]'
                        : urgency === 'moderate'
                        ? 'bg-[#FEF8EC] text-[#B27318]'
                        : 'bg-[#EAF5EF] text-[#176B4D]'
                    }`}
                  >
                    {daysLeft > 0 ? `${daysLeft} days remaining` : 'Expired'}
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 px-6 py-3.5">
                <span className="text-[#64736B] font-medium">Storage Instructions</span>
                <span className="sm:col-span-2 text-[#17251F]">{lot.storageRequirements}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 px-6 py-3.5">
                <span className="text-[#64736B] font-medium">General Region</span>
                <span className="sm:col-span-2 flex items-center gap-1.5 text-[#17251F]">
                  <MapPin className="w-3.5 h-3.5 text-[#176B4D]" />
                  {lot.pickupRegion}, {lot.city}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 px-6 py-3.5">
                <span className="text-[#64736B] font-medium">Seller Attestation</span>
                <span className="sm:col-span-2 flex items-center gap-1.5 text-[#176B4D] font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  Authorized commercial resale & food-grade compliance attested
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sticky Column: Commercial Offer & Negotiation Card */}
        <div className="lg:col-span-1 sticky top-24 space-y-6">
          <div className="rounded-2xl border border-[#E3EAE5] bg-white p-6 shadow-sm space-y-6">
            {/* Price Header */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#64736B]">
                Asking Wholesale Price
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                {lot.askingUnitPriceMinor ? (
                  <>
                    <span className="text-3xl font-extrabold text-[#17251F]">
                      {formatPKR(lot.askingUnitPriceMinor)}
                    </span>
                    <span className="text-xs text-[#64736B]">/{lot.unitType.replace(/s$/, '')}</span>
                  </>
                ) : (
                  <span className="text-xl font-bold text-[#B27318]">
                    Open for Buyer Offers
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-[#64736B]">
                Minimum order: {lot.minPurchaseQuantity} {lot.unitType}
              </p>
            </div>

            {/* Quick Estimation */}
            <div className="p-3.5 rounded-xl bg-[#F8FAF8] border border-[#E3EAE5] space-y-2 text-xs">
              <div className="flex justify-between text-[#64736B]">
                <span>Sample Order Size</span>
                <span className="font-medium text-[#17251F]">{lot.minPurchaseQuantity} {lot.unitType}</span>
              </div>
              <div className="flex justify-between text-[#64736B]">
                <span>Estimated Subtotal</span>
                <span className="font-medium text-[#17251F]">{formatPKR(estimatedSubtotalMinor)}</span>
              </div>
              <div className="flex justify-between text-[#64736B]">
                <span>Buyer Platform Fee (2%)</span>
                <span className="font-medium text-[#17251F]">Confirmed on backend deal</span>
              </div>
              <div className="pt-2 border-t border-[#E3EAE5] flex justify-between font-bold text-[#17251F]">
                <span>Est. Total Payable</span>
                <span className="text-[#176B4D]">Confirmed after acceptance</span>
              </div>
            </div>

            {/* CTA to open Offer Dialog */}
            <Button
              variant="primary"
              size="lg"
              className="w-full text-sm font-bold shadow-sm"
              onClick={() => setOfferDialogOpen(true)}
              disabled={(lot.status !== 'ACTIVE' && lot.status !== 'PARTIALLY_SOLD') || daysLeft <= 0 || lot.availableQuantity < lot.minPurchaseQuantity || Date.parse(lot.pickupDeadline) <= now}
            >
              {lot.status === 'ACTIVE' || lot.status === 'PARTIALLY_SOLD'
                ? 'Make Wholesale Offer'
                : 'Lot Unavailable'}
            </Button>

            {/* Collection Terms notice */}
            <div className="space-y-2 pt-2 text-xs text-[#64736B]">
              <div className="flex items-center gap-2 text-[#17251F] font-semibold">
                <Truck className="w-4 h-4 text-[#176B4D]" />
                Collection & Pickup Protocol
              </div>
              <p className="text-[11px] leading-relaxed">
                Collection deadline: {formatDate(lot.pickupDeadline)}. Buyers dispatch their own commercial vehicle or warehouse agent for pallet inspection and handover.
              </p>
            </div>
          </div>

          {/* AI Requirement match prompt */}
          <div className="p-5 rounded-2xl bg-[#EAF5EF]/80 border border-[#176B4D]/20 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-[#176B4D]">
              <Sparkles className="w-4 h-4 text-[#E8A84B]" />
              Looking for Multiple Lots?
            </div>
            <p className="text-[#64736B] leading-relaxed text-[11px]">
              Save your wholesale requirement and let SurplusLink match inventory automatically as manufacturers log new surplus batches.
            </p>
            <Link
              to="/buyer/ai-sourcing"
              className="inline-block font-semibold text-[#176B4D] hover:underline pt-1"
            >
              Start Natural Language Sourcing →
            </Link>
          </div>
        </div>
      </div>

      {/* Related Lots Section */}
      {relatedLots && relatedLots.length > 0 && (
        <div className="pt-10 border-t border-[#E3EAE5] space-y-6">
          <div>
            <h3 className="font-heading font-bold text-xl text-[#17251F]">
              Similar {lot.category} Opportunities
            </h3>
            <p className="text-xs text-[#64736B] mt-1">
              Alternative surplus batches matching this category available for wholesale purchase.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedLots.map((rLot) => (
              <LotCard key={rLot.id} lot={rLot} />
            ))}
          </div>
        </div>
      )}

      {/* Offer Submission Dialog */}
      <OfferDialog
        requirementId={searchParams.get('requirementId') || undefined}
        defaultQuantity={Number(searchParams.get('quantity')) || undefined}
        lot={lot}
        open={offerDialogOpen}
        onOpenChange={setOfferDialogOpen}
      />
    </div>
  );
}
