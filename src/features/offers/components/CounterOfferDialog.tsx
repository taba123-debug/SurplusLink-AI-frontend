import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { toMinorUnits, fromMinorUnits, formatPKR, calculateDealFinancials } from '@/lib/money';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FeeBreakdown } from '@/components/shared/FeeBreakdown';
import { toast } from 'sonner';
import { ArrowRightLeft } from 'lucide-react';
import type { Offer } from '@/types';

interface CounterOfferDialogProps {
  offer: Offer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CounterOfferDialog({
  offer,
  open,
  onOpenChange,
}: CounterOfferDialogProps) {
  const queryClient = useQueryClient();

  const [counterPricePkr, setCounterPricePkr] = useState<number>(
    Math.round(fromMinorUnits(offer.offeredUnitPriceMinor) * 1.1)
  );
  const [counterQuantity, setCounterQuantity] = useState<number>(offer.requestedQuantity);
  const [counterNote, setCounterNote] = useState(
    'We can fulfill this batch at this revised price point to account for our packaging materials.'
  );

  const subtotalMinor = toMinorUnits((counterQuantity || 0) * (counterPricePkr || 0));
  const financials = calculateDealFinancials(subtotalMinor);

  const counterMutation = useMutation({
    mutationFn: () =>
      api.respondToOffer(offer.id, {
        action: 'COUNTER',
        counterUnitPriceMinor: toMinorUnits(counterPricePkr),
        counterQuantity,
        counterNote,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      toast.success('Counter-offer transmitted to buyer!', {
        description: `Proposed Rs. ${counterPricePkr}/unit for ${counterQuantity} units.`,
      });
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast.error('Failed to submit counter-offer', { description: err.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (counterPricePkr <= 0) {
      toast.error('Counter price must be positive');
      return;
    }
    counterMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-[#B27318] mb-1">
            <ArrowRightLeft className="w-5 h-5" />
            <span className="text-xs uppercase tracking-wider font-bold">Seller Counter-Proposal</span>
          </div>
          <DialogTitle>Counter Offer #{offer.offerReference}</DialogTitle>
          <DialogDescription>
            Propose revised commercial terms to <strong>{offer.buyerName}</strong> for {offer.lotTitle}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-[#F8FAF8] rounded-xl border border-[#E3EAE5] text-xs space-y-1">
            <div className="text-[#64736B]">Buyer's Original Proposal:</div>
            <div className="font-semibold text-[#17251F]">
              {offer.requestedQuantity} units @ {formatPKR(offer.offeredUnitPriceMinor)}/unit = {formatPKR(offer.offerSubtotalMinor)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-1.5">
                Counter Unit Price (PKR)
              </label>
              <Input
                type="number"
                min="1"
                value={counterPricePkr}
                onChange={(e) => setCounterPricePkr(parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-1.5">
                Adjusted Quantity
              </label>
              <Input
                type="number"
                min="1"
                value={counterQuantity}
                onChange={(e) => setCounterQuantity(parseInt(e.target.value, 10) || 0)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-1.5">
              Note to Buyer (Terms explanation)
            </label>
            <Textarea
              rows={2}
              value={counterNote}
              onChange={(e) => setCounterNote(e.target.value)}
              placeholder="Explain rationale for counter pricing..."
            />
          </div>

          <FeeBreakdown subtotalMinor={subtotalMinor} viewerRole="seller" />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              isLoading={counterMutation.isPending}
            >
              Send Counter Offer ({formatPKR(financials.subtotalMinor)})
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
