# SurplusLink AI: frontend walkthrough and backend handoff

Based on the repository inspected on 18 October 2026. The supplied project overview is background context; the code is the source of truth for current behavior. No application code was changed for this guide.

## 1. What exists today

This is a React + TypeScript single-page app built by Vite. React Router selects pages, TanStack Query loads and caches marketplace data, Zustand remembers the selected demo organization, and Tailwind styles the UI. Recharts displays analytics.

The default data provider is `MockMarketplaceApi`. It acts like a backend, but runs inside the browser. It reads/writes lots, requirements, offers and deals under localStorage key `surpluslink_mock_db_v1`. Demo identity is stored separately as `surpluslink_demo_session`. Data is local to that browser/origin, not shared between users or devices.

The alternate `HttpMarketplaceApi` already maps the same service methods to HTTP endpoints. All pages call the shared `api` object. This is the integration boundary: implement that contract on the backend rather than rewriting the pages.

## 2. Follow one trade from start to finish

| Step | User action and page | Service calls | Backend responsibility |
| --- | --- | --- | --- |
| 1 | Seller adds surplus at `/seller/inventory/new` | Optional `parseSellerDescription(text)`, then `createLot(input)` | Extract draft fields if requested; validate confirmed form; save lot with owner, quantities and dates |
| 2 | Buyer browses `/marketplace` and `/marketplace/:lotId` | `getLots(filters)`, `getLot(id)` | Return public-safe listings and correct availability |
| 3 | Alternatively buyer describes demand at `/buyer/ai-sourcing` | `parseBuyerRequirement(text)` | Return extraction draft; nothing is saved yet |
| 4 | Buyer reviews fields and clicks Confirm & Find Matches | `createRequirement(input)`, then `getRequirementMatches(id)` | Persist requirement for current buyer; rank eligible lots and return reasons |
| 5 | Buyer opens a lot and submits quantity + unit price | `createOffer(input)` | Validate price, quantity, minimum order, listing state and expiry; compute fees; save PENDING offer; do not reserve stock yet |
| 6 | Seller opens `/seller/offers` | `getOffers('seller')`, `respondToOffer(id, input)` | Accept, reject, or counter. On acceptance atomically reserve stock and create one deal |
| 7 | If countered, buyer opens `/buyer/offers` and accepts | `getOffers('buyer')`, `respondToOffer(id, {action:'ACCEPT'})` | Use counter price AND counter quantity; create same kind of deal |
| 8 | Buyer opens `/buyer/deals/:id` | `getDeal(id)` | Return AWAITING_PAYMENT deal; omit private pickup details |
| 9 | Buyer simulates payment | `simulatePayment(id, {outcome})` via adapter method | SUCCESS: mark paid, unlock authorized pickup details. FAILURE: mark payment failed and allow retry |
| 10 | Buyer confirms physical handover | `confirmPickup(id)` | Require paid state; complete deal; release reserved quantity into sold quantity exactly once |
| 11 | Buyer/seller dashboard, seller analytics, admin overview | `getDashboard(role)` | Aggregate transactions visible to the authenticated organization/role |

The deal page currently calls payment simulation directly. Although `createCheckout` exists in both adapters, no page currently invokes it. Do not make checkout-session creation a required precondition without wiring that call into the page.

## 3. What happens when a button is clicked

1. A page collects form fields in React state and performs basic validation.
2. A TanStack Query mutation calls a method on `api`, e.g. `api.createOffer(...)`.
3. `src/services/api/index.ts` selects the mock or HTTP implementation at build/dev-server startup.
4. Mock mode runs browser TypeScript and persists localStorage. HTTP mode sends Axios requests and expects JSON in `response.data`.
5. On success, the page invalidates affected query keys so data reloads, shows a toast and sometimes navigates. On failure, it displays the normalized error.

Queries are considered fresh for 60 seconds, retry once, and do not refetch on window focus. There is no WebSocket or automatic cross-user live sync. The role switcher changes Zustand identity and navigates; it does not clear query caches. Organization-specific query keys or cache clearing on identity change are needed for reliable multi-organization sessions.

## 4. Exact HTTP endpoints already expected

Base URL defaults to `http://localhost:8000/api/v1`. Paths below are relative to that prefix. Lists must return JSON arrays directly; object endpoints return the object directly. The adapter does not unwrap `{data: ...}` or `{items: ...}` envelopes.

