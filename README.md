# SurplusLink AI — B2B Surplus Inventory Trading Platform

SurplusLink AI is a confidential, AI-assisted B2B marketplace engineered for the commercial bakery and packaged food wholesale ecosystem in Pakistan. It matches manufacturers with excess or overrun stock (such as biscuits, rusks, cookies, crackers, and packaged bread) directly with retail grocery networks, wholesalers, and convenience chains at negotiated wholesale prices.

---

## 🌟 Key Product Capabilities

1. **Dual AI Extraction Pipelines:**
   - **Buyer AI Sourcing:** Retailers describe procurement needs in natural language (e.g., *"I need 150 sealed biscuit packs under Rs. 20,000 in Lahore, with at least 30 days of shelf life remaining"*). SurplusLink AI parses category, quantity, budget, and shelf-life constraints into verifiable structured profiles.
   - **Seller Inventory Intake:** Suppliers input production overrun notes (e.g., *"Have 200 sealed biscuit packs in Gulberg, minimum Rs. 110 each, expiry in 45 days"*). AI auto-populates batch quantities, packaging specifications, and logistics details.

2. **Confidential Supplier Shield:**
   - Supplier identities and private reserve prices remain strictly confidential during marketplace browsing to protect primary retail price channels.
   - Verified warehouse loading dock coordinates and security release codes (OTPs) unlock exclusively upon deal acceptance and simulated escrow payment confirmation.

3. **Two-Way Compatibility Engine:**
   - Multi-factor algorithm ranking batches by quantity fulfillment, budget compliance, proximity, and remaining shelf life.

4. **Transparent 2% + 2% Platform Economics:**
   - Buyer service fee: 2% of accepted deal subtotal.
   - Seller success commission: 2% of accepted deal subtotal.
   - Derived using exact integer minor unit arithmetic (PKR paisa: 1 PKR = 100 minor units). Zero hidden fees.

5. **Complete Lifecycle Demo Simulation:**
   - End-to-end state transitions: `Listing` ➔ `Matching` ➔ `Offer` ➔ `Counter / Acceptance` ➔ `Deal Lock` ➔ `Simulated Escrow Payment` ➔ `Private Pickup Release Code` ➔ `Handover Settlement` ➔ `Commission Ledger`.

---

## 🛠️ Technology Stack

- **Framework:** React 19 with Vite 8
- **Language:** TypeScript with strict type checking
- **Styling:** Tailwind CSS v4 design token architecture
- **State & Storage:** Zustand with persistent demo session storage
- **Data Fetching:** TanStack Query (React Query)
- **Routing:** React Router v7
- **HTTP & Mock API:** Axios adapter alongside deterministic `MockMarketplaceApi`
- **Charts:** Recharts for financial volume and commission deduction graphs
- **Forms & Validation:** React Hook Form and Zod
- **Date Handling:** `date-fns` for relative shelf-life and expiry calculations
- **Notifications:** Sonner rich toast notifications
- **Testing:** Vitest and Testing Library

---

## 🚀 Quickstart & Installation

