import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { LotCard } from '@/features/marketplace/components/LotCard';
import { formatPKR } from '@/lib/money';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Lock,
  Building2,
  Store,
  Boxes,
  HandCoins,
  CheckCircle2,
  Truck,
  TrendingDown,
  Percent,
} from 'lucide-react';

export function LandingPage() {
  const { data: lots } = useQuery({
    queryKey: ['featured-lots'],
    queryFn: () => api.getLots({ sortBy: 'newest' }),
  });

  const featuredLots = lots?.slice(0, 3) || [];

  return (
    <div className="space-y-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#EAF5EF]/80 to-transparent pointer-events-none -z-10 rounded-full blur-3xl opacity-70" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF5EF] border border-[#176B4D]/20 text-xs font-bold text-[#176B4D] uppercase tracking-wider shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#176B4D] animate-ping" />
            Pakistan's Premier B2B Bakery Surplus Marketplace
          </div>

          {/* Hero Title */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#17251F] tracking-tight leading-[1.12]">
              Turn Surplus Stock Into Your Next Wholesale Opportunity.
            </h1>
            <p className="text-lg sm:text-xl text-[#64736B] max-w-2xl mx-auto leading-relaxed font-normal">
              An AI-powered B2B marketplace connecting surplus bakery inventory with retailers ready to buy. Sealed biscuits, rusks, cakes, pastries and bread traded at negotiated wholesale prices.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/marketplace">
              <Button variant="primary" size="lg" className="w-full sm:w-auto font-bold shadow-md">
                Explore Wholesale Deals
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>

            <Link to="/seller/inventory/new">
              <Button variant="outline" size="lg" className="w-full sm:w-auto font-bold">
                List Surplus Inventory
              </Button>
            </Link>
          </div>

          {/* Hero Marketplace Interactive Preview */}
          <div className="pt-10 max-w-5xl mx-auto">
            <div className="rounded-3xl border border-[#E3EAE5] bg-white shadow-xl p-4 sm:p-6 text-left space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E3EAE5] gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono text-[#64736B] ml-2">
                    Illustrative marketplace preview — sample products
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#176B4D] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Commercial Producers
                  </span>
                  <span className="text-[#E3EAE5]">|</span>
                  <span className="text-[#64736B]">Confidential Supplier Reserve Matching</span>
                </div>
              </div>

              {/* Sample Mini Lots Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-[#E3EAE5] bg-[#F8FAF8] space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded bg-[#EAF5EF] text-[#176B4D] text-[10px] font-bold uppercase">
                      Biscuits
                    </span>
                    <span className="text-[11px] font-bold text-[#176B4D]">Rs. 115/carton</span>
                  </div>
                  <div className="font-bold text-xs text-[#17251F] line-clamp-1">
                    Sealed Export Tea Biscuit Cartons
                  </div>
                  <div className="text-[11px] text-[#64736B]">
                    200 available • Gulberg, Lahore
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#E3EAE5] bg-[#F8FAF8] space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded bg-[#FEF8EC] text-[#B27318] text-[10px] font-bold uppercase">
                      Rusks
                    </span>
                    <span className="text-[11px] font-bold text-[#176B4D]">Rs. 130/pack</span>
                  </div>
                  <div className="font-bold text-xs text-[#17251F] line-clamp-1">
                    Crispy Elaichi Nitrogen-Flushed Rusks
                  </div>
                  <div className="text-[11px] text-[#64736B]">
                    350 available • Township, Lahore
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#E3EAE5] bg-[#F8FAF8] space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded bg-[#EAF5EF] text-[#176B4D] text-[10px] font-bold uppercase">
                      Cookies
                    </span>
                    <span className="text-[11px] font-bold text-[#176B4D]">Rs. 95/pack</span>
                  </div>
                  <div className="font-bold text-xs text-[#17251F] line-clamp-1">
                    Chocolate Chip Crunch Cookies
                  </div>
                  <div className="text-[11px] text-[#64736B]">
                    500 available • Gulberg, Lahore
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DEMO METRICS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[#E3EAE5] bg-white p-8 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <div className="text-3xl font-extrabold text-[#176B4D]">{lots?.length ?? '—'}</div>
            <div className="text-xs font-semibold text-[#17251F]">Active Surplus Batches</div>
            <div className="text-[10px] text-[#64736B]">Seeded demo inventory lots</div>
          </div>

          <div className="space-y-1">
            <div className="text-3xl font-extrabold text-[#176B4D]">Demo only</div>
            <div className="text-xs font-semibold text-[#17251F]">Simulated Wholesale Volume</div>
            <div className="text-[10px] text-[#64736B]">No real funds transferred</div>
          </div>

          <div className="space-y-1">
            <div className="text-3xl font-extrabold text-[#176B4D]">2% + 2%</div>
            <div className="text-xs font-semibold text-[#17251F]">Transparent Platform Fee</div>
            <div className="text-[10px] text-[#64736B]">Charged on finalized settlement</div>
          </div>

          <div className="space-y-1">
            <div className="text-3xl font-extrabold text-[#176B4D]">100%</div>
            <div className="text-xs font-semibold text-[#17251F]">Confidential Supplier Shield</div>
            <div className="text-[10px] text-[#64736B]">Protected brand reserve prices</div>
          </div>
        </div>
      </section>

      {/* 3. TWO-WAY HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-[#17251F]">
            Built Specifically For B2B Wholesale Trading
          </h2>
          <p className="text-sm text-[#64736B]">
            SurplusLink connects manufacturers with commercial surplus directly to neighborhood retailers through a private, AI-orchestrated workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* For Sellers */}
          <div className="rounded-3xl border border-[#E3EAE5] bg-white p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FEF8EC] text-[#B27318] flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase text-[#B27318] tracking-wider">For Suppliers</span>
                <h3 className="text-xl font-bold text-[#17251F]">Bakeries & Food Producers</h3>
              </div>
            </div>

            <ol className="space-y-4 text-xs sm:text-sm text-[#17251F]/90">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#EAF5EF] text-[#176B4D] flex items-center justify-center font-bold shrink-0 mt-0.5">1</span>
                <div>
                  <strong>Describe available surplus in natural language.</strong> AI extracts quantities, packaging type, and remaining shelf life automatically.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#EAF5EF] text-[#176B4D] flex items-center justify-center font-bold shrink-0 mt-0.5">2</span>
                <div>
                  <strong>Set asking price and confidential reserve price.</strong> Protect your primary retail brand identity while clearing excess stock.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#EAF5EF] text-[#176B4D] flex items-center justify-center font-bold shrink-0 mt-0.5">3</span>
                <div>
                  <strong>Review incoming retailer offers.</strong> Accept or reject proposed prices and quantities.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#EAF5EF] text-[#176B4D] flex items-center justify-center font-bold shrink-0 mt-0.5">4</span>
                <div>
                  <strong>Authorize loading dock pickup.</strong> Warehouse location unlocks only after buyer simulated checkout deposit.
                </div>
              </li>
            </ol>

            <Link to="/seller/inventory/new" className="inline-block pt-2">
              <Button variant="secondary" size="md" className="font-bold">
                Start Listing Surplus Stock
              </Button>
            </Link>
          </div>

          {/* For Buyers */}
          <div className="rounded-3xl border border-[#E3EAE5] bg-white p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EAF5EF] text-[#176B4D] flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase text-[#176B4D] tracking-wider">For Retailers</span>
                <h3 className="text-xl font-bold text-[#17251F]">Grocery Stores & Wholesalers</h3>
              </div>
            </div>

            <ol className="space-y-4 text-xs sm:text-sm text-[#17251F]/90">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#EAF5EF] text-[#176B4D] flex items-center justify-center font-bold shrink-0 mt-0.5">1</span>
                <div>
                  <strong>Describe inventory needs in natural language.</strong> E.g., "150 biscuit packs in Lahore with 30+ days shelf life under Rs. 20,000."
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#EAF5EF] text-[#176B4D] flex items-center justify-center font-bold shrink-0 mt-0.5">2</span>
                <div>
                  <strong>Inspect compatible lots and shelf-life metrics.</strong> Compare verified batches across Lahore and regional industrial areas.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#EAF5EF] text-[#176B4D] flex items-center justify-center font-bold shrink-0 mt-0.5">3</span>
                <div>
                  <strong>Submit wholesale proposals.</strong> Negotiate unit prices with automatic transparent 2% service fee calculation.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#EAF5EF] text-[#176B4D] flex items-center justify-center font-bold shrink-0 mt-0.5">4</span>
                <div>
                  <strong>Simulated checkout & dispatch release.</strong> View backend-authorized pickup information after simulated payment.
                </div>
              </li>
            </ol>

            <Link to="/buyer/ai-sourcing" className="inline-block pt-2">
              <Button variant="primary" size="md" className="font-bold">
                Launch AI Procurement Sourcing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. FEATURED SURPLUS BATCHES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-[#17251F]">
              Featured Surplus Wholesale Batches
            </h2>
            <p className="text-sm text-[#64736B] mt-1">
              Live sample inventory lots available for immediate wholesale offer negotiation.
            </p>
          </div>
          <Link to="/marketplace">
            <Button variant="outline" size="sm" className="font-semibold">
              View All Wholesale Lots
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredLots.map((lot) => (
            <LotCard key={lot.id} lot={lot} />
          ))}
        </div>
      </section>

      {/* 5. PRIVACY, CONFIDENTIALITY & REVENUE MODEL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[#E3EAE5] bg-white p-8 sm:p-12 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF5EF] text-[#176B4D] flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#17251F]">Confidential Supplier Shield</h3>
            <p className="text-xs text-[#64736B] leading-relaxed">
              Tier-1 food producers require strict confidentiality to protect brand pricing integrity. Supplier identities and exact reserve limits remain confidential until an offer is accepted.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FEF8EC] text-[#B27318] flex items-center justify-center font-bold">
              <Percent className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#17251F]">Transparent 2% Economics</h3>
            <p className="text-xs text-[#64736B] leading-relaxed">
              Platform revenue is derived from a transparent 2% buyer service fee and a 2% seller success commission calculated directly from the agreed deal subtotal. Zero hidden costs.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF5EF] text-[#176B4D] flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#17251F]">Verified Warehouse Handover</h3>
            <p className="text-xs text-[#64736B] leading-relaxed">
              Pickup information returned by the backend unlocks after successful simulated payment.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
