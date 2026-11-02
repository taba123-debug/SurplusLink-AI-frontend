import type { LotFilters, UserRole } from '@/types';

export const queryKeys = {
  lots: {
    all: ['lots'] as const,
    list: (filters: LotFilters, organizationId?: string) =>
      ['lots', 'list', organizationId ?? 'public', filters] as const,
    detail: (id: string) => ['lots', 'detail', id] as const,
    own: (organizationId: string) => ['lots', 'own', organizationId] as const,
  },
  requirements: {
    all: ['requirements'] as const,
    list: (organizationId: string) => ['requirements', 'list', organizationId] as const,
    detail: (id: string) => ['requirements', 'detail', id] as const,
    matches: (id: string) => ['requirements', 'matches', id] as const,
  },
  offers: {
    all: ['offers'] as const,
    list: (role: UserRole, organizationId: string) => ['offers', 'list', role, organizationId] as const,
    detail: (id: string) => ['offers', 'detail', id] as const,
  },
  deals: {
    all: ['deals'] as const,
    list: (role: UserRole, organizationId: string) => ['deals', 'list', role, organizationId] as const,
    detail: (id: string) => ['deals', 'detail', id] as const,
  },
  dashboard: (role: UserRole, organizationId: string) => ['dashboard', role, organizationId] as const,
};
