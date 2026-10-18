import axios, { AxiosError, type AxiosInstance } from 'axios';
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

export class HttpMarketplaceApi implements MarketplaceApi {
  private client: AxiosInstance;

  constructor(baseURL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<{ message?: string; detail?: string }>) => {
        const message =
          error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message ||
          'An unexpected API error occurred.';

        const status = error.response?.status;
        const normalized = new Error(message);
        (normalized as unknown as { status: number | undefined }).status = status;
        return Promise.reject(normalized);
      }
    );
  }

  async getLots(filters?: LotFilters): Promise<Lot[]> {
    const { data } = await this.client.get<Lot[]>('/lots', { params: filters });
    return data;
  }

  async getLot(id: string): Promise<Lot> {
    const { data } = await this.client.get<Lot>(`/lots/${id}`);
    return data;
  }

  async createLot(input: CreateLotInput): Promise<Lot> {
    const { data } = await this.client.post<Lot>('/lots', input);
    return data;
  }

  async updateLotStatus(id: string, status: LotStatus): Promise<Lot> {
    const { data } = await this.client.patch<Lot>(`/lots/${id}/status`, { status });
    return data;
  }

  async parseSellerDescription(text: string): Promise<LotExtraction> {
    const { data } = await this.client.post<LotExtraction>('/ai/parse-lot', { text });
    return data;
  }

  async parseBuyerRequirement(text: string): Promise<RequirementExtraction> {
    const { data } = await this.client.post<RequirementExtraction>('/ai/parse-requirement', { text });
    return data;
  }

  async getRequirements(): Promise<BuyerRequirement[]> {
    const { data } = await this.client.get<BuyerRequirement[]>('/requirements');
    return data;
  }

  async getRequirement(id: string): Promise<BuyerRequirement> {
    const { data } = await this.client.get<BuyerRequirement>(`/requirements/${id}`);
    return data;
  }

  async createRequirement(input: CreateRequirementInput): Promise<BuyerRequirement> {
    const { data } = await this.client.post<BuyerRequirement>('/requirements', input);
    return data;
  }

  async deleteRequirement(id: string): Promise<void> {
    await this.client.delete(`/requirements/${id}`);
  }

  async getRequirementMatches(id: string): Promise<MatchResult[]> {
    const { data } = await this.client.get<MatchResult[]>(`/requirements/${id}/matches`);
    return data;
  }

  async getOffers(role?: UserRole): Promise<Offer[]> {
    const { data } = await this.client.get<Offer[]>('/offers', { params: { role } });
    return data;
  }

  async getOffer(id: string): Promise<Offer> {
    const { data } = await this.client.get<Offer>(`/offers/${id}`);
    return data;
  }

  async createOffer(input: CreateOfferInput): Promise<Offer> {
    const { data } = await this.client.post<Offer>('/offers', input);
    return data;
  }

  async respondToOffer(id: string, input: OfferResponseInput): Promise<Offer> {
    const { data } = await this.client.post<Offer>(`/offers/${id}/respond`, input);
    return data;
  }

  async getDeals(role?: UserRole): Promise<Deal[]> {
    const { data } = await this.client.get<Deal[]>('/deals', { params: { role } });
    return data;
  }

  async getDeal(id: string): Promise<Deal> {
    const { data } = await this.client.get<Deal>(`/deals/${id}`);
    return data;
  }

  async createCheckout(dealId: string): Promise<CheckoutSession> {
    const { data } = await this.client.post<CheckoutSession>(`/deals/${dealId}/checkout`);
    return data;
  }

  async simulatePayment(dealId: string, outcome: 'SUCCESS' | 'FAILURE'): Promise<Deal> {
    const { data } = await this.client.post<Deal>(`/deals/${dealId}/simulate-payment`, { outcome });
    return data;
  }

  async confirmPickup(dealId: string): Promise<Deal> {
    const { data } = await this.client.post<Deal>(`/deals/${dealId}/confirm-pickup`);
    return data;
  }

  async getDashboard(role: 'buyer' | 'seller' | 'admin'): Promise<DashboardSummary> {
    const { data } = await this.client.get<DashboardSummary>('/dashboard', { params: { role } });
    return data;
  }
}
