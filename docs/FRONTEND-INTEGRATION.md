# Frontend integration and demonstration

The frontend uses the local FastAPI backend by default. The existing React routes, Tailwind styles and UI components are retained. The OpenAPI snapshot is saved in `openapi.json`; generated transport types are in `src/services/http/contracts.ts`. Regenerate them with `node scripts/generate-api-types.mjs` after replacing the snapshot with a new backend contract.

## Start

Keep FastAPI and its seeded PostgreSQL database running at `http://localhost:8000`. In the frontend directory:

```powershell
npm install # only required if dependencies are missing
npm run dev -- --port 5173 --strictPort
```

Open `http://localhost:5173/login`. The configured values in `.env` and `.env.example` are:

```dotenv
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_DATA_PROVIDER=http
```

Only public frontend configuration belongs in Vite environment variables. AI provider credentials remain in the backend. The supported identity headers are `X-Demo-Org-ID` and `X-Demo-User-ID`, populated from the backend's demo identity endpoints. These are fictional development memberships, not production authentication. Switching identity remounts the query provider and all screen state so cached seller data is not reused by a buyer.

## Connected pages

| Screen | Behavior |
| --- | --- |
| Login and top-bar identity switcher | Load seeded businesses and supported user memberships from FastAPI |
| Buyer/seller dashboards | Fetch current summary metrics and recent authorized offers/deals |
| Seller inventory | Fetch private owned inventory; publish/resume or pause listings |
| New seller inventory | Live AI extraction, editable confirmation, private address and reserve price, draft save |
| Marketplace and lot detail | Public eligible inventory, client-side filters and sort, quantity/expiry checks |
| Buyer AI sourcing | Live extraction, review/edit fields, explicit manual entry, requirement save and matching |
| Saved requirements and matches | Current buyer's active requirements, pause action, DIRECT/NEGOTIABLE matches |
| Buyer/seller offers | Submitted/incoming offers, current status, seller acceptance/rejection and generated deal link |
| Buyer/seller deals and detail | Authorized transactions, backend quantity/prices/fees/totals/status, simulated checkout and pickup |
| Seller analytics | Backend summary metrics and authorized platform aggregate; unavailable historical charts are labeled |

## APIs consumed

All paths below are relative to `/api/v1`. GET list calls page through the backend's supported `limit`/`offset` parameters.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/demo/identities`, `/demo/organizations` | Supported fictional organizations/users |
| GET | `/lots`, `/lots/{id}` | Public eligible inventory |
| GET | `/lots/mine` | Authorized seller inventory and reserve fields |
| POST | `/lots` | Create DRAFT inventory with confirmed data |
| POST | `/lots/{id}/publish`, `/lots/{id}/pause` | Publish/resume and pause |
| POST | `/ai/parse-lot`, `/ai/parse-requirement` | Real extraction; paired Karachi reference date/timezone |
| GET, POST | `/requirements` | List public active requirements (filtered for buyer) / save confirmed requirement |
| GET | `/requirements/{id}`, `/requirements/{id}/matches` | Requirement detail and server-generated matches |
| POST | `/requirements/{id}/pause` | Pause a saved requirement; no invented DELETE endpoint |
| POST | `/lots/{id}/offers` | Submit quantity, price and optional matched requirement ID |
| GET | `/offers`, `/offers/{id}` | Authorized offers and status |
| POST | `/offers/{id}/respond` | ACCEPT/REJECT; consume returned offer/deal |
| GET | `/deals`, `/deals/{id}` | Authorized deals and financial snapshots |
| POST | `/deals/{id}/checkout` | Create/reuse mock checkout payment |
| GET | `/deals/{id}/payment` | Actual current simulated payment state |
| POST | `/payments/mock/{id}/succeed`, `/payments/mock/{id}/fail` | Simulate payment result |
| GET | `/deals/{id}/pickup-details` | Backend-authorized paid pickup information |
| POST | `/deals/{id}/complete` | Seller confirms collection and inventory settlement |
| GET | `/dashboard/summary` | Current organization metrics; platform total only when returned |

## Complete demonstration

