import { calculateDealFinancials, toMinorUnits } from '@/lib/money';
import { useDemoStore } from '@/store/useDemoStore';
import type {
  BuyerRequirement,
  CheckoutSession,
  CreateLotInput,
  CreateOfferInput,
  CreateRequirementInput,
  DashboardSummary,
  Deal,
  Lot,
  LotExtraction,
  LotFilters,
  LotStatus,
  MatchResult,
  Offer,
  OfferResponseInput,
  RequirementExtraction,
  UserRole,
} from '@/types';
import type { MarketplaceApi } from '../api/marketplaceApi';
import { extractBuyerRequirement, extractSellerLotDescription } from './aiParser';
import { matchLotsToRequirement } from './matcher';
import { INITIAL_DEALS, INITIAL_LOTS, INITIAL_OFFERS, INITIAL_REQUIREMENTS } from './seedData';

const DB_KEY = 'surpluslink_mock_db_v1';

interface MockDatabase {
  lots: Lot[];
  requirements: BuyerRequirement[];
  offers: Offer[];
  deals: Deal[];
}

function loadDatabase(): MockDatabase {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.lots && parsed.requirements && parsed.offers && parsed.deals) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load mock database from localStorage, resetting to seed data.', err);
  }

  const initial: MockDatabase = {
    lots: INITIAL_LOTS,
    requirements: INITIAL_REQUIREMENTS,
    offers: INITIAL_OFFERS,
    deals: INITIAL_DEALS,
  };
  saveDatabase(initial);
  return initial;
}

function saveDatabase(db: MockDatabase): void {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Failed to save mock database to localStorage', err);
  }
}

export class MockMarketplaceApi implements MarketplaceApi {
  private async delay(ms = 200): Promise<void> {
    const state = useDemoStore.getState();
    if (state.simulateLatency) {
      await new Promise((resolve) => setTimeout(resolve, ms));
    }
  }

  /**
   * Sanitizes lot objects to ensure confidential reserve prices are NEVER exposed
   * to buyers or unauthenticated public visitors.
   */
  private sanitizeLotForViewer(lot: Lot, viewerRole?: UserRole, viewerOrgId?: string): Lot {
    // If the viewer is the seller who owns this lot, allow them to see the confidential reserve
    if (viewerRole === 'seller' && viewerOrgId && lot.sellerId === viewerOrgId) {
      return { ...lot };
    }
    // Otherwise, strip confidential reserve price completely
    const sanitized = { ...lot };
    delete sanitized.reserveUnitPriceMinor;
    return sanitized;
  }

  // --- LOTS ---

