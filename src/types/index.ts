export type UserRole = 'buyer' | 'seller' | 'admin';

export type ProductCategory = 'BISCUITS' | 'RUSKS' | 'COOKIES' | 'CRACKERS' | 'PACKAGED_BREAD' | 'CAKES' | 'PASTRIES' | 'BUNS';

export type LotStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'PENDING_OFFER'
  | 'PARTIALLY_SOLD'
  | 'SOLD_OUT'
  | 'PAUSED'
  | 'CLOSED';

export type UnitType = 'packs' | 'boxes' | 'cartons' | 'cases' | 'trays' | 'pieces';

export interface Organization {
  userId?: string;
  id: string;
  name: string;
  role: UserRole;
  city: string;
  area: string;
  verified: boolean;
  contactPerson: string;
  phone: string;
  address: string; // Confidential warehouse/store address
  businessType: string;
}

export interface Lot {
  id: string;
  lotReference: string;
  sellerId: string;
  sellerName: string;
  sellerDescriptor: string; // Confidential alias for public buyers (e.g. "Verified Tier-1 Bakery Producer")
  sellerVerified: boolean;
  title: string;
  category: ProductCategory;
  description: string;
  totalQuantity: number;
  availableQuantity: number;
  soldQuantity?: number;
  reservedQuantity: number;
  unitType: UnitType;
  askingUnitPriceMinor: number | null; // null if "Submit Offer"
  reserveUnitPriceMinor?: number; // STRICTLY CONFIDENTIAL to seller! Never in buyer responses.
  minPurchaseQuantity: number;
  packagingType: string;
  manufactureDate?: string;
  expiryDate: string;
  storageRequirements: string;
  city: string;
  pickupRegion: string;
  pickupDeadline: string;
  resalePermissionConfirmed: boolean;
  safetyAttestationConfirmed: boolean;
  status: LotStatus;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LotFilters {
  category?: ProductCategory | 'ALL';
  city?: string;
  minPriceMinor?: number;
  maxPriceMinor?: number;
  minQuantity?: number;
  minShelfLifeDays?: number;
  packagingType?: string;
  verifiedOnly?: boolean;
  status?: LotStatus | 'ALL';
  search?: string;
  sortBy?: 'expiry_soon' | 'price_asc' | 'price_desc' | 'qty_desc' | 'newest';
}

export interface BuyerRequirement {
  id: string;
  buyerId: string;
  buyerName: string;
  title: string;
  category: ProductCategory;
  requiredQuantity: number;
  maxTotalBudgetMinor: number;
  minRemainingShelfLifeDays: number;
  city: string;
  preferredArea?: string;
  pickupPreference?: string;
  status: 'ACTIVE' | 'PAUSED' | 'FULFILLED' | 'ARCHIVED';
  matchCount?: number;
  createdAt: string;
}

export interface RequirementExtraction {
  unit?: string;
  originalDescription?: string;
  category: ProductCategory;
  required_quantity: number;
  max_total_budget_minor: number;
  min_remaining_shelf_life_days: number;
  city: string;
  preferred_area: string | null;
  needs_review: boolean;
  missing_fields: string[];
}

export interface LotExtraction {
  title: string;
  category: ProductCategory;
  total_quantity: number;
  unit_type: UnitType;
  asking_unit_price_minor: number | null;
  reserve_unit_price_minor: number | null;
  min_purchase_quantity: number;
  packaging_type: string;
  expiry_days_from_now: number;
  storage_requirements: string;
  city: string;
  pickup_region: string;
  needs_review: boolean;
  missing_fields: string[];
}

export interface MatchResult {
  lot: Lot;
  compatibilityScore: number; // 0 - 100
  matchReasons: string[];
  budgetCompatibility: 'UNDER_BUDGET' | 'WITHIN_BUDGET' | 'OVER_BUDGET';
  estimatedTotalMinor: number;
  quantityMatch: 'EXACT' | 'SURPLUS_AVAILABLE' | 'PARTIAL';
  shelfLifeCompatibilityDays: number;
}

export type OfferStatus =
  | 'PENDING'
  | 'COUNTERED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'EXPIRED';

export interface OfferHistoryEntry {
  action: 'CREATED' | 'COUNTERED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  actorName: string;
  actorRole: UserRole;
  timestamp: string;
  note?: string;
  unitPriceMinor?: number;
  quantity?: number;
}

export interface Offer {
  id: string;
  offerReference: string;
  lotId: string;
  lotTitle: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  sellerDescriptor: string;
  requestedQuantity: number;
  offeredUnitPriceMinor: number;
  offerSubtotalMinor: number;
  buyerServiceFeeMinor?: number;
  checkoutTotalMinor?: number;
  pickupPreference?: string;
  expiresAt: string;
  status: OfferStatus;
  sellerCounterUnitPriceMinor?: number;
  sellerCounterQuantity?: number;
  sellerCounterExpiresAt?: string;
  sellerCounterNote?: string;
  dealId?: string;
  history: OfferHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export type DealStatus = 'AWAITING_PAYMENT' | 'PAID_AWAITING_PICKUP' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'SIMULATED_PAID' | 'PAYMENT_FAILED';
export type PickupStatus = 'PENDING_PAYMENT' | 'READY_FOR_PICKUP' | 'COLLECTED';

export interface PrivatePickupDetails {
  warehouseAddress: string;
  contactPerson: string;
  phone: string;
  pickupHours: string;
  releaseCode: string;
  locationNotes?: string;
}

export interface DealTimelineEntry {
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
  statusTag?: string;
}

export interface Deal {
  id: string;
  dealReference: string;
  offerId: string;
  lotId: string;
  lotTitle: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  sellerDescriptor: string;
  quantity: number;
  unitPriceMinor: number;
  subtotalMinor: number;
  buyerServiceFeeMinor: number;
  buyerTotalMinor: number;
  sellerCommissionMinor: number;
  sellerNetProceedsMinor: number;
  platformGrossRevenueMinor?: number;
  paymentStatus: PaymentStatus;
  pickupStatus: PickupStatus;
  status: DealStatus;
  privatePickupDetails?: PrivatePickupDetails; // Available ONLY after payment
  timeline: DealTimelineEntry[];
  createdAt: string;
  paidAt?: string;
  completedAt?: string;
}

export interface CheckoutSession {
  dealId: string;
  dealReference: string;
  amountPayableMinor: number;
  paymentStatus: PaymentStatus;
  sessionExpiry: string;
}

export interface DashboardSummary {
  role: 'buyer' | 'seller' | 'admin';
  metrics: {
    sellerNetMinor?: number;
    platformRevenueMinor?: number;
    activeLots?: number;
    unitsListed?: number;
    pendingOffers: number;
    acceptedDeals: number;
    completedDealValueMinor: number;
    platformFeesMinor: number;
    activeRequirements?: number;
    matchingLots?: number;
  };
  recentDeals: Deal[];
  recentOffers: Offer[];
  chartData: Array<{
    period: string;
    dealVolumeMinor: number;
    commissionMinor: number;
    dealsCount: number;
  }>;
}

export interface CreateLotInput {
  pickupAddress?: string;
  title: string;
  category: ProductCategory;
  description: string;
  totalQuantity: number;
  unitType: UnitType;
  askingUnitPriceMinor: number | null;
  reserveUnitPriceMinor?: number;
  minPurchaseQuantity: number;
  packagingType: string;
  manufactureDate?: string;
  expiryDate: string;
  storageRequirements: string;
  city: string;
  pickupRegion: string;
  pickupDeadline: string;
  resalePermissionConfirmed: boolean;
  safetyAttestationConfirmed: boolean;
  images?: string[];
}

export interface CreateRequirementInput {
  originalDescription?: string;
  unit?: string;
  title: string;
  category: ProductCategory;
  requiredQuantity: number;
  maxTotalBudgetMinor: number;
  minRemainingShelfLifeDays: number;
  city: string;
  preferredArea?: string;
  pickupPreference?: string;
}

export interface CreateOfferInput {
  requirementId?: string;
  lotId: string;
  requestedQuantity: number;
  offeredUnitPriceMinor: number;
  pickupPreference?: string;
  expiresInDays?: number;
}

export interface OfferResponseInput {
  action: 'ACCEPT' | 'REJECT' | 'COUNTER';
  counterUnitPriceMinor?: number;
  counterQuantity?: number;
  counterNote?: string;
}
