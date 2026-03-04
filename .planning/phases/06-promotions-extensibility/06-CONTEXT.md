## Phase 06: Promotions & Extensibility
**Goal:** Sellers can run promotions (coupons and auto-discounts) and the platform supports a modular plugin system for external integrations.

**Requirements:**
- PROM-01: Store-specific fixed/percent coupons.
- PROM-02: Automatic product discounts (Sale prices).
- PROM-03: Coupon application at checkout with real-time total update.
- PLUG-01: Event-based plugin architecture (EventEmitter).
- PLUG-02: Initial plugin: Real Notification Plugin (already prototyped in Phase 07).
- PLUG-03: Extension point for external shipping calculations.

**User Decisions:**
- Use `EventEmitter` for the local plugin system.
- Promotions should be manageable by sellers via their dashboard.
- Coupons should have usage limits and expiry dates.

**Architecture Patterns:**
- Service-based coupon validation in `src/lib/services/coupon-service.ts`.
- Hook-based plugin execution in `src/lib/plugins/plugin-manager.ts`.