  async getLots(filters?: LotFilters): Promise<Lot[]> {
    await this.delay(180);
    const db = loadDatabase();
    const { currentRole, currentOrg } = useDemoStore.getState();

    let result = db.lots.map((l) => this.sanitizeLotForViewer(l, currentRole, currentOrg.id));

    if (!filters) return result;

    if (filters.category && filters.category !== 'ALL') {
      result = result.filter((l) => l.category === filters.category);
    }
    if (filters.city) {
      result = result.filter((l) => l.city.toLowerCase() === filters.city!.toLowerCase());
    }
    if (filters.minPriceMinor !== undefined && filters.minPriceMinor > 0) {
      result = result.filter((l) => l.askingUnitPriceMinor === null || l.askingUnitPriceMinor >= filters.minPriceMinor!);
    }
    if (filters.maxPriceMinor !== undefined && filters.maxPriceMinor > 0) {
      result = result.filter((l) => l.askingUnitPriceMinor === null || l.askingUnitPriceMinor <= filters.maxPriceMinor!);
    }
    if (filters.minQuantity !== undefined && filters.minQuantity > 0) {
      result = result.filter((l) => l.availableQuantity >= filters.minQuantity!);
    }
    if (filters.verifiedOnly) {
      result = result.filter((l) => l.sellerVerified);
    }
    if (filters.status && filters.status !== 'ALL') {
      result = result.filter((l) => l.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.pickupRegion.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q)
      );
    }

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price_asc':
          result.sort((a, b) => (a.askingUnitPriceMinor ?? 999999) - (b.askingUnitPriceMinor ?? 999999));
          break;
        case 'price_desc':
          result.sort((a, b) => (b.askingUnitPriceMinor ?? 0) - (a.askingUnitPriceMinor ?? 0));
          break;
        case 'qty_desc':
          result.sort((a, b) => b.availableQuantity - a.availableQuantity);
          break;
        case 'expiry_soon':
          result.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
          break;
        case 'newest':
          result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }
    }

    return result;
  }

  async getLot(id: string): Promise<Lot> {
    await this.delay(120);
    const db = loadDatabase();
    const lot = db.lots.find((l) => l.id === id);
    if (!lot) {
      throw new Error(`Inventory lot with ID "${id}" was not found.`);
    }
    const { currentRole, currentOrg } = useDemoStore.getState();
    return this.sanitizeLotForViewer(lot, currentRole, currentOrg.id);
  }

  async createLot(input: CreateLotInput): Promise<Lot> {
    await this.delay(250);
    const db = loadDatabase();
    const { currentOrg } = useDemoStore.getState();

    const newId = `lot-${Date.now().toString(36)}`;
    const lotRef = `LOT-LHR-${Math.floor(1000 + Math.random() * 9000)}`;

    const newLot: Lot = {
      id: newId,
      lotReference: lotRef,
      sellerId: currentOrg.id,
      sellerName: currentOrg.name,
      sellerDescriptor: `${currentOrg.businessType} (${currentOrg.area})`,
      sellerVerified: currentOrg.verified,
      title: input.title,
      category: input.category,
      description: input.description,
      totalQuantity: input.totalQuantity,
      availableQuantity: input.totalQuantity,
      reservedQuantity: 0,
      unitType: input.unitType,
      askingUnitPriceMinor: input.askingUnitPriceMinor,
      reserveUnitPriceMinor: input.reserveUnitPriceMinor,
      minPurchaseQuantity: input.minPurchaseQuantity,
      packagingType: input.packagingType,
      manufactureDate: input.manufactureDate,
      expiryDate: input.expiryDate,
      storageRequirements: input.storageRequirements,
      city: input.city,
      pickupRegion: input.pickupRegion,
      pickupDeadline: input.pickupDeadline,
      resalePermissionConfirmed: input.resalePermissionConfirmed,
      safetyAttestationConfirmed: input.safetyAttestationConfirmed,
      status: 'ACTIVE',
      images: input.images && input.images.length > 0
        ? input.images
        : ['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.lots.unshift(newLot);
    saveDatabase(db);
    return newLot;
  }

  async updateLotStatus(id: string, status: LotStatus): Promise<Lot> {
    await this.delay(150);
    const db = loadDatabase();
    const index = db.lots.findIndex((l) => l.id === id);
    if (index === -1) throw new Error('Lot not found');

    db.lots[index].status = status;
    db.lots[index].updatedAt = new Date().toISOString();
    saveDatabase(db);
    return db.lots[index];
  }

  // --- AI EXTRACTION ---

  async parseSellerDescription(text: string): Promise<LotExtraction> {
    await this.delay(400); // Realistic AI inference indication
    return extractSellerLotDescription(text);
  }

  async parseBuyerRequirement(text: string): Promise<RequirementExtraction> {
    await this.delay(400); // Realistic AI inference indication
    return extractBuyerRequirement(text);
  }

  // --- BUYER REQUIREMENTS ---

  async getRequirements(): Promise<BuyerRequirement[]> {
    await this.delay(150);
    const db = loadDatabase();
    const { currentOrg, currentRole } = useDemoStore.getState();

    let result = db.requirements;
    if (currentRole === 'buyer') {
      result = result.filter((r) => r.buyerId === currentOrg.id);
    }

    // Refresh match counts
    return result.map((r) => {
      const matches = matchLotsToRequirement(r, db.lots);
      return { ...r, matchCount: matches.length };
    });
  }

  async getRequirement(id: string): Promise<BuyerRequirement> {
    await this.delay(120);
    const db = loadDatabase();
    const req = db.requirements.find((r) => r.id === id);
    if (!req) throw new Error('Requirement not found');
    const matches = matchLotsToRequirement(req, db.lots);
    return { ...req, matchCount: matches.length };
  }

  async createRequirement(input: CreateRequirementInput): Promise<BuyerRequirement> {
    await this.delay(250);
    const db = loadDatabase();
    const { currentOrg } = useDemoStore.getState();

    const newReq: BuyerRequirement = {
      id: `req-${Date.now().toString(36)}`,
      buyerId: currentOrg.id,
      buyerName: currentOrg.name,
      title: input.title,
      category: input.category,
      requiredQuantity: input.requiredQuantity,
      maxTotalBudgetMinor: input.maxTotalBudgetMinor,
      minRemainingShelfLifeDays: input.minRemainingShelfLifeDays,
      city: input.city,
      preferredArea: input.preferredArea,
      pickupPreference: input.pickupPreference,
      status: 'ACTIVE',
      matchCount: 0,
      createdAt: new Date().toISOString(),
    };

    const matches = matchLotsToRequirement(newReq, db.lots);
    newReq.matchCount = matches.length;

    db.requirements.unshift(newReq);
    saveDatabase(db);
    return newReq;
  }

  async deleteRequirement(id: string): Promise<void> {
    await this.delay(150);
    const db = loadDatabase();
    db.requirements = db.requirements.filter((r) => r.id !== id);
    saveDatabase(db);
  }

  async getRequirementMatches(id: string): Promise<MatchResult[]> {
    await this.delay(200);
    const db = loadDatabase();
    const req = db.requirements.find((r) => r.id === id);
    if (!req) throw new Error('Requirement not found');

    const { currentRole, currentOrg } = useDemoStore.getState();
    const sanitizedLots = db.lots.map((l) => this.sanitizeLotForViewer(l, currentRole, currentOrg.id));
    return matchLotsToRequirement(req, sanitizedLots);
  }

  // --- OFFERS ---

  async getOffers(role?: UserRole): Promise<Offer[]> {
    await this.delay(180);
    const db = loadDatabase();
    const { currentOrg, currentRole } = useDemoStore.getState();
    const targetRole = role || currentRole;

    if (targetRole === 'buyer') {
      return db.offers.filter((o) => o.buyerId === currentOrg.id);
    }
    if (targetRole === 'seller') {
      return db.offers.filter((o) => o.sellerId === currentOrg.id);
    }
    return db.offers;
  }

  async getOffer(id: string): Promise<Offer> {
    await this.delay(120);
    const db = loadDatabase();
    const offer = db.offers.find((o) => o.id === id);
    if (!offer) throw new Error('Offer not found');
    return offer;
  }

  async createOffer(input: CreateOfferInput): Promise<Offer> {
    await this.delay(250);
    const db = loadDatabase();
    const { currentOrg } = useDemoStore.getState();

    const lot = db.lots.find((l) => l.id === input.lotId);
    if (!lot) throw new Error('Inventory lot not found');

    if (input.requestedQuantity <= 0) {
      throw new Error('Requested quantity must be greater than zero');
    }
    if (input.requestedQuantity > lot.availableQuantity) {
      throw new Error(`Requested quantity exceeds available stock (${lot.availableQuantity})`);
    }
    if (lot.minPurchaseQuantity && input.requestedQuantity < lot.minPurchaseQuantity) {
      throw new Error(`Requested quantity is below the minimum order of ${lot.minPurchaseQuantity}`);
    }

    const subtotalMinor = input.offeredUnitPriceMinor * input.requestedQuantity;
    const { buyerServiceFeeMinor, buyerTotalMinor } = calculateDealFinancials(subtotalMinor);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (input.expiresInDays || 3));

    const newOffer: Offer = {
      id: `offer-${Date.now().toString(36)}`,
      offerReference: `OFF-LHR-${Math.floor(1000 + Math.random() * 9000)}`,
      lotId: lot.id,
      lotTitle: lot.title,
      buyerId: currentOrg.id,
      buyerName: currentOrg.name,
      sellerId: lot.sellerId,
      sellerName: lot.sellerName,
      sellerDescriptor: lot.sellerDescriptor,
      requestedQuantity: input.requestedQuantity,
      offeredUnitPriceMinor: input.offeredUnitPriceMinor,
      offerSubtotalMinor: subtotalMinor,
      buyerServiceFeeMinor,
      checkoutTotalMinor: buyerTotalMinor,
      pickupPreference: input.pickupPreference || 'Self-collection via buyer vehicle',
      expiresAt: expiresAt.toISOString(),
      status: 'PENDING',
      history: [
        {
          action: 'CREATED',
          actorName: `${currentOrg.contactPerson} (${currentOrg.name})`,
          actorRole: 'buyer',
          timestamp: new Date().toISOString(),
          note: `Submitted initial offer of ${input.requestedQuantity} units at Rs. ${(
            input.offeredUnitPriceMinor / 100
          ).toFixed(0)}/unit.`,
          unitPriceMinor: input.offeredUnitPriceMinor,
          quantity: input.requestedQuantity,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.offers.unshift(newOffer);
    saveDatabase(db);
    return newOffer;
  }

  async respondToOffer(id: string, input: OfferResponseInput): Promise<Offer> {
    await this.delay(250);
    const db = loadDatabase();
    const { currentOrg, currentRole } = useDemoStore.getState();

    const offerIndex = db.offers.findIndex((o) => o.id === id);
    if (offerIndex === -1) throw new Error('Offer not found');
    const offer = db.offers[offerIndex];

    // State validation & duplicate acceptance prevention
    if (offer.status === 'ACCEPTED') {
      throw new Error('This offer has already been accepted and locked into a deal.');
    }
    if (offer.status === 'REJECTED' || offer.status === 'WITHDRAWN' || offer.status === 'EXPIRED') {
      throw new Error(`Cannot respond to offer because its status is already ${offer.status}.`);
    }

    const lotIndex = db.lots.findIndex((l) => l.id === offer.lotId);
    if (lotIndex === -1) throw new Error('Associated lot was not found.');
    const lot = db.lots[lotIndex];

    if (input.action === 'ACCEPT') {
      // Check stock availability
      if (lot.availableQuantity < offer.requestedQuantity) {
        throw new Error(`Insufficient inventory: only ${lot.availableQuantity} units available.`);
      }

      // Reserve stock on lot
      lot.availableQuantity -= offer.requestedQuantity;
      lot.reservedQuantity += offer.requestedQuantity;
      if (lot.availableQuantity === 0) {
        lot.status = 'PENDING_OFFER';
      }

      // Calculate exact deal financials
      const effectiveUnitPriceMinor = offer.sellerCounterUnitPriceMinor || offer.offeredUnitPriceMinor;
      const effectiveQuantity = offer.sellerCounterQuantity || offer.requestedQuantity;
      const subtotalMinor = effectiveUnitPriceMinor * effectiveQuantity;
      const financials = calculateDealFinancials(subtotalMinor);

      // Create exactly one deal
      const dealId = `deal-${Date.now().toString(36)}`;
      const newDeal: Deal = {
        id: dealId,
        dealReference: `DL-LHR-${Math.floor(1000 + Math.random() * 9000)}`,
        offerId: offer.id,
        lotId: lot.id,
        lotTitle: lot.title,
        buyerId: offer.buyerId,
        buyerName: offer.buyerName,
        sellerId: lot.sellerId,
        sellerName: lot.sellerName,
        sellerDescriptor: lot.sellerDescriptor,
        quantity: effectiveQuantity,
        unitPriceMinor: effectiveUnitPriceMinor,
        subtotalMinor: financials.subtotalMinor,
        buyerServiceFeeMinor: financials.buyerServiceFeeMinor,
        buyerTotalMinor: financials.buyerTotalMinor,
        sellerCommissionMinor: financials.sellerCommissionMinor,
        sellerNetProceedsMinor: financials.sellerNetProceedsMinor,
        platformGrossRevenueMinor: financials.platformGrossRevenueMinor,
        paymentStatus: 'UNPAID',
        pickupStatus: 'PENDING_PAYMENT',
        status: 'AWAITING_PAYMENT',
        timeline: [
          {
            title: 'Offer Accepted & Agreement Locked',
            description: `Seller accepted offer for ${effectiveQuantity} ${lot.unitType}. Inventory reserved.`,
            timestamp: new Date().toISOString(),
            completed: true,
          },
          {
            title: 'Simulated Checkout Pending',
            description: 'Awaiting buyer simulated escrow payment confirmation.',
            timestamp: new Date().toISOString(),
            completed: false,
            statusTag: 'Action Required',
          },
          {
            title: 'Private Warehouse Pickup Unlock',
            description: 'Confidential warehouse dock address and contact unlock after demo payment.',
            timestamp: new Date().toISOString(),
            completed: false,
          },
          {
            title: 'Final Handover & Settlement',
            description: 'Goods handover inspection and completion.',
            timestamp: new Date().toISOString(),
            completed: false,
          },
        ],
        createdAt: new Date().toISOString(),
      };

      db.deals.unshift(newDeal);

      offer.status = 'ACCEPTED';
      offer.dealId = dealId;
      offer.history.push({
        action: 'ACCEPTED',
        actorName: `${currentOrg.contactPerson} (${currentOrg.name})`,
        actorRole: currentRole,
        timestamp: new Date().toISOString(),
        note: 'Offer accepted! Deal agreement generated and stock reserved.',
      });
    } else if (input.action === 'REJECT') {
      offer.status = 'REJECTED';
      offer.history.push({
        action: 'REJECTED',
        actorName: `${currentOrg.contactPerson} (${currentOrg.name})`,
        actorRole: currentRole,
        timestamp: new Date().toISOString(),
        note: input.counterNote || 'Seller rejected the proposed terms.',
      });
    } else if (input.action === 'COUNTER') {
      if (!input.counterUnitPriceMinor || input.counterUnitPriceMinor <= 0) {
        throw new Error('A valid counter unit price is required.');
      }
      offer.status = 'COUNTERED';
      offer.sellerCounterUnitPriceMinor = input.counterUnitPriceMinor;
      offer.sellerCounterQuantity = input.counterQuantity || offer.requestedQuantity;
      offer.sellerCounterNote = input.counterNote || 'Seller proposed revised price terms.';

      const expires = new Date();
      expires.setDate(expires.getDate() + 2);
      offer.sellerCounterExpiresAt = expires.toISOString();

      offer.history.push({
        action: 'COUNTERED',
        actorName: `${currentOrg.contactPerson} (${currentOrg.name})`,
        actorRole: currentRole,
        timestamp: new Date().toISOString(),
        note: input.counterNote || `Countered at Rs. ${(input.counterUnitPriceMinor / 100).toFixed(0)}/unit.`,
        unitPriceMinor: input.counterUnitPriceMinor,
        quantity: input.counterQuantity || offer.requestedQuantity,
      });
    }

    offer.updatedAt = new Date().toISOString();
    saveDatabase(db);
    return offer;
  }

  // --- DEALS & CHECKOUT ---

  async getDeals(role?: UserRole): Promise<Deal[]> {
    await this.delay(180);
    const db = loadDatabase();
    const { currentOrg, currentRole } = useDemoStore.getState();
    const targetRole = role || currentRole;

    if (targetRole === 'buyer') {
      return db.deals.filter((d) => d.buyerId === currentOrg.id);
    }
    if (targetRole === 'seller') {
      return db.deals.filter((d) => d.sellerId === currentOrg.id);
    }
    return db.deals;
  }

  async getDeal(id: string): Promise<Deal> {
    await this.delay(120);
    const db = loadDatabase();
    const deal = db.deals.find((d) => d.id === id);
    if (!deal) throw new Error('Deal not found');
    return deal;
  }

  async createCheckout(dealId: string): Promise<CheckoutSession> {
    await this.delay(150);
    const db = loadDatabase();
    const deal = db.deals.find((d) => d.id === dealId);
    if (!deal) throw new Error('Deal not found');

    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 2);

    return {
      dealId: deal.id,
      dealReference: deal.dealReference,
      amountPayableMinor: deal.buyerTotalMinor,
      paymentStatus: deal.paymentStatus,
      sessionExpiry: expiry.toISOString(),
    };
  }

  async simulatePayment(dealId: string, outcome: 'SUCCESS' | 'FAILURE'): Promise<Deal> {
    await this.delay(350);
    const db = loadDatabase();
    const deal = db.deals.find((d) => d.id === dealId);
    if (!deal) throw new Error('Deal not found');

    if (deal.status === 'COMPLETED' || deal.paymentStatus === 'SIMULATED_PAID') {
      return deal; // idempotent
    }

    if (outcome === 'FAILURE') {
      deal.paymentStatus = 'PAYMENT_FAILED';
      deal.timeline.push({
        title: 'Simulated Payment Failed',
        description: 'Demo transaction simulation returned an error. Try again.',
        timestamp: new Date().toISOString(),
        completed: false,
        statusTag: 'Failed',
      });
      saveDatabase(db);
      return deal;
    }

    // Payment Success
    deal.paymentStatus = 'SIMULATED_PAID';
    deal.pickupStatus = 'READY_FOR_PICKUP';
    deal.status = 'PAID_AWAITING_PICKUP';
    deal.paidAt = new Date().toISOString();

    // UNLOCK AUTHORIZED PRIVATE PICKUP DETAILS
    deal.privatePickupDetails = {
      warehouseAddress: `${deal.sellerName} Main Dispatch Dock, Plot 48-B, Industrial Estate, Lahore`,
      contactPerson: 'Tariq Mehmood (Warehouse Operations Lead)',
      phone: '+92 300 4821901',
      pickupHours: 'Monday–Saturday, 08:30 AM – 05:30 PM',
      releaseCode: `SL-OTP-${Math.floor(1000 + Math.random() * 9000)}`,
      locationNotes: 'Present the release code at Gate 2 security cabin to initiate pallet loading.',
    };

    // Update timeline
    deal.timeline.forEach((t) => {
      if (t.title.includes('Checkout Pending')) {
        t.completed = true;
        t.statusTag = 'Simulated Paid';
        t.description = 'Demo escrow payment confirmed. Funds reserved in platform demonstration vault.';
      }
      if (t.title.includes('Private Warehouse Pickup Unlock')) {
        t.completed = true;
        t.statusTag = 'Unlocked';
      }
    });

    saveDatabase(db);
    return deal;
  }

  async confirmPickup(dealId: string): Promise<Deal> {
    await this.delay(250);
    const db = loadDatabase();
    const deal = db.deals.find((d) => d.id === dealId);
    if (!deal) throw new Error('Deal not found');

    if (deal.paymentStatus !== 'SIMULATED_PAID') {
      throw new Error('Cannot complete handover before simulated payment is confirmed.');
    }

    deal.pickupStatus = 'COLLECTED';
    deal.status = 'COMPLETED';
    deal.completedAt = new Date().toISOString();

    // Deduct reserved stock permanently from lot
    const lot = db.lots.find((l) => l.id === deal.lotId);
    if (lot) {
      lot.reservedQuantity = Math.max(0, lot.reservedQuantity - deal.quantity);
      if (lot.availableQuantity === 0 && lot.reservedQuantity === 0) {
        lot.status = 'SOLD_OUT';
      }
    }

    deal.timeline.push({
      title: 'Inventory Handover Completed',
      description: 'Physical inspection and inventory collection confirmed by trading parties.',
      timestamp: new Date().toISOString(),
      completed: true,
      statusTag: 'Finalized',
    });

    saveDatabase(db);
    return deal;
  }

  // --- DASHBOARD SUMMARY ---

  async getDashboard(role: 'buyer' | 'seller' | 'admin'): Promise<DashboardSummary> {
    await this.delay(200);
    const db = loadDatabase();
    const { currentOrg } = useDemoStore.getState();

    if (role === 'buyer') {
      const buyerDeals = db.deals.filter((d) => d.buyerId === currentOrg.id);
      const buyerOffers = db.offers.filter((o) => o.buyerId === currentOrg.id);
      const buyerReqs = db.requirements.filter((r) => r.buyerId === currentOrg.id);

      const completedDeals = buyerDeals.filter((d) => d.status === 'COMPLETED');
      const completedValue = completedDeals.reduce((sum, d) => sum + d.subtotalMinor, 0);
      const platformFees = completedDeals.reduce((sum, d) => sum + d.buyerServiceFeeMinor, 0);

      return {
        role: 'buyer',
        metrics: {
          pendingOffers: buyerOffers.filter((o) => o.status === 'PENDING' || o.status === 'COUNTERED').length,
          acceptedDeals: buyerDeals.length,
          completedDealValueMinor: completedValue,
          platformFeesMinor: platformFees,
          activeRequirements: buyerReqs.filter((r) => r.status === 'ACTIVE').length,
          matchingLots: db.lots.filter((l) => l.status === 'ACTIVE').length,
        },
        recentDeals: buyerDeals.slice(0, 5),
        recentOffers: buyerOffers.slice(0, 5),
        chartData: [
          { period: 'Week 1', dealVolumeMinor: toMinorUnits(18000), commissionMinor: toMinorUnits(360), dealsCount: 1 },
          { period: 'Week 2', dealVolumeMinor: toMinorUnits(32000), commissionMinor: toMinorUnits(640), dealsCount: 2 },
          { period: 'Week 3', dealVolumeMinor: toMinorUnits(24000), commissionMinor: toMinorUnits(480), dealsCount: 2 },
          { period: 'Week 4 (Current)', dealVolumeMinor: completedValue || toMinorUnits(12500), commissionMinor: platformFees || toMinorUnits(250), dealsCount: completedDeals.length || 1 },
        ],
      };
    }

    if (role === 'seller') {
      const sellerLots = db.lots.filter((l) => l.sellerId === currentOrg.id);
      const sellerOffers = db.offers.filter((o) => o.sellerId === currentOrg.id);
      const sellerDeals = db.deals.filter((d) => d.sellerId === currentOrg.id);

      const activeLots = sellerLots.filter((l) => l.status === 'ACTIVE');
      const unitsListed = sellerLots.reduce((sum, l) => sum + l.totalQuantity, 0);
      const completedDeals = sellerDeals.filter((d) => d.status === 'COMPLETED');
      const completedValue = completedDeals.reduce((sum, d) => sum + d.subtotalMinor, 0);
      const platformFees = completedDeals.reduce((sum, d) => sum + d.sellerCommissionMinor, 0);

      return {
        role: 'seller',
        metrics: {
          activeLots: activeLots.length,
          unitsListed,
          pendingOffers: sellerOffers.filter((o) => o.status === 'PENDING').length,
          acceptedDeals: sellerDeals.length,
          completedDealValueMinor: completedValue,
          platformFeesMinor: platformFees,
        },
        recentDeals: sellerDeals.slice(0, 5),
        recentOffers: sellerOffers.slice(0, 5),
        chartData: [
          { period: 'Week 1', dealVolumeMinor: toMinorUnits(25000), commissionMinor: toMinorUnits(500), dealsCount: 2 },
          { period: 'Week 2', dealVolumeMinor: toMinorUnits(45000), commissionMinor: toMinorUnits(900), dealsCount: 3 },
          { period: 'Week 3', dealVolumeMinor: toMinorUnits(38000), commissionMinor: toMinorUnits(760), dealsCount: 2 },
          { period: 'Week 4 (Current)', dealVolumeMinor: completedValue || toMinorUnits(21500), commissionMinor: platformFees || toMinorUnits(430), dealsCount: completedDeals.length || 2 },
        ],
      };
    }

    // Admin
    const completedDeals = db.deals.filter((d) => d.status === 'COMPLETED');
    const totalVolume = completedDeals.reduce((sum, d) => sum + d.subtotalMinor, 0);
    const totalRevenue = completedDeals.reduce((sum, d) => sum + d.platformGrossRevenueMinor, 0);

    return {
      role: 'admin',
      metrics: {
        activeLots: db.lots.filter((l) => l.status === 'ACTIVE').length,
        unitsListed: db.lots.reduce((sum, l) => sum + l.totalQuantity, 0),
        pendingOffers: db.offers.filter((o) => o.status === 'PENDING').length,
        acceptedDeals: db.deals.length,
        completedDealValueMinor: totalVolume,
        platformFeesMinor: totalRevenue,
      },
      recentDeals: db.deals.slice(0, 8),
      recentOffers: db.offers.slice(0, 8),
      chartData: [
        { period: 'Week 1', dealVolumeMinor: toMinorUnits(43000), commissionMinor: toMinorUnits(860), dealsCount: 3 },
        { period: 'Week 2', dealVolumeMinor: toMinorUnits(77000), commissionMinor: toMinorUnits(1540), dealsCount: 5 },
        { period: 'Week 3', dealVolumeMinor: toMinorUnits(62000), commissionMinor: toMinorUnits(1240), dealsCount: 4 },
        { period: 'Week 4', dealVolumeMinor: totalVolume || toMinorUnits(34000), commissionMinor: totalRevenue || toMinorUnits(680), dealsCount: completedDeals.length || 3 },
      ],
    };
  }
}
