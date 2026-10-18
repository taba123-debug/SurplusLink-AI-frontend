import { Link } from 'react-router-dom';
import { formatPKR } from '@/lib/money';
import { getDaysRemaining, getShelfLifeUrgency } from '@/lib/dates';
import { StatusBadge } from '@/components/ui/statusBadge';
import { MapPin, Calendar, Boxes, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import type { Lot } from '@/types';

interface LotCardProps {
  lot: Lot;
  matchScore?: number;
  matchReasons?: string[];
  budgetCompatibility?: 'UNDER_BUDGET' | 'WITHIN_BUDGET' | 'OVER_BUDGET';
}

export function LotCard({ lot, matchScore, matchReasons, budgetCompatibility }: LotCardProps) {
  const daysLeft = getDaysRemaining(lot.expiryDate);
  const urgency = getShelfLifeUrgency(daysLeft);

  const urgencyBadge = {
    critical: 'bg-[#FDF2F2] text-[#C44E4E] border border-[#C44E4E]/30',
    moderate: 'bg-[#FEF8EC] text-[#B27318] border border-[#E8A84B]/40',
    healthy: 'bg-[#EAF5EF] text-[#176B4D] border border-[#176B4D]/30',
  }[urgency];

  return (
    <div className="group rounded-2xl border border-[#E3EAE5] bg-white hover:border-[#176B4D]/40 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden relative">
      {/* Compatibility Banner if in matching view */}
      {matchScore !== undefined && (
        <div className="bg-[#176B4D] text-white px-3.5 py-1.5 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E8A84B]" />
            <span>AI Match Compatibility: {matchScore}%</span>
          </div>
          {budgetCompatibility && (
            <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-white/20">
              {budgetCompatibility === 'UNDER_BUDGET'
                ? 'Under Budget'
                : budgetCompatibility === 'WITHIN_BUDGET'
                ? 'Within Budget'
                : 'Over Budget'}
            </span>
          )}
        </div>
      )}

      {/* Image Container with Badges */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-[#F8FAF8]">
        <img
          src={lot.images[0] || 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80'}
          alt={lot.title}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          loading="lazy"
        />
        {/* Category tag */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide bg-white/95 text-[#17251F] shadow-xs backdrop-blur-xs">
            {lot.category}
          </span>
          {lot.sellerVerified && (
            <span className="px-2 py-1 rounded-lg text-xs font-medium bg-[#EAF5EF]/95 text-[#176B4D] shadow-xs backdrop-blur-xs flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>

        {/* Status */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={lot.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="font-heading font-bold text-base text-[#17251F] line-clamp-2 mb-1.5 group-hover:text-[#176B4D] transition-colors">
          {lot.title}
        </h3>

        {/* Confidential Supplier Descriptor */}
        <p className="text-xs text-[#64736B] line-clamp-1 mb-3">
          {lot.sellerDescriptor}
        </p>

        {/* Location & Shelf Life */}
        <div className="grid grid-cols-2 gap-2 text-xs text-[#64736B] py-2.5 my-auto border-y border-[#E3EAE5]/70">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#176B4D] shrink-0" />
            <span className="truncate">{lot.pickupRegion}</span>
          </div>

          <div className="flex items-center gap-1.5 justify-end">
            <Calendar className="w-3.5 h-3.5 text-[#64736B] shrink-0" />
            <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${urgencyBadge}`}>
              {daysLeft > 0 ? `${daysLeft}d shelf-life` : 'Expired'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Boxes className="w-3.5 h-3.5 text-[#64736B] shrink-0" />
            <span>
              Available: <strong>{lot.availableQuantity}</strong> {lot.unitType}
            </span>
          </div>

          <div className="text-right text-[11px] text-[#64736B]">
            Min order: {lot.minPurchaseQuantity} {lot.unitType}
          </div>
        </div>

        {/* Match reason if present */}
        {matchReasons && matchReasons.length > 0 && (
          <div className="my-2.5 p-2 bg-[#EAF5EF]/50 rounded-lg text-[11px] text-[#176B4D]">
            ✓ {matchReasons[0]}
          </div>
        )}

        {/* Price & CTA Footer */}
        <div className="mt-4 pt-2 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-semibold text-[#64736B]">
              Wholesale Unit Price
            </div>
            {lot.askingUnitPriceMinor !== null ? (
              <div className="font-heading font-extrabold text-lg text-[#17251F]">
                {formatPKR(lot.askingUnitPriceMinor)}
                <span className="text-xs font-normal text-[#64736B]"> /{lot.unitType.replace(/s$/, '')}</span>
              </div>
            ) : (
              <div className="text-sm font-bold text-[#B27318]">
                Submit an Offer
              </div>
            )}
          </div>

          <Link
            to={`/marketplace/${lot.id}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#176B4D] bg-[#EAF5EF] hover:bg-[#176B4D] hover:text-white px-3.5 py-2 rounded-xl transition-all"
          >
            <span>View Lot</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