1. Select **Gulberg Packaged Foods (fictional demo)**. Open `/seller/inventory/new`.
2. Try: `Have 200 sealed biscuit packs in Gulberg, Lahore, asking Rs. 140 per pack, minimum Rs. 110, expiry in 45 days.` Click **Extract Fields to Form**. If live AI succeeds, inspect every extracted field. If it fails, keep the visible error and select **Enter Manually**; describe this as manual entry, not real inference.
3. Confirm title, biscuits, 200 packs, asking Rs. 140, reserve Rs. 110, minimum order 10 or 25, packaging `sealed`, storage `ambient`, shelf life 45 days, Lahore, Gulberg. Enter a fictional private pickup address. Keep reserve price and address out of the public description. Check both attestations. Click **Save Inventory Draft**.
4. In My Inventory, click **Publish / Resume** on the new draft. The listing becomes ACTIVE. Retain its title/reference for the buyer step.
5. Switch to **Johar Town Mini Mart (fictional demo)**. Open `/buyer/ai-sourcing`. Enter: `Need 150 sealed biscuit packs under Rs. 20,000 in Lahore, minimum 30 days remaining.` Click **Extract & Find Matching Stock**.
6. On successful real extraction, review quantity 150, category biscuits, unit pack, budget Rs. 20,000, minimum shelf life 30 days and Lahore. If the provider is unavailable, select **Enter requirement manually** and explicitly confirm those same fictional values. Click **Confirm & Find Matches**.
7. Find the new seller listing. At Rs. 140 asking price it is a **NEGOTIABLE** match. Open **View Lot** from this match so the requirement ID and quantity carry into the offer form. Enter Rs. 120 per pack for 150 packs and submit.
8. Switch to Gulberg. Open `/seller/offers`, identify the new proposal and click **Accept**. The backend creates the deal and reserves 150 packs; available inventory becomes 50. Declining an alternative offer uses **Reject**.
9. Switch to Johar Town. Open `/buyer/deals`, then the new deal. Check server amounts: subtotal **Rs. 18,000**, buyer fee **Rs. 360**, seller fee **Rs. 360**, buyer total **Rs. 18,360**, seller net **Rs. 17,640**. Pickup details remain locked before successful payment.
10. Click **Simulate Successful Payment**. No card details are collected and no money moves. The mock payment is confirmed and the backend-authorized pickup address/deadline unlock. **Simulate Failure** can be tested before success and permits another checkout attempt.
11. Switch to Gulberg and open the same deal from `/seller/deals`. Click **Confirm Physical Handover & Finalize Deal**. Confirm COMPLETED status. Inventory now has **50 available, 0 reserved, 150 sold**; the seller list displays the backend's sold quantity. The linked requirement becomes fulfilled and leaves the active requirement list.
12. Seller analytics shows seller fees and net from the backend. For the seeded authorized Gulberg owner, the backend also returns aggregate platform simulated revenue. This completed trade increases that aggregate by **Rs. 720**. Existing trades are included in the displayed aggregate.

## Verification and limits

Final checks on 19 October 2026:

| Check | Result |
| --- | --- |
| `npm run build` | Passed TypeScript and Vite production build; bundle-size warning remains |
| `npm run lint` | Passed with unused-code warnings; no lint errors |
| `npm test` | 17 passed; opt-in live test skipped in the normal suite |
| Opt-in live API test | 1 passed against the running FastAPI backend, including failed-payment retry and Rs. 720 platform-revenue increase |
| Browser walkthrough | Completed manual-data marketplace transaction; 150 sold, 50 available, 0 reserved |
| Public privacy / CORS | Public response omitted private seller fields; CORS preflight passed |
| Real AI inference | Blocked by hosted access/model/quota error on both endpoints |

- The backend was reachable and its real OpenAPI plus backend source contracts were inspected.
- CORS preflight for `http://localhost:5173` returned HTTP 200 and allowed both demo identity headers and Content-Type.
- `src/test/live-api.test.ts` is an opt-in integration test that uses the actual frontend HTTP adapter, creates fictional records, tests rejection/acceptance, excess quantity, private/public field separation, unrelated-organization denial, mock payment, collection and remaining stock. It records whether each live AI call succeeded in `docs/live-api-verification.json`.
- Both live AI endpoints currently return: **Hosted AI access, model or quota is unavailable. You can enter structured data manually.** Backend metadata says live mode and a configured token, but real inference is not working. Provider/model/quota configuration must be resolved in the backend to verify the AI steps. No fake extraction is substituted.
- A separate browser walkthrough exercised manual seller intake, publishing, buyer requirement confirmation, NEGOTIABLE matching, a linked 150-pack offer, acceptance, failed/successful mock checkout, collection and remaining inventory. IDs and evidence are recorded in `docs/browser-verification.json`; screenshots are `docs/browser-paid-deal.png` and `docs/browser-completed-deal.png`. The raw public API omitted minimum price, private address and original seller notes.
- Deal fees, buyer totals and seller net come from FastAPI. Before acceptance the UI shows only the proposed inventory subtotal, labeled as an estimate, because no pre-offer financial quote endpoint exists. Historical chart data, direct supplier contacts and warehouse release codes are not invented.
- The backend has no counter-offer endpoint; those controls are hidden in HTTP mode. Pausing replaces the old UI's delete/close actions where supported.
- The legacy offline mock service remains available only via explicit `VITE_DATA_PROVIDER=mock`, with a simulation banner. It is used by legacy unit tests and is not the default. The landing-page miniature preview and fallback product photography are illustrative, not backend inventory images.
- Demo membership headers are intentionally development-only. The UI does not claim production login/authentication.

Run checks:

```powershell
npm run build
npm run lint
npm test
$env:RUN_LIVE_API='1'
npx vitest run src/test/live-api.test.ts
Remove-Item Env:RUN_LIVE_API
```

The live test adds fictional data and simulated transactions. It does not delete existing data. Standard tests skip it unless explicitly enabled.
