import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Organization, UserRole } from '@/types';

export const SEED_ORGANIZATIONS: Organization[] = [
  // Sellers
  {
    id: 'seller-org-1',
    name: 'Punjab Biscuits Ltd',
    role: 'seller',
    city: 'Lahore',
    area: 'Gulberg Industrial Area',
    verified: true,
    contactPerson: 'Tariq Mehmood',
    phone: '+92 300 4821901',
    address: 'Plot 48-B, Industrial Area, Gulberg III, Lahore',
    businessType: 'Tier-1 Industrial Biscuit Manufacturer',
  },
  {
    id: 'seller-org-2',
    name: 'Mehran Confectionery Works',
    role: 'seller',
    city: 'Lahore',
    area: 'Township Industrial Zone',
    verified: true,
    contactPerson: 'Khurram Shehzad',
    phone: '+92 321 9452109',
    address: 'Sector B-II, Township Industrial Estate, Lahore',
    businessType: 'Commercial Rusk & Baked Goods Producer',
  },
  {
    id: 'seller-org-3',
    name: 'Indus Premium Bakers',
    role: 'seller',
    city: 'Lahore',
    area: 'Quaid-e-Azam Industrial Estate',
    verified: true,
    contactPerson: 'Salman Akram',
    phone: '+92 333 7129840',
    address: 'Gate 4, Quaid-e-Azam Industrial Estate, Kot Lakhpat, Lahore',
    businessType: 'Wholesale Crackers & Pastry Supplier',
  },
  // Buyers
  {
    id: 'buyer-org-1',
    name: 'City Mart Superstores',
    role: 'buyer',
    city: 'Lahore',
    area: 'Johar Town',
    verified: true,
    contactPerson: 'Bilal Farooq',
    phone: '+92 301 8823190',
    address: 'Main Boulevard, G-1 Market, Johar Town, Lahore',
    businessType: 'Multi-Branch Retail Grocery Network',
  },
  {
    id: 'buyer-org-2',
    name: 'Lahore Corner Marts',
    role: 'buyer',
    city: 'Lahore',
    area: 'Model Town',
    verified: true,
    contactPerson: 'Asad Chaudhry',
    phone: '+92 312 4591230',
    address: 'Link Road, Model Town C Block, Lahore',
    businessType: 'Neighborhood Convenience Store Chain',
  },
  {
    id: 'buyer-org-3',
    name: 'Al-Madina Wholesale Depot',
    role: 'buyer',
    city: 'Lahore',
    area: 'Badami Bagh',
    verified: true,
    contactPerson: 'Haji Riaz Ahmed',
    phone: '+92 302 3319041',
    address: 'General Bus Stand Road, Badami Bagh, Lahore',
    businessType: 'Regional Wholesale Re-distributor',
  },
  {
    id: 'buyer-org-4',
    name: 'DHA Express Grocery',
    role: 'buyer',
    city: 'Lahore',
    area: 'DHA Phase 5',
    verified: true,
    contactPerson: 'Zainab Qasim',
    phone: '+92 320 5419082',
    address: 'Commercial Plaza, Phase 5 DHA, Lahore',
    businessType: 'Premium Retail Supermarket',
  },
  // Admin
  {
    id: 'admin-org-1',
    name: 'SurplusLink AI Operations',
    role: 'admin',
    city: 'Lahore',
    area: 'Gulberg III',
    verified: true,
    contactPerson: 'Marketplace Operations Team',
    phone: '+92 42 35780000',
    address: 'Arfa Software Technology Park, Ferozepur Road, Lahore',
    businessType: 'Marketplace Platform Operator',
  },
];

interface DemoState {
  organizations: Organization[];
  setOrganizations: (organizations: Organization[]) => void;
  currentOrg: Organization;
  currentRole: UserRole;
  simulateLatency: boolean;
  setCurrentOrg: (orgId: string) => void;
  setCurrentRole: (role: UserRole) => void;
  toggleLatency: () => void;
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      organizations: SEED_ORGANIZATIONS,
      setOrganizations: (organizations) => set((state) => {
        const currentOrg = organizations.find(o => o.id === state.currentOrg.id) || organizations.find(o => o.name.includes('Johar Town')) || organizations[0];
        return { organizations, currentOrg, currentRole: currentOrg.role };
      }),
      currentOrg: SEED_ORGANIZATIONS[3], // Default to Buyer: City Mart Superstores
      currentRole: 'buyer',
      simulateLatency: true,

      setCurrentOrg: (orgId: string) => {
        const found = get().organizations.find((o) => o.id === orgId);
        if (found) {
          set({ currentOrg: found, currentRole: found.role });
        }
      },

      setCurrentRole: (role: UserRole) => {
        // Pick the first org matching this role
        const defaultOrg = get().organizations.find((o) => o.role === role) || get().organizations[0];
        set({ currentRole: role, currentOrg: defaultOrg });
      },

      toggleLatency: () => set((state) => ({ simulateLatency: !state.simulateLatency })),
    }),
    {
      name: 'surpluslink_demo_session',
    }
  )
);
