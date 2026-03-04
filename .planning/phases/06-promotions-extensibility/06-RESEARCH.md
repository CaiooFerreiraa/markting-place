# Phase 06 Research: Promotions & Extensibility

## Objective
Design a flexible promotion system (coupons, discounts) and a plugin architecture to allow for modular growth and third-party integrations (shipping, secondary payment gateways).

## Proposed Tech Stack
- **Promotions:** Prisma models for Coupons and Automatic Discounts.
- **Plugin System:** Event-driven architecture using a custom `PluginRegistry` and server-side hooks (middleware/actions).
- **Communication:** `EventEmitter` for local plugins or Webhooks for external ones.

## Promotion Types
1. **Coupons:** Code-based, fixed amount or percentage. Restricted by store or category.
2. **Automatic Discounts:** Applied automatically to products (e.g., "Sale" price).
3. **Volume Discounts:** Bulk purchase incentives (already partially handled by wholesale prices).

## Extensibility Hooks (Planned)
- `order.created`: Triggered after a new order.
- `payment.succeeded`: Triggered after Stripe confirmation.
- `shipping.calculate`: Hook for external carriers.

## Implementation Strategy
- **Step 1:** Add `Promotion` and `Coupon` models to Prisma.
- **Step 2:** Implement coupon validation logic in the `create-order` API.
- **Step 3:** Create a basic Plugin Interface for external shipping/payment providers.
- **Step 4:** UI for Sellers to create and manage their own store promotions.

## Success Criteria
- [ ] Sellers can create a "10% OFF" coupon for their store.
- [ ] Buyers can apply a coupon at checkout and see the discount reflected.
- [ ] System architecture allows adding a "Correios" or "Loggi" plugin without rewriting the core checkout.
