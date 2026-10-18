import { useNavigate } from 'react-router-dom';
import { useDemoStore, SEED_ORGANIZATIONS } from '@/store/useDemoStore';
import { Button } from '@/components/ui/button';
import { Store, Building2, Shield, ArrowRight, UserCheck } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { currentOrg, setCurrentOrg } = useDemoStore();

  const handleSelectRole = (orgId: string, role: string) => {
    setCurrentOrg(orgId);
    if (role === 'buyer') navigate('/buyer/dashboard');
    else if (role === 'seller') navigate('/seller/dashboard');
    else if (role === 'admin') navigate('/admin/overview');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-[#EAF5EF] text-[#176B4D] flex items-center justify-center mx-auto">
          <UserCheck className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-[#17251F]">
          SurplusLink Demo Workspace Entry
        </h1>
        <p className="text-sm text-[#64736B] max-w-md mx-auto">
          Select a verified buyer, supplier, or platform operator organization to test the complete end-to-end B2B trading flow.
        </p>
      </div>

      <div className="space-y-4">
        {/* Buyer Persona Cards */}
        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#176B4D]">
            <Store className="w-4 h-4" />
            <span>Retail Buyer Personas</span>
          </div>

          <div className="space-y-2">
            {SEED_ORGANIZATIONS.filter((o) => o.role === 'buyer').slice(0, 2).map((org) => (
              <button
                key={org.id}
                onClick={() => handleSelectRole(org.id, org.role)}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[#E3EAE5] hover:border-[#176B4D] hover:bg-[#EAF5EF]/30 transition-all text-left cursor-pointer"
              >
                <div>
                  <div className="text-sm font-bold text-[#17251F]">{org.name}</div>
                  <div className="text-xs text-[#64736B]">{org.businessType} • {org.area}, {org.city}</div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-[#176B4D]">
                  <span>Enter as Buyer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Seller Persona Cards */}
        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#B27318]">
            <Building2 className="w-4 h-4" />
            <span>Supplier / Seller Personas</span>
          </div>

          <div className="space-y-2">
            {SEED_ORGANIZATIONS.filter((o) => o.role === 'seller').slice(0, 2).map((org) => (
              <button
                key={org.id}
                onClick={() => handleSelectRole(org.id, org.role)}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[#E3EAE5] hover:border-[#176B4D] hover:bg-[#EAF5EF]/30 transition-all text-left cursor-pointer"
              >
                <div>
                  <div className="text-sm font-bold text-[#17251F]">{org.name}</div>
                  <div className="text-xs text-[#64736B]">{org.businessType} • {org.area}, {org.city}</div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-[#B27318]">
                  <span>Enter as Supplier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Admin Demo Card */}
        <div className="rounded-2xl border border-[#E3EAE5] bg-white p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-purple-700">
            <Shield className="w-4 h-4" />
            <span>Marketplace Platform Operator</span>
          </div>

          {SEED_ORGANIZATIONS.filter((o) => o.role === 'admin').map((org) => (
            <button
              key={org.id}
              onClick={() => handleSelectRole(org.id, org.role)}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[#E3EAE5] hover:border-purple-300 hover:bg-purple-50/50 transition-all text-left cursor-pointer"
            >
              <div>
                <div className="text-sm font-bold text-[#17251F]">{org.name}</div>
                <div className="text-xs text-[#64736B]">Marketplace Operations & Commission Ledger</div>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-purple-700">
                <span>Enter Admin View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 bg-[#F8FAF8] rounded-2xl border border-[#E3EAE5] text-xs text-[#64736B] text-center space-y-1">
        <strong>Backend Architecture Note:</strong> Production deployment connects to the separate FastAPI repository with OAuth2/JWT tokens and database-backed authorization.
      </div>
    </div>
  );
}
