# Phase 4: Checkout & Delivery - Research

**Researched:** 2026-03-04
**Domain:** E-commerce Checkout, Cart Persistence, Logistics (Delivery/Pickup), Map Integration
**Confidence:** HIGH

## Summary

This phase focuses on the transition from browsing to purchasing. We need a robust cart system that handles multi-store scenarios, a flexible checkout flow for delivery vs. pickup, and deep integration with maps for store navigation.

**Primary recommendation:** Use **localStorage** for guest carts with **Server-side synchronization** upon login. Implement **Split Orders** (one "Order" with multiple "Sub-Orders" or "StoreOrders") to handle multi-store carts effectively, as each store will have its own fulfillment lifecycle.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `zustand` | ^5.0 | Cart State Management | Lightweight, easy persistence middleware, works well with Next.js Client Components. |
| `lucide-react` | Latest | UI Icons | Standard for modern React apps, consistent with shadcn/ui. |
| `zod` | ^3.23 | Schema Validation | Type-safe validation for checkout forms and API payloads. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| `date-fns` | ^3.6 | Date Formatting | For estimated delivery/pickup times. |
| `google-maps-react-markers` | Latest | Map Display | If custom markers/interaction are needed on the pickup map. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `localStorage` | `HTTP-only Cookies` | Cookies are safer from XSS but harder to manage for complex JSON cart data without excessive SSR overhead. |
| `Split Orders` | `Single Order` | Harder to track fulfillment if one store ships and another is ready for pickup. |

**Installation:**
```bash
npm install zustand zod lucide-react date-fns
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── domain/
│   ├── cart/         # Cart logic & types
│   └── order/        # Order entities & rules
├── application/
│   ├── checkout/     # Checkout use cases (calc totals, split logic)
│   └── delivery/     # Delivery/Pickup business logic
└── infrastructure/
    ├── persistence/  # Prisma repositories for Orders
    └── maps/         # Google/Waze link generators
```

### Pattern 1: Multi-Store Split Order
**What:** When a cart has items from Store A and Store B, the system creates one parent `Order` (for payment/tracking) and two `StoreOrder` records.
**When to use:** Always in a multi-vendor marketplace.
**Example:**
```typescript
// Schema concept
model Order {
  id        String       @id
  userId    String
  total     Decimal
  status    OrderStatus
  subOrders StoreOrder[] // Split by store
}

model StoreOrder {
  id        String
  orderId   String
  storeId   String
  items     OrderItem[]
  status    StoreOrderStatus
}
```

### Anti-Patterns to Avoid
- **Client-side Price Calculation:** Never trust the "total" sent from the client. Re-calculate everything on the server during the checkout process using the database prices.
- **Global Cart for Guests in DB:** Don't create DB rows for every guest cart (expensive). Keep it in `localStorage` until they start checkout or log in.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Map Display | Custom Canvas | Google Maps / Leaflet | Handling zoom, tiles, and mobile touch is complex. |
| Form Handling | `useState` for every field | `react-hook-form` + `zod` | Validation and error states are tedious to hand-roll. |
| Address Auto-complete | String matching | Google Places API | Users make typos; Places API ensures valid geocodable addresses. |

## Common Pitfalls

### Pitfall 1: Cart Desynchronization
**What goes wrong:** User adds item A to cart on Mobile (guest), then logs in. They previously had item B in their account cart.
**How to avoid:** Implement a "Merge Strategy" (Append or Overwrite) when a guest logs in. Typically, appending guest items to the account cart is best.

### Pitfall 2: Race Conditions in Stock
**What goes wrong:** Two users add the last item to their cart. One checks out while the other is still entering their address.
**How to avoid:** Check stock at **three points**: 1. Adding to cart, 2. Entering checkout, 3. Final payment/order creation (Atomic transaction).

## Code Examples

### Deep Link Generation
```typescript
/**
 * Generates navigation links for mobile devices.
 * Source: Official Google Maps/Waze URL schemes
 */
export const getNavigationLinks = (lat: number, lng: number, address: string) => {
  const label = encodeURIComponent(address);
  return {
    google: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
    apple: `maps://?q=${label}&sll=${lat},${lng}`
  };
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Checkout | Multi-step Server Actions | Next.js 14+ | Better UX, reduced bundle size, atomic updates. |
| Redux Cart | Zustand/Jotai | 2022+ | Simpler boilerplate, better SSR compatibility. |

## Open Questions

1. **Transaction Fee Responsibility:** Does the buyer see the platform fee split or integrated into the product price? 
   - Recommendation: Show a "Service Fee" at the final summary line.
2. **Partial Fulfillment:** Can a buyer cancel one part of a multi-store order without canceling the whole thing?
   - Recommendation: Treat `StoreOrder` as the unit of cancellation/fulfillment.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + Playwright |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CHEC-01 | Add to cart persists locally | Unit | `vitest tests/cart.test.ts` | ❌ Wave 0 gap |
| CHEC-03 | Switch Delivery/Pickup logic | Integration | `vitest tests/checkout-flow.test.ts` | ❌ Wave 0 gap |
| CHEC-08 | Order split by store in DB | Integration | `vitest tests/order-service.test.ts` | ❌ Wave 0 gap |

### Wave 0 Gaps
- [ ] `tests/cart.test.ts` — Store/Cart persistence logic.
- [ ] `tests/order-service.test.ts` — Logic for splitting parent orders into store-specific sub-orders.

## Sources

### Primary (HIGH confidence)
- Next.js Documentation (App Router & Server Actions)
- Prisma Schema Reference (Relations & Enums)
- Google Maps Platform Documentation (URL Schemes)

### Metadata
- **Confidence breakdown:**
  - Standard stack: HIGH
  - Architecture: HIGH
  - Pitfalls: MEDIUM (Real-world stock race conditions can vary)
- **Valid until:** 2026-04-04
