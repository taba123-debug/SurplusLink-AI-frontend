# SurplusLink AI frontend

## Architecture

The frontend is organized by business feature. Pages compose feature hooks and
components; feature hooks own React Query behavior; infrastructure owns HTTP
transport and response mapping; shared components contain reusable UI. Read
[ARCHITECTURE.md](ARCHITECTURE.md) before adding a new page or feature.

The real-world buyer, seller and admin walkthrough is documented in
[docs/B2B-WORKFLOW.md](docs/B2B-WORKFLOW.md). Use that flow as the product
source of truth before the next visual design pass.

React, Vite, TypeScript and Tailwind frontend for the local FastAPI/PostgreSQL B2B surplus marketplace. Existing UI is connected to the backend at `http://localhost:8000/api/v1`.

```powershell
npm install
npm run dev -- --port 5173 --strictPort
```

Open `http://localhost:5173/login`, then select a fictional business supplied by the backend. Keep FastAPI and its seeded database running. `.env.example` contains the frontend configuration; provider credentials belong only in the backend.

Read [the integration report and complete demonstration guide](docs/FRONTEND-INTEGRATION.md) for connected pages, exact API paths, verification, limitations and the 200-pack / 150-pack walkthrough.

**Current blocker:** both live AI extraction endpoints report unavailable hosted access/model/quota. Errors are displayed and manual entry is available. Simulated AI output is rejected in HTTP mode. The marketplace transaction can be demonstrated with explicitly confirmed manual data; real AI extraction has not been verified successfully.

```powershell
npm run build
npm run lint
npm test
```

To run the opt-in local backend transaction test (creates fictional data and simulated payments):

```powershell
$env:RUN_LIVE_API='1'
npx vitest run src/test/live-api.test.ts
Remove-Item Env:RUN_LIVE_API
```

The legacy offline mock service is available only through explicit `VITE_DATA_PROVIDER=mock` and displays a simulation banner. HTTP is the default. All checkout transactions are demo/simulated; the app collects no card details and moves no money.
