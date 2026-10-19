import axios, { AxiosError, type AxiosInstance } from 'axios';
import type * as C from './contracts';
import type * as UI from '@/types';
import type { MarketplaceApi } from '../api/marketplaceApi';
import { useDemoStore } from '@/store/useDemoStore';

const ref = (id: string) => id.slice(0, 8).toUpperCase();
const aiRequest = (description: string): C.ParseRequest => ({
  description,
  reference_date: new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Karachi', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()),
  timezone: 'Asia/Karachi',
});
const categoryToUi = (v: string) => (v === 'bread' ? 'PACKAGED_BREAD' : v.toUpperCase()) as UI.ProductCategory;
function categoryToApi(v: UI.ProductCategory): C.LotCreate['category'] {
  const category = v === 'PACKAGED_BREAD' ? 'bread' : v.toLowerCase();
  if (!['biscuits', 'bread', 'cakes', 'pastries', 'rusks', 'buns'].includes(category)) throw new Error('Select a category supported by the backend.');
  return category as C.LotCreate['category'];
}
const unitToUi = (v: string) => ({ pack: 'packs', carton: 'cartons', tray: 'trays', piece: 'pieces' }[v] || v) as UI.UnitType;
function unitToApi(v: string): C.LotCreate['unit'] {
  const unit = ({ packs: 'pack', cartons: 'carton', trays: 'tray', pieces: 'piece' } as Record<string,string>)[v];
  if (!unit) throw new Error('Choose packs, cartons, trays or pieces.');
  return unit as C.LotCreate['unit'];
}

// Public data is explicitly allowlisted; private fields enter only through /lots/mine.
export function mapLot(x: C.LotPublic, privateData?: C.LotPrivate): UI.Lot {
  return {
    id: x.id, lotReference: ref(x.id), sellerId: x.seller_org_id, sellerName: 'Supplier',
    sellerDescriptor: 'Marketplace supplier', sellerVerified: false, title: x.product_name,
    category: categoryToUi(x.category), description: x.description, totalQuantity: x.quantity_total,
    availableQuantity: x.available_quantity, soldQuantity: x.quantity_sold, reservedQuantity: x.quantity_reserved, unitType: unitToUi(x.unit),
    askingUnitPriceMinor: x.asking_unit_price_minor,
    ...(privateData ? { reserveUnitPriceMinor: privateData.min_unit_price_minor } : {}),
    minPurchaseQuantity: x.minimum_order_quantity, packagingType: x.packaging_type,
    manufactureDate: x.manufacture_date || undefined, expiryDate: x.expiry_date, storageRequirements: x.storage_type,
    city: x.city, pickupRegion: x.pickup_area, pickupDeadline: x.pickup_deadline,
    resalePermissionConfirmed: x.resale_confirmed, safetyAttestationConfirmed: x.information_confirmed,
    status: x.status as UI.LotStatus, images: [], createdAt: x.created_at, updatedAt: x.created_at,
  };
}