| Method | Path | Request | Response TypeScript type |
| --- | --- | --- | --- |
| GET | `/lots` | Query: `LotFilters` | `Lot[]` |
| GET | `/lots/{id}` | — | `Lot` |
| POST | `/lots` | `CreateLotInput` | `Lot` |
| PATCH | `/lots/{id}/status` | `{status}` | `Lot` |
| POST | `/ai/parse-lot` | `{text}` | `LotExtraction` |
| POST | `/ai/parse-requirement` | `{text}` | `RequirementExtraction` |
| GET | `/requirements` | — | `BuyerRequirement[]` |
| GET | `/requirements/{id}` | — | `BuyerRequirement` |
| POST | `/requirements` | `CreateRequirementInput` | `BuyerRequirement` |
| DELETE | `/requirements/{id}` | — | No response body required |
| GET | `/requirements/{id}/matches` | — | `MatchResult[]` |
| GET | `/offers` | Query: optional `role` | `Offer[]` |
| GET | `/offers/{id}` | — | `Offer` |
| POST | `/offers` | `CreateOfferInput` | `Offer` |
| POST | `/offers/{id}/respond` | `OfferResponseInput` | `Offer` (including `dealId` after acceptance) |
| GET | `/deals` | Query: optional `role` | `Deal[]` |
| GET | `/deals/{id}` | — | `Deal` |
| POST | `/deals/{id}/checkout` | Empty | `CheckoutSession` (currently unused by pages) |
| POST | `/deals/{id}/simulate-payment` | `{outcome:'SUCCESS'}` or `{outcome:'FAILURE'}` | `Deal` |
| POST | `/deals/{id}/confirm-pickup` | Empty | `Deal` |
| GET | `/dashboard` | Query: `role=buyer`, `seller`, or `admin` | `DashboardSummary` |

Use `src/types/index.ts` for every field, optional/null distinction and enum. Most domain JSON uses camelCase, while AI extraction responses intentionally use snake_case. Return dates as ISO date/time strings and money as integer paisa. Categories: `BISCUITS`, `RUSKS`, `COOKIES`, `CRACKERS`, `PACKAGED_BREAD`. Roles are lowercase. Status enum values are uppercase.

Lot filters: `category`, `city`, `minPriceMinor`, `maxPriceMinor`, `minQuantity`, `minShelfLifeDays`, `packagingType`, `verifiedOnly`, `status`, `search`, `sortBy`. Handle `ALL` as no restriction. Sort options: `expiry_soon`, `price_asc`, `price_desc`, `qty_desc`, `newest`. The mock currently does not implement `minShelfLifeDays` or `packagingType` filtering even though the contract defines them.

Return readable errors such as HTTP 409 with `{"message":"Insufficient inventory"}`. The adapter also supports a string `detail`. FastAPI validation error arrays need frontend normalization or a backend handler returning a readable string. Axios timeout is 15 seconds, including AI calls.

### Buyer AI extraction response example

```json
{
  "category": "BISCUITS",
  "required_quantity": 150,
  "max_total_budget_minor": 2000000,
  "min_remaining_shelf_life_days": 30,
  "city": "Lahore",
  "preferred_area": null,
  "needs_review": false,
  "missing_fields": []
}
```

### Offer request example

```json
{
  "lotId": "lot-001",
  "requestedQuantity": 150,
  "offeredUnitPriceMinor": 10800,
  "pickupPreference": "Self-collection via buyer vehicle",
  "expiresInDays": 3
}
```

This means 150 units at Rs.108, not Rs.10,800. The backend derives the buyer from the authenticated session; the request contains no buyer ID.

### Seller response examples

```json
{"action":"ACCEPT"}
```

```json
{"action":"COUNTER","counterUnitPriceMinor":11000,"counterQuantity":120,"counterNote":"120 units available at this rate"}
```

### Match result shape

```text
{
  lot: <public-safe Lot object>,
  compatibilityScore: 95,
  matchReasons: ["Exact product category match", "Sufficient stock"],
  budgetCompatibility: "UNDER_BUDGET" | "WITHIN_BUDGET" | "OVER_BUDGET",
  estimatedTotalMinor: <integer>,
  quantityMatch: "EXACT" | "SURPLUS_AVAILABLE" | "PARTIAL",
  shelfLifeCompatibilityDays: <integer>
}
```

## 5. State transitions and stock rules

```text
Offer: PENDING -> ACCEPTED -> one Deal
              -> REJECTED
              -> COUNTERED -> buyer ACCEPTS -> one Deal

Deal: AWAITING_PAYMENT -> PAID_AWAITING_PICKUP -> COMPLETED
Payment: UNPAID -> SIMULATED_PAID
               -> PAYMENT_FAILED -> retry -> SIMULATED_PAID
Pickup: PENDING_PAYMENT -> READY_FOR_PICKUP -> COLLECTED
```

