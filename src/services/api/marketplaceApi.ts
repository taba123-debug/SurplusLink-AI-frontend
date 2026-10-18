import type {
  Lot,
  LotFilters,
  CreateLotInput,
  LotStatus,
  LotExtraction,
  RequirementExtraction,
  BuyerRequirement,
  CreateRequirementInput,
  MatchResult,
  Offer,
  CreateOfferInput,
  OfferResponseInput,
  Deal,
  CheckoutSession,
  DashboardSummary,
  UserRole,
} from '@/types';

export interface MarketplaceApi {
  // Lots
  getLots(filters?: LotFilters): Promise<Lot[]>;
  getLot(id: string): Promise<Lot>;
  createLot(input: CreateLotInput): Promise<Lot>;
  updateLotStatus(id: string, status: LotStatus): Promise<Lot>;

  // AI Extraction
  parseSellerDescription(text: string): Promise<LotExtraction>;
  parseBuyerRequirement(text: string): Promise<RequirementExtraction>;

  // Requirements
  getRequirements(): Promise<BuyerRequirement[]>;
  getRequirement(id: string): Promise<BuyerRequirement>;
  createRequirement(input: CreateRequirementInput): Promise<BuyerRequirement>;
  deleteRequirement(id: string): Promise<void>;
  getRequirementMatches(id: string): Promise<MatchResult[]>;

  // Offers
  getOffers(role?: UserRole): Promise<Offer[]>;
  getOffer(id: string): Promise<Offer>;
  createOffer(input: CreateOfferInput): Promise<Offer>;
  respondToOffer(id: string, input: OfferResponseInput): Promise<Offer>;

  // Deals
  getDeals(role?: UserRole): Promise<Deal[]>;
  getDeal(id: string): Promise<Deal>;
  createCheckout(dealId: string): Promise<CheckoutSession>;
  simulatePayment(dealId: string, outcome: 'SUCCESS' | 'FAILURE'): Promise<Deal>;
  confirmPickup(dealId: string): Promise<Deal>;

  // Dashboard
  getDashboard(role: 'buyer' | 'seller' | 'admin'): Promise<DashboardSummary>;
}