export class HttpMarketplaceApi implements MarketplaceApi {
  private client: AxiosInstance;
  constructor(baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1') {
    this.client = axios.create({ baseURL, timeout: 60000, headers: { 'Content-Type': 'application/json' } });
    this.client.interceptors.request.use(config => {
      const { currentOrg } = useDemoStore.getState();
      if (currentOrg.userId) {
        config.headers.set('X-Demo-Org-ID', currentOrg.id);
        config.headers.set('X-Demo-User-ID', currentOrg.userId);
      }
      return config;
    });
    this.client.interceptors.response.use(r => r, (error: AxiosError<C.ErrorResponse & { detail?: string | C.ValidationError[] }>) => {
      const body = error.response?.data;
      const detail = body?.detail;
      const message = body?.error?.message || (typeof detail === 'string' ? detail : Array.isArray(detail) ? detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join('; ') : undefined)
        || (error.response?.status === 503 ? 'AI provider is unavailable. Retry later or enter the details manually.' : !error.response ? 'Cannot reach the API. Check FastAPI and its CORS configuration.' : error.message);
      return Promise.reject(Object.assign(new Error(message), { status: error.response?.status }));
    });
  }
  private async get<T>(url: string): Promise<T> { return (await this.client.get<T>(url)).data; }
  private async post<T>(url: string, body?: unknown): Promise<T> { return (await this.client.post<T>(url, body)).data; }
  private async all<T>(path: string): Promise<T[]> {
    const items: T[] = [];
    for (let offset = 0; ; offset += 100) {
      const page = await this.get<T[]>(`${path}?limit=100&offset=${offset}`);
      items.push(...page);
      if (page.length < 100) return items;
    }
  }
  async loadIdentities(): Promise<UI.Organization[]> {
    const [identities, organizations] = await Promise.all([this.get<C.DemoIdentityOption[]>('/demo/identities'), this.get<C.DemoOrganization[]>('/demo/organizations')]);
    return organizations.flatMap(org => {
      const identity = identities.find(i => i.organization_id === org.id && ['OWNER', 'MANAGER'].includes(i.role));
      return identity ? [{ id: org.id, userId: identity.user_id, name: org.name, role: org.business_type === 'BAKERY' ? 'seller' as const : 'buyer' as const,
        city: org.city, area: '', verified: false, contactPerson: '', phone: '', address: '', businessType: org.business_type }] : [];
    }).sort((a,b) => Number(!/Gulberg Packaged|Johar Town/.test(a.name)) - Number(!/Gulberg Packaged|Johar Town/.test(b.name)));
  }
  async getLots(filters?: UI.LotFilters): Promise<UI.Lot[]> {
    const lots = (await this.all<C.LotPublic>('/lots')).map(x => mapLot(x));
    const filtered = lots.filter(x => (!filters?.category || filters.category === 'ALL' || x.category === filters.category)
      && (!filters?.city || x.city.toLowerCase().includes(filters.city.toLowerCase()))
      && (!filters?.search || `${x.title} ${x.description}`.toLowerCase().includes(filters.search.toLowerCase()))
      && (!filters?.minQuantity || x.availableQuantity >= filters.minQuantity)
      && (!filters?.minPriceMinor || (x.askingUnitPriceMinor ?? 0) >= filters.minPriceMinor)
      && (!filters?.maxPriceMinor || (x.askingUnitPriceMinor ?? Infinity) <= filters.maxPriceMinor)
      && (!filters?.minShelfLifeDays || Date.parse(x.expiryDate)-Date.now() >= filters.minShelfLifeDays*86400000)
      && (!filters?.packagingType || x.packagingType.toLowerCase().includes(filters.packagingType.toLowerCase()))
      && (!filters?.verifiedOnly || x.sellerVerified)
      && (!filters?.status || filters.status === 'ALL' || x.status === filters.status));
    return filtered.sort((a,b) => filters?.sortBy === 'price_asc' ? (a.askingUnitPriceMinor ?? 0)-(b.askingUnitPriceMinor ?? 0) : filters?.sortBy === 'price_desc' ? (b.askingUnitPriceMinor ?? 0)-(a.askingUnitPriceMinor ?? 0) : filters?.sortBy === 'qty_desc' ? b.availableQuantity-a.availableQuantity : filters?.sortBy === 'expiry_soon' ? Date.parse(a.expiryDate)-Date.parse(b.expiryDate) : Date.parse(b.createdAt)-Date.parse(a.createdAt));
  }
  async getOwnLots(): Promise<UI.Lot[]> { return (await this.all<C.LotPrivate>('/lots/mine')).map(x => mapLot(x, x)); }
  async getLot(id: string) { return mapLot(await this.get<C.LotPublic>(`/lots/${id}`)); }
  private async lotContext(id: string) {
    try { return await this.getLot(id); }
    catch (error) {
      if ((error as { status?: number }).status !== 404) throw error;
      if (useDemoStore.getState().currentRole === 'seller') {
        const owned = (await this.getOwnLots()).find(x => x.id === id);
        if (owned) return owned;
      }
      // Historical deals and offers remain usable after public inventory disappears.
      return { title: `Inventory ${ref(id)} (no longer public)`, sellerId: '', sellerDescriptor: 'Marketplace supplier' };
    }
  }
  async createLot(i: UI.CreateLotInput) {
    const body: C.LotCreate = { product_name: i.title, category: categoryToApi(i.category), description: i.description,
      original_description: i.description, quantity_total: i.totalQuantity, unit: unitToApi(i.unitType),
      asking_unit_price_minor: i.askingUnitPriceMinor ?? 0, min_unit_price_minor: i.reserveUnitPriceMinor ?? 0,
      minimum_order_quantity: i.minPurchaseQuantity, packaging_type: i.packagingType as 'sealed', storage_type: i.storageRequirements as C.LotCreate['storage_type'],
      expiry_date: i.expiryDate.slice(0,10), manufacture_date: i.manufactureDate?.slice(0,10), city: i.city,
      pickup_area: i.pickupRegion, pickup_address: i.pickupAddress || '', pickup_deadline: i.pickupDeadline,
      resale_confirmed: i.resalePermissionConfirmed, information_confirmed: i.safetyAttestationConfirmed, status: 'DRAFT' };
    return mapLot(await this.post<C.LotPublic>('/lots', body));
  }
  async updateLotStatus(id: string, status: UI.LotStatus) {
    if (!['ACTIVE','PAUSED'].includes(status)) throw new Error('This backend supports publishing and pausing listings.');
    const x = await this.post<C.LotPrivate>(`/lots/${id}/${status === 'ACTIVE' ? 'publish' : 'pause'}`);
    return mapLot(x, x);
  }
  private ensureLive(x: { mode: string; simulated: boolean }) {
    if (x.mode !== 'live' || x.simulated) throw new Error('The backend returned simulated AI output. Configure live AI on the backend, or enter details manually. No real inference was performed.');
  }
  async parseSellerDescription(text: string): Promise<UI.LotExtraction> {
    const x = await this.post<C.LotParseResponse>('/ai/parse-lot', aiRequest(text));
    this.ensureLive(x);
    const d = x.data;
    return { title: d.product_name || '', category: d.category ? categoryToUi(d.category) : '' as UI.ProductCategory,
      total_quantity: d.quantity_total ?? 0, unit_type: d.unit ? unitToUi(d.unit) : '' as UI.UnitType,
      asking_unit_price_minor: d.asking_unit_price_minor, reserve_unit_price_minor: d.min_unit_price_minor,
      min_purchase_quantity: 1, packaging_type: d.packaging_type || '',
      expiry_days_from_now: d.remaining_shelf_life_days ?? (d.expiry_date ? Math.max(0,Math.ceil((Date.parse(d.expiry_date)-Date.now())/86400000)) : 0),
      storage_requirements: d.storage_type || '', city: d.city || '', pickup_region: d.pickup_area || '', needs_review: true, missing_fields: x.missing_fields };
  }
  async parseBuyerRequirement(text: string): Promise<UI.RequirementExtraction> {
    const x = await this.post<C.RequirementParseResponse>('/ai/parse-requirement', aiRequest(text));
    this.ensureLive(x);
    return { category: x.data.category ? categoryToUi(x.data.category) : '' as UI.ProductCategory,
      required_quantity: x.data.required_quantity ?? 0, max_total_budget_minor: x.data.max_total_budget_minor ?? 0,
      min_remaining_shelf_life_days: x.data.min_shelf_life_days ?? 0, city: x.data.city || '', preferred_area: x.data.preferred_area || null,
      needs_review: true, missing_fields: x.missing_fields, unit: x.data.unit || '', originalDescription: text };
  }
  private requirement(x: C.RequirementPublic): UI.BuyerRequirement {
    return { id: x.id, buyerId: x.buyer_org_id, buyerName: 'Buyer', title: x.title, category: categoryToUi(x.category), requiredQuantity: x.required_quantity,
      maxTotalBudgetMinor: x.max_total_budget_minor, minRemainingShelfLifeDays: x.min_shelf_life_days, city: x.city, preferredArea: x.preferred_area || undefined,
      status: x.status as UI.BuyerRequirement['status'], createdAt: x.created_at };
  }
  async getRequirements() {
    const { currentOrg, currentRole } = useDemoStore.getState();
    return (await this.all<C.RequirementPublic>('/requirements')).filter(x => currentRole === 'seller' || x.buyer_org_id === currentOrg.id).map(x => this.requirement(x));
  }
  async getRequirement(id: string) { return this.requirement(await this.get<C.RequirementPublic>(`/requirements/${id}`)); }
  async createRequirement(i: UI.CreateRequirementInput) {
    const body: C.RequirementCreate = { title: i.title, original_description: i.originalDescription || i.title, category: categoryToApi(i.category),
      unit: (i.unit || 'pack') as C.RequirementCreate['unit'], required_quantity: i.requiredQuantity, max_total_budget_minor: i.maxTotalBudgetMinor,
      min_shelf_life_days: i.minRemainingShelfLifeDays, city: i.city, preferred_area: i.preferredArea };
    return this.requirement(await this.post<C.RequirementPublic>('/requirements', body));
  }
  async deleteRequirement(id: string) { await this.post(`/requirements/${id}/pause`); }
  async getRequirementMatches(id: string): Promise<UI.MatchResult[]> {
    return (await this.get<C.LotMatch[]>(`/requirements/${id}/matches`)).map(x => ({ lot: mapLot(x.lot), compatibilityScore: x.match_score,
      matchReasons: [x.match_type,...x.reasons], matchType: x.match_type, budgetCompatibility: x.match_type === 'NEGOTIABLE' ? 'OVER_BUDGET' : 'WITHIN_BUDGET',
      estimatedTotalMinor: x.estimated_buyer_total_minor, quantityMatch: 'EXACT', shelfLifeCompatibilityDays: 0 }));
  }
  private async offer(x: C.OfferResponse, dealId?: string): Promise<UI.Offer> {
    const lot = await this.lotContext(x.lot_id);
    return { id: x.id, offerReference: ref(x.id), lotId: x.lot_id, lotTitle: lot.title, buyerId: x.buyer_org_id, buyerName: 'Buyer',
      sellerId: lot.sellerId, sellerName: 'Supplier', sellerDescriptor: lot.sellerDescriptor, requestedQuantity: x.quantity,
      offeredUnitPriceMinor: x.offered_unit_price_minor, offerSubtotalMinor: x.quantity*x.offered_unit_price_minor,
      expiresAt: x.expires_at, status: x.status as UI.OfferStatus,
      history: [], createdAt: x.created_at, updatedAt: x.created_at, dealId };
  }
  async getOffers(role?: UI.UserRole) {
    const org = useDemoStore.getState().currentOrg.id;
    const [offers,deals] = await Promise.all([this.all<C.OfferResponse>('/offers'),this.all<C.DealResponse>('/deals')]);
    const mapped = await Promise.all(offers.map(x => this.offer(x,deals.find(d => d.offer_id === x.id)?.id)));
    return mapped.filter(x => role === 'buyer' ? x.buyerId === org : role === 'seller' ? x.sellerId === org : true);
  }
  async getOffer(id: string) { return this.offer(await this.get<C.OfferResponse>(`/offers/${id}`)); }
  async createOffer(i: UI.CreateOfferInput) { return this.offer(await this.post<C.OfferResponse>(`/lots/${i.lotId}/offers`, { quantity: i.requestedQuantity, offered_unit_price_minor: i.offeredUnitPriceMinor, requirement_id: i.requirementId } satisfies C.OfferCreate)); }
  async respondToOffer(id: string, i: UI.OfferResponseInput) {
    if (i.action === 'COUNTER') throw new Error('The backend supports accept or reject only.');
    const x = await this.post<C.RespondResponse>(`/offers/${id}/respond`, { action: i.action } satisfies C.Respond);
    return this.offer(x.offer,x.deal?.id);
  }
  private async deal(x: C.DealResponse, details = false): Promise<UI.Deal> {
    const lot = await this.lotContext(x.lot_id);
    const paid = ['PAID','COMPLETED'].includes(x.status);
    const payment = details ? await this.get<C.PaymentResponse>(`/deals/${x.id}/payment`).catch((e: Error & { status?: number }) => { if (e.status === 404) return undefined; throw e; }) : undefined;
    const pickup = details && paid ? await this.get<C.PickupDetails>(`/deals/${x.id}/pickup-details`) : undefined;
    return { id: x.id, dealReference: ref(x.id), offerId: x.offer_id, lotId: x.lot_id, lotTitle: lot.title,
      buyerId: x.buyer_org_id, buyerName: useDemoStore.getState().organizations.find(o => o.id === x.buyer_org_id)?.name || 'Buyer',
      sellerId: x.seller_org_id, sellerName: useDemoStore.getState().organizations.find(o => o.id === x.seller_org_id)?.name || 'Supplier', sellerDescriptor: 'Marketplace supplier',
      quantity: x.quantity, unitPriceMinor: x.agreed_unit_price_minor, subtotalMinor: x.subtotal_minor,
      buyerServiceFeeMinor: x.buyer_fee_minor, buyerTotalMinor: x.buyer_total_minor, sellerCommissionMinor: x.seller_fee_minor,
      sellerNetProceedsMinor: x.seller_net_minor,
      paymentStatus: paid ? 'SIMULATED_PAID' : payment?.status === 'FAILED' ? 'PAYMENT_FAILED' : 'UNPAID', pickupStatus: x.status === 'COMPLETED' ? 'COLLECTED' : paid ? 'READY_FOR_PICKUP' : 'PENDING_PAYMENT',
      status: (x.status === 'PAID' ? 'PAID_AWAITING_PICKUP' : x.status) as UI.DealStatus,
      ...(pickup ? { privatePickupDetails: { warehouseAddress: pickup.pickup_address, pickupHours: `Collect by ${pickup.pickup_deadline}`, contactPerson: '', phone: '', releaseCode: '', locationNotes: pickup.pickup_area } } : {}),
      timeline: [{ title: 'Backend transaction status', description: x.status, timestamp: x.created_at, completed: true }], createdAt: x.created_at };
  }
  async getDeals(role?: UI.UserRole) {
    const org = useDemoStore.getState().currentOrg.id;
    return Promise.all((await this.all<C.DealResponse>('/deals')).filter(x => role === 'buyer' ? x.buyer_org_id === org : role === 'seller' ? x.seller_org_id === org : true).map(x => this.deal(x)));
  }
  async getDeal(id: string) { return this.deal(await this.get<C.DealResponse>(`/deals/${id}`),true); }
  async createCheckout(dealId: string): Promise<UI.CheckoutSession> {
    const x = await this.post<C.CheckoutResponse>(`/deals/${dealId}/checkout`);
    return { dealId: x.deal_id, dealReference: ref(x.deal_id), amountPayableMinor: x.amount_minor, paymentStatus: x.payment.status === 'SUCCEEDED' ? 'SIMULATED_PAID' : 'UNPAID', sessionExpiry: x.deal.payment_due_at };
  }
  async simulatePayment(dealId: string, outcome: 'SUCCESS' | 'FAILURE') {
    const x = await this.post<C.CheckoutResponse>(`/deals/${dealId}/checkout`);
    await this.post<C.CheckoutResponse>(`/payments/mock/${x.payment_id}/${outcome === 'SUCCESS' ? 'succeed' : 'fail'}`);
    return this.getDeal(dealId);
  }
  async confirmPickup(id: string) { await this.post<C.DealResponse>(`/deals/${id}/complete`); return this.getDeal(id); }
  async getDashboard(role: UI.UserRole): Promise<UI.DashboardSummary> {
    const [x,deals,offers] = await Promise.all([this.get<C.DashboardResponse>('/dashboard/summary'),this.getDeals(role),this.getOffers(role)]);
    return { role, metrics: { activeLots: x.seller.active_inventory_lots, unitsListed: x.seller.available_units,
      pendingOffers: role === 'seller' ? x.seller.incoming_offers : x.buyer.pending_offers, acceptedDeals: role === 'seller' ? x.seller.accepted_deals : x.buyer.accepted_deals,
      completedDealValueMinor: role === 'seller' ? x.seller.completed_wholesale_value_minor : x.buyer.total_simulated_purchase_value_minor,
      platformFeesMinor: x.seller.seller_fees_minor, sellerNetMinor: x.seller.net_simulated_proceeds_minor,
      platformRevenueMinor: x.platform_demo?.total_simulated_platform_revenue_minor,
      activeRequirements: x.buyer.active_requirements, matchingLots: x.buyer.compatible_opportunities_count }, recentDeals: deals.slice(0,5), recentOffers: offers.slice(0,5), chartData: [] };
  }
}
