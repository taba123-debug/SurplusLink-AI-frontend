import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RoleSwitcher } from './RoleSwitcher';
import { Sparkles, Menu, X, ArrowRight, Store, Building2, Package } from 'lucide-react';
import { useDemoStore } from '@/store/useDemoStore';

export function TopNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { currentRole } = useDemoStore();

  const isPublicPage =
    location.pathname === '/' ||
    location.pathname === '/how-it-works' ||
    location.pathname === '/login';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E3EAE5] bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#176B4D] flex items-center justify-center text-white shadow-xs group-hover:bg-[#10553C] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 3h5v5" />
                <path d="M8 21H3v-5" />
                <path d="M21 3l-7.5 7.5" />
                <path d="M3 21l7.5-7.5" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-lg tracking-tight text-[#17251F]">
                  SurplusLink
                </span>
                <span className="text-[10px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded-md bg-[#EAF5EF] text-[#176B4D] flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-[#E8A84B]" />
                  AI
                </span>
              </div>
              <span className="text-[10px] text-[#64736B] -mt-1 hidden sm:inline">
                B2B Bakery Surplus Marketplace
              </span>
            </div>
          </Link>

          {/* Public Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              to="/marketplace"
              className={`transition-colors ${
                location.pathname.startsWith('/marketplace')
                  ? 'text-[#176B4D] font-semibold'
                  : 'text-[#64736B] hover:text-[#17251F]'
              }`}
            >
              Wholesale Lots
            </Link>
            <Link
              to="/buyer/ai-sourcing"
              className="text-[#17251F] hover:text-[#176B4D] flex items-center gap-1.5 bg-[#EAF5EF]/70 px-2.5 py-1 rounded-lg border border-[#176B4D]/15 text-xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#176B4D]" />
              AI Sourcing
            </Link>
            <Link
              to="/how-it-works"
              className={`transition-colors ${
                location.pathname === '/how-it-works'
                  ? 'text-[#176B4D] font-semibold'
                  : 'text-[#64736B] hover:text-[#17251F]'
              }`}
            >
              How It Works
            </Link>
          </nav>
        </div>

        {/* Right CTA & Role Switcher */}
        <div className="flex items-center gap-3">
          <RoleSwitcher />

          {/* Quick Hub Navigation */}
          {currentRole === 'buyer' ? (
            <Link
              to="/buyer/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#176B4D] bg-[#EAF5EF] hover:bg-[#d5ebd9] px-3 py-2 rounded-xl transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              Buyer Workspace
              <ArrowRight className="w-3 h-3" />
            </Link>
          ) : currentRole === 'seller' ? (
            <Link
              to="/seller/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#176B4D] bg-[#EAF5EF] hover:bg-[#d5ebd9] px-3 py-2 rounded-xl transition-colors"
            >
              <Building2 className="w-3.5 h-3.5" />
              Seller Workspace
              <ArrowRight className="w-3 h-3" />
            </Link>
          ) : (
            <Link
              to="/admin/overview"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-2 rounded-xl transition-colors"
            >
              Admin View
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#64736B] hover:text-[#17251F] hover:bg-[#F8FAF8] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E3EAE5] bg-white px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2">
            <Link
              to="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded-lg text-sm font-medium text-[#17251F] hover:bg-[#F8FAF8]"
            >
              <Package className="w-4 h-4 text-[#176B4D]" />
              Wholesale Lots
            </Link>
            <Link
              to="/buyer/ai-sourcing"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded-lg text-sm font-semibold text-[#176B4D] bg-[#EAF5EF]"
            >
              <Sparkles className="w-4 h-4 text-[#176B4D]" />
              AI Inventory Sourcing
            </Link>
            <Link
              to="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded-lg text-sm font-medium text-[#17251F] hover:bg-[#F8FAF8]"
            >
              How It Works & Economics
            </Link>
            <div className="pt-2 border-t border-[#E3EAE5]">
              <Link
                to={currentRole === 'buyer' ? '/buyer/dashboard' : currentRole === 'seller' ? '/seller/dashboard' : '/admin/overview'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#176B4D] text-white text-sm font-semibold"
              >
                <span>Open {currentRole === 'buyer' ? 'Buyer' : currentRole === 'seller' ? 'Seller' : 'Admin'} Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