Additional statuses exist in the types (`WITHDRAWN`, `EXPIRED`, `CANCELLED`), but the adapter has no separate withdrawal/cancellation endpoint. Offer expiry timestamps exist; the mock response handler does not enforce elapsed expiry automatically. Backend should enforce expiry and define reservation release on cancellation/timeout.

Stock example for a 200-unit lot and accepted 150-unit deal:

| Moment | availableQuantity | reservedQuantity | sold (derived) |
| --- | ---: | ---: | ---: |
| Published | 200 | 0 | 0 |
| Offer submitted | 200 | 0 | 0 |
| Offer accepted | 50 | 150 | 0 |
| Payment successful | 50 | 150 | 0 |
| Handover completed | 50 | 0 | 150 |

Keep `totalQuantity` as the original listed quantity. Accepting an offer must lock/check inventory, reserve the accepted quantity, update the offer and insert its deal in one database transaction. Make `deals.offer_id` unique and ensure payment and pickup retries do not repeat financial/stock updates.

Important mock defect: acceptance checks/reserves `offer.requestedQuantity` before calculating the counter quantity. Backend must first select the effective quantity and price, then validate/reserve that same quantity. Repeated mock pickup confirmation can also deduct reserves again; backend must make completion idempotent.

## 6. Fees: keep backend authoritative

For 150 units at Rs.108:

| Field | Paisa | Display |
| --- | ---: | ---: |
| subtotalMinor | 1620000 | Rs.16,200 |
| buyerServiceFeeMinor | 32400 | Rs.324 |
| buyerTotalMinor | 1652400 | Rs.16,524 |
| sellerCommissionMinor | 32400 | Rs.324 |
| sellerNetProceedsMinor | 1587600 | Rs.15,876 |
| platformGrossRevenueMinor | 64800 | Rs.648 |

Buyer and seller each pay 2% of subtotal. Round each fee to the nearest paisa using the positive-value equivalent of JavaScript `Math.round`; Python's default `round` differs at half values. For nonnegative integer subtotal, `(subtotalMinor * 2 + 50) // 100` reproduces this rounding. Compute totals on the server; frontend FeeBreakdown is only a preview. No real money, escrow transfer or settlement occurs in the current demo.

## 7. AI and matching: what to implement

`src/services/mock/aiParser.ts` is deterministic text parsing, not an LLM call. HTTP mode expects extraction from your backend. Keep the review form so users can correct missing/uncertain values before persistence. API keys belong on the backend.

`src/services/mock/matcher.ts` is a ranking reference:

- Only ACTIVE/PARTIALLY_SOLD lots with the same category enter results.
- Category +40; enough stock +25 (at least 60% stock +15); minimum order too large -20.
- Enough shelf life +20, otherwise -15.
- Estimated subtotal at most 85% of budget +15; within budget +10.
- Same city +10; preferred area match +5; final score clamped to 10–99.
- Sort descending by score. City, shelf life and budget are soft ranking factors, not strict exclusions.

Current estimated totals exclude the buyer fee, use the smaller of requested and available quantity, and assume Rs.110/unit when asking price is null. Decide explicitly if your backend retains those demo conventions. Never use the confidential reserve price in buyer-facing match explanations.

## 8. Identity and privacy gaps to resolve at integration

The current login page and role switcher select seeded organizations. They do not authenticate. HTTP requests send no JWT, organization header or configured cross-origin credentials. Simply switching the environment provider will not identify the buyer/seller to the backend.

Agree on authentication with the backend developer first. For a real integration, add login/session handling and an Axios Authorization interceptor (or a deliberately configured cookie session), then enforce identity and permissions on the server. A query such as `role=admin` is a requested view, never proof of authorization. A trusted demo identity mechanism can be used only for a clearly isolated demo environment and still requires frontend/backend wiring.

Backend authorization must scope offers, deals, requirements and dashboards by the authenticated organization; verify lot ownership on seller mutations and enforce which party may accept/counter/reject. Workspace routes currently have no authentication guard.

The mock strips `reserveUnitPriceMinor` from lot responses except for the owning seller. It still includes `sellerName`, and all seeded organizations/private addresses and mock database data reside in the client. Hiding a seller name in the UI is not confidentiality. In backend responses, omit or safely alias confidential seller identity, omit reserve prices from ALL buyer-visible locations (including nested match/dashboard objects), and omit private pickup fields until the authorized paid state. Use server response models suited to the viewer.

