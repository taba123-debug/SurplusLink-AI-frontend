import { CheckCircle2, Clock, AlertCircle, XCircle, ArrowRightLeft, ShieldCheck, Lock } from 'lucide-react';
import { Badge } from './badge';
import type { DealStatus, LotStatus, OfferStatus } from '@/types';

interface StatusBadgeProps {
  status: LotStatus | OfferStatus | DealStatus | 'VERIFIED' | 'CONFIDENTIAL';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  switch (status) {
    // Lot Statuses
    case 'ACTIVE':
      return (
        <Badge variant="secondary" className={className}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#176B4D]" />
          Active
        </Badge>
      );
    case 'PENDING_OFFER':
      return (
        <Badge variant="accent" className={className}>
          <Clock className="w-3 h-3 text-[#B27318]" />
          Offer Under Review
        </Badge>
      );
    case 'PARTIALLY_SOLD':
      return (
        <Badge variant="secondary" className={className}>
          Partially Reserved
        </Badge>
      );
    case 'SOLD_OUT':
      return (
        <Badge variant="neutral" className={className}>
          Sold Out
        </Badge>
      );
    case 'PAUSED':
      return (
        <Badge variant="outline" className={className}>
          Paused
        </Badge>
      );
    case 'CLOSED':
      return (
        <Badge variant="outline" className={className}>
          Closed
        </Badge>
      );

    // Offer Statuses
    case 'PENDING':
      return (
        <Badge variant="accent" className={className}>
          <Clock className="w-3 h-3 text-[#B27318]" />
          Awaiting Response
        </Badge>
      );
    case 'COUNTERED':
      return (
        <Badge variant="accent" className={className}>
          <ArrowRightLeft className="w-3 h-3 text-[#B27318]" />
          Counter Offered
        </Badge>
      );
    case 'ACCEPTED':
      return (
        <Badge variant="secondary" className={className}>
          <CheckCircle2 className="w-3 h-3 text-[#176B4D]" />
          Accepted
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge variant="danger" className={className}>
          <XCircle className="w-3 h-3 text-[#C44E4E]" />
          Declined
        </Badge>
      );
    case 'WITHDRAWN':
      return (
        <Badge variant="outline" className={className}>
          Withdrawn
        </Badge>
      );
    case 'EXPIRED':
      return (
        <Badge variant="outline" className={className}>
          Expired
        </Badge>
      );

    // Deal Statuses
    case 'AWAITING_PAYMENT':
      return (
        <Badge variant="accent" className={className}>
          <AlertCircle className="w-3 h-3 text-[#B27318]" />
          Awaiting Simulated Payment
        </Badge>
      );
    case 'PAID_AWAITING_PICKUP':
      return (
        <Badge variant="secondary" className={className}>
          <CheckCircle2 className="w-3 h-3 text-[#176B4D]" />
          Ready for Pickup
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge variant="secondary" className={className}>
          <CheckCircle2 className="w-3 h-3 text-[#176B4D]" />
          Completed & Settled
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge variant="danger" className={className}>
          Cancelled
        </Badge>
      );

    // Specific Attributes
    case 'VERIFIED':
      return (
        <Badge variant="verified" className={className}>
          <ShieldCheck className="w-3 h-3 text-[#176B4D]" />
          Verified Supplier
        </Badge>
      );
    case 'CONFIDENTIAL':
      return (
        <Badge variant="outline" className={className}>
          <Lock className="w-3 h-3 text-[#64736B]" />
          Confidential
        </Badge>
      );

    default:
      return <Badge variant="outline" className={className}>{status}</Badge>;
  }
}
