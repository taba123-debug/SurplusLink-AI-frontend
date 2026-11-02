# Sea Serve B2B operating walkthrough

This is the intended real-world workflow for the current frontend. The mock
provider demonstrates the same states that the backend must persist.

## Buyer flow: source to repeat purchase

1. **Enter the buyer workspace** at `/login` and select a retailer or
   wholesaler identity.
2. **Open Wholesale Lots** at `/marketplace`.
3. **Create a sourcing brief** using search, category, city, minimum units,
   unit-price range, shelf-life, packaging, supplier verification and lot
   status. The filters are stored in the URL so the brief is shareable and
   survives refresh.
4. **Review a lot** at `/marketplace/:lotId`. Confirm available quantity,
   minimum order, expiry, storage, pickup region and commercial estimate.
5. **Submit an offer** with quantity, proposed unit price and pickup
   preference. The buyer fee is shown as an estimate; the backend remains
   authoritative.
6. **Track negotiation** at `/buyer/offers`. A seller can accept, reject or
   counter where the backend supports it.
7. **Pay after acceptance** at `/buyer/deals/:id`. Before payment, private
   pickup details remain hidden.
8. **Collect and confirm handover**. The deal becomes completed and inventory
   moves from reserved to sold exactly once.
9. **Return to requirements** at `/buyer/requirements` or use AI sourcing to
   save a repeat procurement brief.

## Seller flow: surplus to settlement

1. **Enter the seller workspace** and open `/seller/inventory/new`.
2. **Create a lot** from a structured form or assisted description. Confirm
   quantity, packaging, dates, storage, public asking price and confidential
   minimum price.
3. **Publish inventory** at `/seller/inventory`. The listing is visible only
   when its status and dates allow it.
4. **Review incoming offers** at `/seller/offers`. Validate quantity, unit
   price, expiry and operational pickup feasibility.
5. **Accept or reject**. Acceptance must atomically reserve stock and create
   one deal; repeated clicks must not create duplicate deals.
6. **Release pickup information only after payment** and track the deal at
   `/seller/deals`.
7. **Confirm handover**. Reserved quantity is released and sold quantity is
   incremented once.
8. **Review performance** at `/seller/analytics`.

## Admin and operations flow

1. Open `/admin/overview`.
2. Monitor active inventory, offers, accepted deals, completed value and fees.
3. Investigate failed or stalled deals without exposing confidential seller
   reserve prices or private pickup details to buyers.

## Business rules to preserve

- Money is stored in integer paisa/minor units.
- Buyer and seller fees are calculated from the agreed subtotal.
- Buyer-facing responses never expose reserve prices or private pickup data
  before payment.
- Organization identity and role scope every buyer, seller and admin query.
- Offer acceptance, payment completion and pickup completion are idempotent.
- A counteroffer's effective quantity and price are the values reserved and
  used to calculate the deal.

## Definition of a complete demo

The app is ready for a business walkthrough when a fresh user can complete:

```text
seller login → create lot → publish
buyer login → filter/search → inspect lot → submit offer
seller login → accept offer → deal created
buyer login → simulate payment → pickup details unlock
buyer confirms pickup → seller/admin dashboards update
```

The next design phase should use this flow as the source of truth for page
hierarchy, navigation, form states, empty states, permissions and responsive
layouts.