## 9. Suggested database model

This is a suggested backend design, not an existing database schema:

- users and organizations/memberships: identity, role, organization ownership and contacts.
- lots: owner, category, prices, available/reserved/original quantities, expiry, public pickup region, status and image URLs.
- requirements: owner and structured procurement constraints.
- offers and offer_history: parties, lot, proposed/counter terms, expiry, status and audit trail.
- deals and deal_timeline: accepted terms, financial snapshot and payment/pickup states; unique offer reference.
- payment_sessions/payment_events: demo outcomes now; verified provider events if real payments are added later.
- private pickup data: restricted warehouse/contact/release details associated with the authorized deal.

Return the frontend's nested API shapes even if the database uses normalized tables and snake_case columns. Image upload has no endpoint/UI in the current contract; the new-inventory form currently sends a fixed image URL.

## 10. Connect the backend

Once endpoints and identity wiring exist, set project `.env.local`:

```dotenv
VITE_DATA_PROVIDER=http
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Restart `npm run dev`. Vite environment variables are injected at startup/build time. Configure backend CORS for the actual frontend origin (commonly `http://localhost:5173`) and needed methods/headers. For a hosted demo, use a reachable backend URL rather than localhost and rebuild the frontend. Serve frontend route fallbacks to index.html so refreshing `/buyer/deals/...` works.

Open browser Network tools: calls should go to `/api/v1/...`, response bodies should match `src/types/index.ts`, and new data should persist in the server database. Existing mock localStorage is not migrated to the backend. Seed the server with a seller, buyer and one usable lot.

## 11. Suggested 4–5 hour integration sequence

This is a suggested allocation, not a delivery guarantee. Prioritize one complete persisted trade.

| Time | Deliverable |
| --- | --- |
| 0–30 min | Agree identity transport, exact JSON contracts and seed organizations; confirm frontend can call backend |
| 30–90 min | Implement lots/list/detail/create and offers/list/create/respond with atomic reservation + deal creation |
| 90–150 min | Implement deals/list/detail, simulated payment, private pickup gating, idempotent completion |
| 150–200 min | Implement requirement create/list/detail/matches and extraction; deterministic extraction can support a clearly labeled demo |
| 200–240 min | Dashboard aggregation, HTTP switch, error responses, cache/identity wiring and end-to-end test |
| Remaining time | Deployment, a fresh-browser rehearsal, failure-path checks and submission recording |

If time is very tight, get browse -> offer -> accept -> pay -> pickup working first. Keep payment simulation clearly labeled. Preserve mock mode as the existing demo path while integrating the backend; do not assume mock tests prove backend correctness.

## 12. Rehearsal and verification

1. Seller publishes a fresh BISCUITS lot with at least 200 units and minimum purchase at most 150.
2. Buyer browses it, or runs AI sourcing for 150 biscuit units in Lahore.
3. Buyer submits 150 units at Rs.108. Check subtotal Rs.16,200 and checkout Rs.16,524.
4. Seller accepts. Verify one deal and a 150-unit reservation in the backend.
5. Buyer opens deal. Network response must not contain private pickup data before payment.
6. Simulate failure, retry success; verify ready-for-pickup and authorized private details.
7. Confirm handover; refresh and verify persisted completion and correct stock.
8. Retry acceptance/payment/completion and try another organization's IDs: no duplicate deal, stock changes or unauthorized access.
9. Test a counteroffer with a different quantity (e.g. 120) and verify exactly 120 units are reserved/completed.
10. Check seller/admin reports using real completed-deal aggregates. Mock charts currently include fixed sample historical points and fallback values.

Frontend checks: `npm test` and `npm run build`. Existing tests exercise mock behavior and selected rules, not deployed HTTP endpoint integration.

## 13. Files to share with the backend developer

| File | Why it matters |
| --- | --- |
| `src/types/index.ts` | Exact request/response fields, enums, money units |
| `src/services/http/httpMarketplaceApi.ts` | Exact paths, methods, query params, base URL and error behavior |
| `src/services/api/marketplaceApi.ts` | Full service method contract |
| `src/services/api/index.ts` | Provider switch |
| `src/services/mock/mockMarketplaceApi.ts` | Existing workflow reference; apply the corrections above |
| `src/services/mock/aiParser.ts` | Demo extraction reference |
| `src/services/mock/matcher.ts` | Ranking reference |
| `src/lib/money.ts` | Fee and currency conventions |
| `src/store/useDemoStore.ts` | Current seeded identity model |
| `src/test/workflow.test.ts` | Existing complete mock trade test |

