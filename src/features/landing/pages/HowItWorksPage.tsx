import { useState } from 'react';
import { formatPKR, toMinorUnits } from '@/lib/money';
import { FeeBreakdown } from '@/components/shared/FeeBreakdown';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Building2,
  Store,
  ShieldCheck,
  Lock,
  Unlock,
  Truck,
  CheckCircle2,
  ArrowRight,
  Calculator,
} from 'lucide-react';

export function HowItWorksPage() {
  const [sampleSubtotalPkr, setSampleSubtotalPkr] = useState<number>(12500);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#176B4D] bg-[#EAF5EF] px-3.5 py-1 rounded-full">
          Marketplace Architecture & Economics
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17251F] tracking-tight">
          How SurplusLink AI Powers Confidential Wholesale Trading
        </h1>
        <p className="text-sm sm:text-base text-[#64736B] leading-relaxed">
          SurplusLink AI solves the friction of surplus inventory in Pakistan's packaged food sector. We connect industrial bakeries with retail buyers while protecting supplier brand pricing through private AI matching.
        </p>
      </div>

      {/* Two-Way Flow Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Seller Journey */}
        <div className="rounded-3xl border border-[#E3EAE5] bg-white p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FEF8EC] text-[#B27318] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#B27318] uppercase">The Supplier Journey</span>
              <h3 className="text-lg font-bold text-[#17251F]">Industrial Bakery Overruns</h3>
            </div>
          </div>

          <div className="space-y-4 text-xs text-[#17251F]/90">
            <div className="p-3.5 rounded-xl bg-[#F8FAF8] border border-[#E3EAE5] space-y-1">
              <strong className="text-[#17251F] block">1. Natural Language or Manual Listing</strong>
              <p className="text-[#64736B]">
                Supplier pastes unformatted stock text (e.g. "200 sealed biscuit packs in Gulberg, min Rs. 110, expires in 45 days"). AI extracts fields into the structured catalog entry.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAF8] border border-[#E3EAE5] space-y-1">
              <strong className="text-[#17251F] block">2. Confidential Reserve Price & Anonymization</strong>
              <p className="text-[#64736B]">
                Seller sets an optional public asking price and a <em>confidential minimum price</em>. The supplier's brand is displayed via a generic descriptor (e.g. "Verified Tier-1 Bakery Producer") to prevent channel conflict.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAF8] border border-[#E3EAE5] space-y-1">
              <strong className="text-[#17251F] block">3. Direct Commercial Negotiation</strong>
              <p className="text-[#64736B]">
                Review incoming buyer proposals. Accept to lock deal agreements and automatically reserve inventory, or counter with adjusted unit prices.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAF8] border border-[#E3EAE5] space-y-1">
              <strong className="text-[#17251F] block">4. Loading Bay Release Pass</strong>
              <p className="text-[#64736B]">
                Once the buyer simulates escrow checkout, authorized warehouse dock coordinates and security release codes unlock for physical collection.
              </p>
            </div>
          </div>

          <Link to="/seller/inventory/new" className="block pt-2">
            <Button variant="secondary" className="w-full font-bold">
              List Surplus Stock
            </Button>
          </Link>
        </div>

        {/* Buyer Journey */}
        <div className="rounded-3xl border border-[#E3EAE5] bg-white p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF5EF] text-[#176B4D] flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#176B4D] uppercase">The Retailer Journey</span>
              <h3 className="text-lg font-bold text-[#17251F]">Wholesale Procurement</h3>
            </div>
          </div>

          <div className="space-y-4 text-xs text-[#17251F]/90">
            <div className="p-3.5 rounded-xl bg-[#F8FAF8] border border-[#E3EAE5] space-y-1">
              <strong className="text-[#17251F] block">1. Conversational AI Sourcing</strong>
              <p className="text-[#64736B]">
                Describe your business requirements (e.g. "I need 150 biscuit packs in Lahore with 30+ days shelf life under Rs. 20,000"). AI parses category, quantity, budget, and shelf-life constraints.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAF8] border border-[#E3EAE5] space-y-1">
              <strong className="text-[#17251F] block">2. Multi-Factor Compatibility Ranking</strong>
              <p className="text-[#64736B]">
                SurplusLink compares your requirement against available warehouse batches, ranking lots by quantity fulfillment, budget compliance, and shelf-life remaining.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAF8] border border-[#E3EAE5] space-y-1">
              <strong className="text-[#17251F] block">3. Proposal Submission & Transparent Fees</strong>
              <p className="text-[#64736B]">
                Submit your proposed unit price. The 2% buyer service fee is calculated transparently before offer submission with exact integer minor precision.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAF8] border border-[#E3EAE5] space-y-1">
              <strong className="text-[#17251F] block">4. Simulated Checkout & Warehouse Pass</strong>
              <p className="text-[#64736B]">
                Upon seller acceptance, confirm simulated payment to unlock direct warehouse dispatch contact, specific loading gate, and release OTP.
              </p>
            </div>
          </div>

          <Link to="/buyer/ai-sourcing" className="block pt-2">
            <Button variant="primary" className="w-full font-bold">
              Launch AI Sourcing
            </Button>
          </Link>
        </div>
      </div>

      {/* Interactive Economics Calculator */}
      <div className="rounded-3xl border border-[#E3EAE5] bg-white p-8 sm:p-10 shadow-xs space-y-6">
        <div className="max-w-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#176B4D]">
            <Calculator className="w-4 h-4" />
            <span>Platform Financial Economics</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#17251F]">
            Transparent 2% + 2% Revenue Model
          </h2>
          <p className="text-xs text-[#64736B] leading-relaxed">
            Platform fees apply strictly to completed transactions. Test any deal amount below to see exact derived values based on integer minor units (paisa).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center pt-2">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#17251F] mb-1.5">
                Sample Agreed Deal Subtotal (PKR)
              </label>
              <Input
                type="number"
                min="1000"
                step="500"
                value={sampleSubtotalPkr}
                onChange={(e) => setSampleSubtotalPkr(parseFloat(e.target.value) || 0)}
              />
              <p className="mt-1 text-[11px] text-[#64736B]">
                Try: Rs. 12,500 (matches standard sample batch)
              </p>
            </div>

            <div className="space-y-2 text-xs text-[#64736B]">
              <div className="flex items-center gap-2 text-[#17251F] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#176B4D]" />
                Zero Listing Fees
              </div>
              <p className="text-[11px] pl-6">
                Suppliers list unlimited surplus lots without upfront subscription or listing charges.
              </p>

              <div className="flex items-center gap-2 text-[#17251F] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#176B4D]" />
                Escrow Simulated Security
              </div>
              <p className="text-[11px] pl-6">
                Buyers confirm simulated funds before private seller pickup coordinates are disclosed.
              </p>
            </div>
          </div>

          <div>
            <FeeBreakdown
              subtotalMinor={toMinorUnits(sampleSubtotalPkr || 0)}
              viewerRole="admin"
              showCommissionNote={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
