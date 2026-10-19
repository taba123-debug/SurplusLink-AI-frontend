import { MockMarketplaceApi } from '../mock/mockMarketplaceApi';
import { HttpMarketplaceApi } from '../http/httpMarketplaceApi';
import type { MarketplaceApi } from './marketplaceApi';

const provider = import.meta.env.VITE_DATA_PROVIDER || 'http';

export const api: MarketplaceApi =
  provider === 'mock' ? new MockMarketplaceApi() : new HttpMarketplaceApi();

export * from './marketplaceApi';