### Prerequisites
- Node.js (v18+ or v20+ recommended)
- npm or pnpm / yarn

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/taba123-debug/SurplusLink-AI-frontend.git
cd SurplusLink-AI-frontend
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Default configuration:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_DATA_PROVIDER=mock
```

- When `VITE_DATA_PROVIDER=mock`: Operates entirely self-contained with persistent local storage, seed fixtures, and simulated network latency.
- When `VITE_DATA_PROVIDER=http`: Directs all requests to the FastAPI backend service via Axios.

### 3. Run the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Run the Test Suite
```bash
npm test
```
Executes 15 comprehensive automated tests covering money economics, matching algorithms, offer transitions, duplicate prevention, private logistics security, and end-to-end workflows.

### 5. Build for Production
```bash
npm run build
```

---

## 👥 Demo Accounts & Roles

SurplusLink AI includes a **Demo Role Switcher** in the top navigation bar, allowing immediate switching between verified Pakistani organizations:

| Organization | Role | Type | City / Area | Focus |
|---|---|---|---|---|
| **Punjab Biscuits Ltd** | Seller | Tier-1 Manufacturer | Gulberg, Lahore | Export overruns & tea biscuit master cartons |
| **Mehran Confectionery Works** | Seller | Commercial Producer | Township, Lahore | Nitrogen-flushed crispy rusks & cake rusks |
| **Indus Premium Bakers** | Seller | Wholesale Supplier | Quaid-e-Azam Estate, Lahore | Sesame butter crackers & packaged cookies |
| **City Mart Superstores** | Buyer | Retail Grocery Chain | Johar Town, Lahore | Multi-branch retailer purchasing packaged lots |
| **Lahore Corner Marts** | Buyer | Convenience Chain | Model Town, Lahore | Neighborhood retail stores seeking rusks |
| **Al-Madina Wholesale Depot** | Buyer | Wholesale Re-distributor | Badami Bagh, Lahore | Bulk regional distributor |
| **DHA Express Grocery** | Buyer | Premium Supermarket | DHA Phase 5, Lahore | High-end cookies and Danish bakery tins |
| **SurplusLink AI Operations** | Admin | Platform Operator | Lahore HQ | Network governance, stats, and commission ledger |

---

## 🔄 End-to-End Walkthrough Demonstration

To experience the entire vertical slice of SurplusLink AI:

1. **Step 1: Open the Application**
   - Navigate to `/` (Landing Page) to review platform metrics, how it works, and featured lots.
2. **Step 2: Enter as a Buyer**
   - Click the top right **Role Switcher** and select **City Mart Superstores (Buyer)**.
3. **Step 3: AI Sourcing**
   - Go to **AI Sourcing** (`/buyer/ai-sourcing`).
   - Click the sample chip: *"I need 150 sealed biscuit packs under Rs. 20,000 in Lahore, with at least 30 days of shelf life remaining."*
   - Click **Extract & Find Matching Stock**.
4. **Step 4: Verify Structured Output**
   - Review extracted category (`BISCUITS`), quantity (`150`), budget (`Rs. 20,000`), and shelf life (`30 days`).
   - Click **Confirm & Find Matches**.
5. **Step 5: View Compatible Lot & Make an Offer**
   - Review ranked matches with compatibility scores (e.g. 85%+).
   - Click **View Lot** on *"Sealed Tea Biscuit Packs"*.
   - Click **Make Wholesale Offer** and propose 150 units at **Rs. 108/unit**.
   - Note the transparent 2% buyer service fee preview. Click **Submit Wholesale Offer**.
6. **Step 6: Switch to Seller**
   - Open the **Role Switcher** and select **Punjab Biscuits Ltd (Seller)**.
   - Navigate to **Incoming Offers** (`/seller/offers`).
   - Review City Mart's offer for 150 cartons at Rs. 108.
   - Click **Accept**. Stock is automatically reserved, and a locked deal is generated!
7. **Step 7: Switch back to Buyer for Simulated Checkout**
   - Open the **Role Switcher** and select **City Mart Superstores (Buyer)**.
   - Navigate to **Deals & Pickup** (`/buyer/deals`).
   - Click **Simulate Checkout** on the accepted deal.
   - Notice the private pickup authorization is locked.
   - Click **Simulate Successful Payment**.
8. **Step 8: Authorized Pickup Unlocked**
   - The private warehouse loading dock coordinates unlock with **Gate 2 instructions**, dispatch manager phone number, and secure **release OTP (e.g. `SL-OTP-8819`)**.
9. **Step 9: Confirm Physical Handover**
   - Click **Confirm Physical Handover & Finalize Deal**.
   - The deal transitions to `COMPLETED & SETTLED`.
10. **Step 10: Review Platform Commission**
    - Switch to **Seller Workspace** ➔ **Analytics & Reporting** (`/seller/analytics`) to view completed volume and the 2% commission recorded on the chart.
    - Switch to **Admin View** (`/admin/overview`) to view platform gross revenue ledger.

---

## 🔌 Backend Integration Contract (FastAPI)

When connecting to the future FastAPI backend:
1. Set `VITE_DATA_PROVIDER=http` and `VITE_API_BASE_URL=http://localhost:8000/api/v1` in `.env`.
2. The `HttpMarketplaceApi` implements the exact same TypeScript `MarketplaceApi` interface:
   - `POST /lots` & `GET /lots`
   - `POST /ai/parse-requirement` (returns `{ category, required_quantity, max_total_budget_minor, ... }`)
   - `POST /ai/parse-lot` (returns `{ title, category, total_quantity, asking_unit_price_minor, ... }`)
   - `POST /requirements` & `GET /requirements/{id}/matches`
   - `POST /offers` & `POST /offers/{id}/respond`
   - `GET /deals` & `POST /deals/{id}/simulate-payment`
   - `POST /deals/{id}/confirm-pickup`

All monetary fields use **integer minor units** (paisa: 1 PKR = 100 minor units).
