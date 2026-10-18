import { NavLink } from 'react-router-dom';
import { useDemoStore } from '@/store/useDemoStore';
import {
  LayoutDashboard,
  Sparkles,
  BookmarkCheck,
  PackageSearch,
  HandCoins,
  FileCheck2,
  PackagePlus,
  Boxes,
  LineChart,
  ShieldCheck,
  Info,
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: any;
  badge?: string;
  highlight?: boolean;
}

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const { currentRole, currentOrg } = useDemoStore();

  const buyerNav: NavItem[] = [
    { name: 'Buyer Dashboard', path: '/buyer/dashboard', icon: LayoutDashboard },
    { name: 'AI Sourcing', path: '/buyer/ai-sourcing', icon: Sparkles, badge: 'AI' },
    { name: 'Saved Requirements', path: '/buyer/requirements', icon: BookmarkCheck },
    { name: 'Wholesale Lots', path: '/marketplace', icon: PackageSearch },
    { name: 'Negotiation Offers', path: '/buyer/offers', icon: HandCoins },
    { name: 'Deals & Pickup', path: '/buyer/deals', icon: FileCheck2 },
  ];

  const sellerNav: NavItem[] = [
    { name: 'Seller Dashboard', path: '/seller/dashboard', icon: LayoutDashboard },
    { name: 'Surplus Inventory', path: '/seller/inventory', icon: Boxes },
    { name: 'List New Surplus', path: '/seller/inventory/new', icon: PackagePlus, highlight: true },
    { name: 'Incoming Offers', path: '/seller/offers', icon: HandCoins },
    { name: 'Completed Deals', path: '/seller/deals', icon: FileCheck2 },
    { name: 'Analytics & Reporting', path: '/seller/analytics', icon: LineChart },
  ];

  const adminNav: NavItem[] = [
    { name: 'Platform Overview', path: '/admin/overview', icon: LayoutDashboard },
    { name: 'All Wholesale Lots', path: '/marketplace', icon: PackageSearch },
    { name: 'All Offers', path: '/seller/offers', icon: HandCoins },
    { name: 'All Deals', path: '/seller/deals', icon: FileCheck2 },
  ];

  const navItems =
    currentRole === 'buyer' ? buyerNav : currentRole === 'seller' ? sellerNav : adminNav;

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-[#E3EAE5] bg-white transition-all duration-200 shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Current Organization Info Card */}
      <div className="p-4 border-b border-[#E3EAE5] bg-[#F8FAF8]">
        {!collapsed ? (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64736B]">
                {currentRole.toUpperCase()} WORKSPACE
              </span>
              <span className="flex items-center gap-1 text-[10px] text-[#176B4D] font-semibold bg-[#EAF5EF] px-1.5 py-0.5 rounded">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#17251F] truncate">{currentOrg.name}</h4>
            <p className="text-xs text-[#64736B] truncate">{currentOrg.businessType}</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-9 h-9 rounded-xl bg-[#EAF5EF] text-[#176B4D] flex items-center justify-center font-bold text-sm">
              {currentOrg.name.charAt(0)}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/marketplace'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#EAF5EF] text-[#176B4D] font-semibold shadow-2xs'
                  : item.highlight
                  ? 'text-[#176B4D] hover:bg-[#EAF5EF]/50 font-semibold'
                  : 'text-[#64736B] hover:text-[#17251F] hover:bg-[#F8FAF8]'
              } ${collapsed ? 'justify-center px-0' : ''}`
            }
            title={collapsed ? item.name : undefined}
          >
            <item.icon className="w-4 h-4 shrink-0 text-current" />
            {!collapsed && (
              <span className="truncate flex-1">{item.name}</span>
            )}
            {!collapsed && item.badge && (
              <span className="text-[10px] font-bold bg-[#E8A84B]/20 text-[#B27318] px-1.5 py-0.5 rounded">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Transparent Commission & Demo notice */}
      {!collapsed && (
        <div className="p-4 m-3 rounded-xl border border-[#E3EAE5] bg-[#F8FAF8] text-xs text-[#64736B] space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-[#17251F]">
            <Info className="w-3.5 h-3.5 text-[#176B4D]" />
            <span>Platform Economics</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Buyer: 2% service fee
            <br />
            Seller: 2% commission
            <br />
            Zero hidden costs.
          </p>
        </div>
      )}
    </aside>
  );
}
