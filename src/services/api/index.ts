import { MockMarketplaceApi } from '../mock/mockMarketplaceApi';
import { HttpMarketplaceApi } from '../http/httpMarketplaceApi';
import type { MarketplaceApi } from './marketplaceApi';

const provider = import.meta.env.VITE_DATA_PROVIDER || 'mock';

export const api: MarketplaceApi =
  provider === 'http' ? new HttpMarketplaceApi() : new MockMarketplaceApi();

export * from './marketplaceApi';
