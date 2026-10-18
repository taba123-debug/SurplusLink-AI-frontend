import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { WorkspaceLayout } from './layouts/WorkspaceLayout';
import { LandingPage } from '@/features/landing/pages/LandingPage';
import { HowItWorksPage } from '@/features/landing/pages/HowItWorksPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { MarketplacePage } from '@/features/marketplace/pages/MarketplacePage';
import { LotDetailPage } from '@/features/marketplace/pages/LotDetailPage';
import { AISourcingPage } from '@/features/ai-sourcing/pages/AISourcingPage';
import { BuyerRequirementsPage } from '@/features/requirements/pages/BuyerRequirementsPage';
import { RequirementMatchesPage } from '@/features/requirements/pages/RequirementMatchesPage';
import { BuyerOffersPage } from '@/features/offers/pages/BuyerOffersPage';
import { SellerOffersPage } from '@/features/offers/pages/SellerOffersPage';
import { BuyerDealsPage } from '@/features/deals/pages/BuyerDealsPage';
import { SellerDealsPage } from '@/features/deals/pages/SellerDealsPage';
import { DealDetailPage } from '@/features/deals/pages/DealDetailPage';
import { SellerInventoryPage } from '@/features/inventory/pages/SellerInventoryPage';
import { NewInventoryPage } from '@/features/inventory/pages/NewInventoryPage';
import { SellerDashboardPage } from '@/features/dashboard/pages/SellerDashboardPage';
import { BuyerDashboardPage } from '@/features/dashboard/pages/BuyerDashboardPage';
import { SellerAnalyticsPage } from '@/features/analytics/pages/SellerAnalyticsPage';
import { AdminOverviewPage } from '@/features/admin/pages/AdminOverviewPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const router = createBrowserRouter([
  // Public Root Layout Routes
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'marketplace', element: <MarketplacePage /> },
      { path: 'marketplace/:lotId', element: <LotDetailPage /> },
      { path: 'how-it-works', element: <HowItWorksPage /> },
      { path: 'login', element: <LoginPage /> },
    ],
  },

  // Buyer Workspace Routes
  {
    path: '/buyer',
    element: <WorkspaceLayout />,
    children: [
      { index: true, element: <Navigate to="/buyer/dashboard" replace /> },
      { path: 'dashboard', element: <BuyerDashboardPage /> },
      { path: 'ai-sourcing', element: <AISourcingPage /> },
      { path: 'requirements', element: <BuyerRequirementsPage /> },
      { path: 'requirements/:id/matches', element: <RequirementMatchesPage /> },
      { path: 'offers', element: <BuyerOffersPage /> },
      { path: 'deals', element: <BuyerDealsPage /> },
      { path: 'deals/:id', element: <DealDetailPage /> },
    ],
  },

  // Seller Workspace Routes
  {
    path: '/seller',
    element: <WorkspaceLayout />,
    children: [
      { index: true, element: <Navigate to="/seller/dashboard" replace /> },
      { path: 'dashboard', element: <SellerDashboardPage /> },
      { path: 'inventory', element: <SellerInventoryPage /> },
      { path: 'inventory/new', element: <NewInventoryPage /> },
      { path: 'inventory/:lotId', element: <LotDetailPage /> },
      { path: 'offers', element: <SellerOffersPage /> },
      { path: 'deals', element: <SellerDealsPage /> },
      { path: 'deals/:id', element: <DealDetailPage /> },
      { path: 'analytics', element: <SellerAnalyticsPage /> },
    ],
  },

  // Admin Workspace Routes
  {
    path: '/admin',
    element: <WorkspaceLayout />,
    children: [
      { index: true, element: <Navigate to="/admin/overview" replace /> },
      { path: 'overview', element: <AdminOverviewPage /> },
    ],
  },

  // Catch-all 404 Route
  {
    path: '*',
    element: <RootLayout />,
    children: [
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
