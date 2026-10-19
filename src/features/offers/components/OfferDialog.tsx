import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { toMinorUnits, fromMinorUnits, formatPKR } from '@/lib/money';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FeeBreakdown } from '@/components/shared/FeeBreakdown';
import { toast } from 'sonner';
import { HandCoins, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';
import type { Lot } from '@/types';
import { useDemoStore } from '@/store/useDemoStore';
import { useNavigate } from 'react-router-dom';

interface OfferDialogProps {
  requirementId?: string;
  lot: Lot;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultQuantity?: number;
}

export function OfferDialog({
  lot,
  open,
  onOpenChange,
  defaultQuantity,
  requirementId,
}: OfferDialogProps) {
  const { currentRole, currentOrg } = useDemoStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const initialQty = Math.max(
    lot.minPurchaseQuantity || 25,
    Math.min(defaultQuantity || lot.minPurchaseQuantity || 50, lot.availableQuantity)
  );
  const initialPricePkr = lot.askingUnitPriceMinor ? fromMinorUnits(lot.askingUnitPriceMinor) : 100;

  const [quantity, setQuantity] = useState<number>(initialQty);
  const [unitPricePkr, setUnitPricePkr] = useState<number>(initialPricePkr);
  const [pickupPreference, setPickupPreference] = useState('Buyer truck dispatch for warehouse dock collection');
  const [expiresInDays, setExpiresInDays] = useState(3);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Derived financials
  const subtotalMinor = toMinorUnits((quantity || 0) * (unitPricePkr || 0));


  const mutation = useMutation({
    mutationFn: () =>
      api.createOffer({
        lotId: lot.id,
        requirementId,
        requestedQuantity: quantity,
        offeredUnitPriceMinor: toMinorUnits(unitPricePkr),
        pickupPreference,
        expiresInDays,
      }),
    onSuccess: (newOffer) => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries();
      queryClient.invalidateQueries({ queryKey: ['lot', lot.id] });
      toast.success('Wholesale offer submitted successfully!', {
        description: `Reference: ${newOffer.offerReference}. Awaiting supplier review.`,
      });
      onOpenChange(false);
      navigate('/buyer/offers');
    },
    onError: (err: Error) => {
      toast.error('Failed to submit offer', {
        description: err.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (currentRole !== 'buyer' || lot.sellerId === currentOrg.id) { setErrorMsg('Select a buyer identity before submitting an offer.'); return; }
    if (Date.parse(lot.expiryDate) <= Date.now() || Date.parse(lot.pickupDeadline) <= Date.now()) { setErrorMsg('This inventory has expired or its pickup deadline has passed.'); return; }
    if (quantity <= 0) {
      setErrorMsg('Quantity must be greater than zero.');
      return;
    }
    if (quantity > lot.availableQuantity) {
      setErrorMsg(`Quantity cannot exceed available stock (${lot.availableQuantity} ${lot.unitType}).`);
      return;
    }
    if (quantity < lot.minPurchaseQuantity) {
      setErrorMsg(`Minimum order quantity for this lot is ${lot.minPurchaseQuantity} ${lot.unitType}.`);
      return;
    }
    if (unitPricePkr <= 0) {
      setErrorMsg('Proposed unit price must be greater than zero.');
      return;
    }

    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-[#176B4D] mb-1">
            <HandCoins className="w-5 h-5" />
            <span className="text-xs uppercase tracking-wider font-bold">Wholesale Offer Submission</span>
          </div>
          <DialogTitle>Make an Offer on Lot #{lot.lotReference}</DialogTitle>
          <DialogDescription>
            {lot.title} • {lot.category} ({lot.sellerDescriptor})
          </DialogDescription>
        </DialogHeader>

        {currentRole !== 'buyer' && (
          <div className="p-3 mb-4 rounded-xl bg-[#FEF8EC] border border-[#E8A84B]/30 flex items-start gap-2 text-xs text-[#B27318]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Role Notice:</strong> You are currently acting as <em>{currentOrg.name} ({currentRole})</em>. For the cleanest buyer demo flow, switch to a buyer business using the top right switcher.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quantity & Unit Price inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-1.5" htmlFor="field-OfferDialog-1">
                Quantity Requested ({lot.unitType})
              </label>
              <Input id="field-OfferDialog-1"
                type="number"
                min={lot.minPurchaseQuantity}
                max={lot.availableQuantity}
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
                required
              />
              <p className="mt-1 text-[11px] text-[#64736B]">
                Avail: <strong>{lot.availableQuantity}</strong> • Min: <strong>{lot.minPurchaseQuantity}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-1.5" htmlFor="field-OfferDialog-2">
                Proposed Unit Price (PKR)
              </label>
              <Input id="field-OfferDialog-2"
                type="number"
                min="1"
                step="1"
                value={unitPricePkr}
                onChange={(e) => setUnitPricePkr(parseFloat(e.target.value) || 0)}
                required
              />
              <p className="mt-1 text-[11px] text-[#64736B]">
                {lot.askingUnitPriceMinor ? (
                  <span>Asking: {formatPKR(lot.askingUnitPriceMinor)}</span>
                ) : (
                  <span>Seller requests negotiation</span>
                )}
              </p>
            </div>
          </div>

          {/* Backend supports expiry, but not pickup preferences. */}
          <div hidden={import.meta.env.VITE_DATA_PROVIDER !== 'mock'} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-1.5" htmlFor="field-OfferDialog-3">
                Offer Expiration
              </label>
              <select id="field-OfferDialog-3"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(parseInt(e.target.value, 10))}
                className="w-full h-10 rounded-xl border border-[#E3EAE5] bg-white px-3 text-xs text-[#17251F] focus:outline-none focus:ring-2 focus:ring-[#176B4D]"
              >
                <option value="2">Expires in 48 Hours</option>
                <option value="3">Expires in 3 Days (Recommended)</option>
                <option value="5">Expires in 5 Days</option>
                <option value="7">Expires in 7 Days</option>
              </select>
            </div>

            <div hidden={import.meta.env.VITE_DATA_PROVIDER !== 'mock'}>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-1.5" htmlFor="field-OfferDialog-4">
                Pickup Method
              </label>
              <Input id="field-OfferDialog-4"
                value={pickupPreference}
                onChange={(e) => setPickupPreference(e.target.value)}
                placeholder="Self-pickup / Delivery preference"
              />
            </div>
          </div>

          {/* Financial Breakdown Preview */}
          {import.meta.env.VITE_DATA_PROVIDER !== 'mock' && <p className="text-xs text-[#64736B]">The backend sets offer expiry to within 24 hours or the pickup deadline, whichever comes first.</p>}
          <FeeBreakdown subtotalMinor={subtotalMinor} viewerRole="buyer" />

          {errorMsg && (
            <div className="p-3 bg-[#FDF2F2] border border-[#C44E4E]/30 rounded-xl text-xs text-[#C44E4E] font-medium">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-[#64736B] pt-1">
            <ShieldCheck className="w-4 h-4 text-[#176B4D] shrink-0" />
            <span>
              Direct seller contact and precise warehouse loading bay will unlock immediately after seller acceptance and simulated payment.
            </span>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={currentRole !== 'buyer'}
              isLoading={mutation.isPending}
            >
              Submit Wholesale Offer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
