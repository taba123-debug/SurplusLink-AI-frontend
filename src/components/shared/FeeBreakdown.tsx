import { formatPKR } from '@/lib/money';
import type { Deal, UserRole } from '@/types';

interface Props {
  subtotalMinor: number;
  deal?: Deal;
  viewerRole?: UserRole;
  showCommissionNote?: boolean;
  className?: string;
}

export function FeeBreakdown({ subtotalMinor, deal, className = '' }: Props) {
  const rows: [string, number][] = deal ? [
    ['Agreed inventory subtotal', deal.subtotalMinor],
    ['Buyer fee', deal.buyerServiceFeeMinor],
    ['Seller fee', deal.sellerCommissionMinor],
    ['Buyer total', deal.buyerTotalMinor],
    ['Seller net', deal.sellerNetProceedsMinor],
  ] : [['Proposed inventory subtotal (estimate)', subtotalMinor]];
  return <div className={`rounded-xl border border-[#E3EAE5] bg-[#F8FAF8] p-4 space-y-3 ${className}`}>
    <h3 className="font-bold text-sm">{deal ? 'Backend financial breakdown' : 'Offer estimate'}</h3>
    {rows.map(([label,value]) => <div key={label} className="flex justify-between gap-4 text-sm"><span>{label}</span><strong>{formatPKR(value)}</strong></div>)}
    <p className="text-xs text-[#64736B]">{deal ? 'Demo / simulated transaction. No money moves.' : 'The backend confirms fees and the amount due after seller acceptance.'}</p>
  </div>;
}
