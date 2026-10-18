import { formatPKR, calculateDealFinancials } from '@/lib/money';
import { Info } from 'lucide-react';
import type { UserRole } from '@/types';

interface FeeBreakdownProps {
  subtotalMinor: number;
  viewerRole?: UserRole;
  showCommissionNote?: boolean;
  className?: string;
}

export function FeeBreakdown({
  subtotalMinor,
  viewerRole = 'buyer',
  showCommissionNote = true,
  className = '',
}: FeeBreakdownProps) {
  const f = calculateDealFinancials(subtotalMinor);

  return (
    <div className={`rounded-xl border border-[#E3EAE5] bg-[#F8FAF8] p-4 text-sm ${className}`}>
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E3EAE5]">
        <span className="font-semibold text-[#17251F]">Financial Breakdown</span>
        <span className="text-xs px-2 py-0.5 rounded-md bg-[#EAF5EF] text-[#176B4D] font-medium">
          2% Transparent Platform Model
        </span>
      </div>

      <div className="space-y-2 text-xs sm:text-sm">
        <div className="flex justify-between text-[#64736B]">
          <span>Agreed Inventory Subtotal</span>
          <span className="font-medium text-[#17251F]">{formatPKR(f.subtotalMinor)}</span>
        </div>

        {/* Buyer View Specifics */}
        {(viewerRole === 'buyer' || viewerRole === 'admin') && (
          <div className="flex justify-between text-[#64736B]">
            <span className="flex items-center gap-1">
              Buyer Platform Service Fee (2%)
            </span>
            <span className="font-medium text-[#17251F]">{formatPKR(f.buyerServiceFeeMinor)}</span>
          </div>
        )}

        {/* Seller View Specifics */}
        {(viewerRole === 'seller' || viewerRole === 'admin') && (
          <div className="flex justify-between text-[#64736B]">
            <span className="flex items-center gap-1">
              Seller Success Commission (2%)
            </span>
            <span className="font-medium text-[#C44E4E]">-{formatPKR(f.sellerCommissionMinor)}</span>
          </div>
        )}

        <div className="pt-2 border-t border-[#E3EAE5] flex justify-between font-bold text-[#17251F]">
          {viewerRole === 'buyer' && (
            <>
              <span>Total Simulated Checkout</span>
              <span className="text-[#176B4D] text-base">{formatPKR(f.buyerTotalMinor)}</span>
            </>
          )}
          {viewerRole === 'seller' && (
            <>
              <span>Estimated Net Proceeds</span>
              <span className="text-[#176B4D] text-base">{formatPKR(f.sellerNetProceedsMinor)}</span>
            </>
          )}
          {viewerRole === 'admin' && (
            <>
              <span>Platform Gross Fee (2% + 2%)</span>
              <span className="text-[#176B4D] text-base">{formatPKR(f.platformGrossRevenueMinor)}</span>
            </>
          )}
        </div>
      </div>

      {showCommissionNote && (
        <div className="mt-3 pt-2.5 border-t border-[#E3EAE5]/60 flex items-start gap-1.5 text-xs text-[#64736B]">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#176B4D]" />
          <span>
            Demonstration mode: Fees and settlement progression are simulated with zero actual funds transferred.
          </span>
        </div>
      )}
    </div>
  );
}
