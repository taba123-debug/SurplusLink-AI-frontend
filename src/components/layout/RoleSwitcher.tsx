import { useState } from 'react';
import { useDemoStore } from '@/store/useDemoStore';
import { UserCheck, ChevronDown, Check, Building2, Store, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

export function RoleSwitcher() {
  const { currentOrg, currentRole, setCurrentOrg, organizations } = useDemoStore();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (orgId: string, role: string) => {
    setCurrentOrg(orgId);
    setIsOpen(false);
    // Route to appropriate workspace dashboard
    if (role === 'buyer') navigate('/buyer/dashboard');
    else if (role === 'seller') navigate('/seller/dashboard');
    else if (role === 'admin') navigate('/admin/overview');
  };

  const roleBadgeColor = {
    buyer: 'bg-[#EAF5EF] text-[#176B4D] border-[#176B4D]/30',
    seller: 'bg-[#FEF8EC] text-[#B27318] border-[#E8A84B]/40',
    admin: 'bg-purple-50 text-purple-700 border-purple-200',
  }[currentRole];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-[#E3EAE5] bg-white hover:bg-[#F8FAF8] text-xs transition-colors cursor-pointer shadow-xs"
        title="Demo Organization & Role Switcher"
      >
        <div className="w-2 h-2 rounded-full bg-[#176B4D] animate-pulse" />
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#17251F] max-w-[130px] truncate">
              {currentOrg.name}
            </span>
            <span className={`px-1.5 py-0.2 rounded uppercase text-[10px] font-bold border ${roleBadgeColor}`}>
              {currentRole}
            </span>
          </div>
          <span className="text-[10px] text-[#64736B] truncate max-w-[150px]">
            Demo Environment • Switch Org
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-[#64736B] ml-1" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent onClose={() => setIsOpen(false)} className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-[#176B4D] mb-1">
              <UserCheck className="w-5 h-5" />
              <span className="text-xs uppercase tracking-wider font-bold">Demo Workspace Session</span>
            </div>
            <DialogTitle>Switch Demo Organization</DialogTitle>
            <DialogDescription>
              Select any seeded buyer or seller business to test two-way negotiation, inventory listings, and mock settlement flows.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            {/* Buyers */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#64736B] uppercase mb-2">
                <Store className="w-3.5 h-3.5 text-[#176B4D]" />
                Buyer Businesses (Retailers & Wholesalers)
              </div>
              <div className="space-y-1.5">
                {organizations.filter((o) => o.role === 'buyer').map((org) => {
                  const isSelected = org.id === currentOrg.id;
                  return (
                    <button
                      key={org.id}
                      onClick={() => handleSelect(org.id, org.role)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#176B4D] bg-[#EAF5EF]/40 font-medium'
                          : 'border-[#E3EAE5] bg-white hover:bg-[#F8FAF8]'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-semibold text-[#17251F] flex items-center gap-1.5">
                          {org.name}
                          {org.verified && (
                            <span className="text-[10px] text-[#176B4D] bg-[#EAF5EF] px-1.5 rounded font-normal">
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#64736B]">
                          {org.businessType} • {org.area}, {org.city}
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#176B4D]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sellers */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#64736B] uppercase mb-2">
                <Building2 className="w-3.5 h-3.5 text-[#B27318]" />
                Seller Suppliers (Bakery & Food Producers)
              </div>
              <div className="space-y-1.5">
                {organizations.filter((o) => o.role === 'seller').map((org) => {
                  const isSelected = org.id === currentOrg.id;
                  return (
                    <button
                      key={org.id}
                      onClick={() => handleSelect(org.id, org.role)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#176B4D] bg-[#EAF5EF]/40 font-medium'
                          : 'border-[#E3EAE5] bg-white hover:bg-[#F8FAF8]'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-semibold text-[#17251F] flex items-center gap-1.5">
                          {org.name}
                          {org.verified && (
                            <span className="text-[10px] text-[#176B4D] bg-[#EAF5EF] px-1.5 rounded font-normal">
                              Verified Producer
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#64736B]">
                          {org.businessType} • {org.area}, {org.city}
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#176B4D]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Admin */}
            <div hidden={!organizations.some(o => o.role === 'admin')}>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#64736B] uppercase mb-2">
                <Shield className="w-3.5 h-3.5 text-purple-700" />
                Marketplace Operator
              </div>
              {organizations.filter((o) => o.role === 'admin').map((org) => {
                const isSelected = org.id === currentOrg.id;
                return (
                  <button
                    key={org.id}
                    onClick={() => handleSelect(org.id, org.role)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#176B4D] bg-[#EAF5EF]/40 font-medium'
                        : 'border-[#E3EAE5] bg-white hover:bg-[#F8FAF8]'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold text-[#17251F]">{org.name}</div>
                      <div className="text-xs text-[#64736B]">Platform Operations & Governance</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#176B4D]" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-[#F8FAF8] rounded-xl text-xs text-[#64736B] border border-[#E3EAE5]">
            <strong>Notice:</strong> This switcher is for demonstration purposes to show both sides of the marketplace. Production will enforce backend JWT authentication and role authorization.
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
