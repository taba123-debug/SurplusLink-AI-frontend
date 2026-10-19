import { Outlet } from 'react-router-dom';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Sparkles, Shield, HeartHandshake, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8] text-[#17251F]">
      <TopNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#E3EAE5] bg-white text-[#64736B] text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#176B4D] flex items-center justify-center text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M16 3h5v5" />
                  <path d="M8 21H3v-5" />
                  <path d="M21 3l-7.5 7.5" />
                  <path d="M3 21l7.5-7.5" />
                </svg>
              </div>
              <span className="font-heading font-extrabold text-base text-[#17251F]">SurplusLink AI</span>
            </div>
            <p className="text-xs text-[#64736B] leading-relaxed">
              Confidential, AI-assisted B2B wholesale marketplace connecting verified bakery producers with regional retailers across Pakistan.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[#176B4D] font-medium">
              <MapPin className="w-3.5 h-3.5" />
              <span>Headquartered in Lahore, Pakistan</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#17251F] mb-3">
              Marketplace
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/marketplace" className="hover:text-[#176B4D] transition-colors">
                  All Wholesale Lots
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=BISCUITS" className="hover:text-[#176B4D] transition-colors">
                  Surplus Biscuits
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=RUSKS" className="hover:text-[#176B4D] transition-colors">
                  Crispy Rusks & Toast
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=CAKES" className="hover:text-[#176B4D] transition-colors">
                  Packaged Cakes
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=PASTRIES" className="hover:text-[#176B4D] transition-colors">
                  Sealed Pastries
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#17251F] mb-3">
              AI Tools & Workspaces
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/buyer/ai-sourcing" className="hover:text-[#176B4D] transition-colors flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#E8A84B]" />
                  Natural Language Sourcing
                </Link>
              </li>
              <li>
                <Link to="/seller/inventory/new" className="hover:text-[#176B4D] transition-colors">
                  AI-Assisted Listing Entry
                </Link>
              </li>
              <li>
                <Link to="/buyer/dashboard" className="hover:text-[#176B4D] transition-colors">
                  Buyer Procurement Hub
                </Link>
              </li>
              <li>
                <Link to="/seller/dashboard" className="hover:text-[#176B4D] transition-colors">
                  Supplier Operations Hub
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-[#176B4D] transition-colors">
                  Transparent 2% Model
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-2 text-xs bg-[#F8FAF8] p-4 rounded-xl border border-[#E3EAE5]">
            <div className="flex items-center gap-1.5 font-bold text-[#17251F]">
              <Shield className="w-4 h-4 text-[#176B4D]" />
              Safe Trading & Confidentiality
            </div>
            <p className="text-[11px] leading-relaxed text-[#64736B]">
              Seller brand identity and reserve prices remain strictly confidential during public marketplace browsing. Exact warehouse dock locations unlock exclusively upon deal acceptance and payment confirmation.
            </p>
            <div className="pt-2 text-[10px] text-[#64736B]">
              Demonstration prototype for Hacktoberfest Side Hustle. Simulated settlement only.
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#E3EAE5] flex flex-col sm:flex-row items-center justify-between text-xs text-[#64736B] gap-4">
          <p>© 2026 SurplusLink AI. All rights reserved. Built for Pakistani B2B wholesale commerce.</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-[#176B4D]">
              <HeartHandshake className="w-3.5 h-3.5" />
              Verified Two-Way Settlement
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
