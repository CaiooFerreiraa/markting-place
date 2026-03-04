# ROADMAP: Marketplace VDC

**Created:** 2026-03-03
**Core Value:** Conectar lojas físicas a clientes locais através de uma plataforma digital que oferece gestão completa de produtos, múltiplas opções de entrega (delivery ou retirada na loja), e integração com mapas para finder de lojas.

## Phases

- [x] **Phase 1: Authentication & User Profiles** - User registration, login, role management
- [x] **Phase 2: Store & Product Management** - Store creation, product catalog, inventory
- [x] **Phase 3: Discovery & Search** - Categories, filters, search, SEO
- [x] **Phase 4: Checkout & Delivery** - Cart, delivery/pickup options, store locator, routing
- [x] **Phase 5: Payments & Revenue** - Payment processing, subscription/transaction models
- [ ] **Phase 6: Promotions & Extensibility** - Discounts, plugin system
- [ ] **Phase 7: Verification & Refinement** - E2E testing, UI/UX polish, production readiness

## Phase Details

### Phase 1: Authentication & User Profiles
**Goal:** Users can register, authenticate, and manage their roles as Buyer, Seller, or Admin
**Plans:** 3/3 plans executed
- [x] 01-01-PLAN.md — Project Foundation (Next.js, Prisma, NextAuth)
- [x] 01-02-PLAN.md — Authentication Core (Register, Login, Logout, Email, Password Reset)
- [x] 01-03-PLAN.md — User Profiles & Role Dashboards

---

### Phase 2: Store & Product Management
**Goal:** Sellers can create and manage stores with complete product catalogs
**Plans:** 5/5 plans executed
- [x] 02-01-PLAN.md — Phase 2 Data Foundation (Models & Types)
- [x] 02-02-PLAN.md — Store Creation Wizard (Multi-step + Leaflet)
- [x] 02-03-PLAN.md — Product Management (Wizard + Image Processing)
- [x] 02-04-PLAN.md — Seller Dashboard Assembly (Store & Product Lists)
- [x] 02-05-PLAN.md — Back-in-stock Notifications (API & UI)

---

### Phase 3: Discovery & Search
**Goal:** Users can find products through search, categories, and filters
**Plans:** 3/3 plans executed
- [x] 03-01-PLAN.md — Phase 3 Tech Foundation (Prisma FTS & Search State)
- [x] 03-02-PLAN.md — Search Results Page (Filters & Sorting)
- [x] 03-03-PLAN.md — SEO & Sitemap Implementation

---

### Phase 4: Checkout & Delivery
**Goal:** Buyers can complete purchases with delivery or in-store pickup options
**Plans:** 4/4 plans executed
- [x] 04-01-PLAN.md — Phase 4 Data Foundation (Orders & Sub-orders)
- [x] 04-02-PLAN.md — Shopping Cart with Store Grouping & Persistence
- [x] 04-03-PLAN.md — Checkout Flow & Multi-vendor Order Processing
- [x] 04-04-PLAN.md — Order Confirmation & Navigation Interface

---

### Phase 5: Payments & Revenue
**Goal:** Platform processes payments with flexible business models
**Plans:** 4/4 plans executed
- [x] 05-01-PLAN.md — Payment Infrastructure (Schema & Stripe Client)
- [x] 05-02-PLAN.md — Seller Onboarding (Stripe Connect Express)
- [x] 05-03-PLAN.md — Transaction Processing (Checkout & Webhooks)
- [x] 05-04-PLAN.md — Subscription Management (Monthly Billing)

---

### Phase 6: Promotions & Extensibility
**Goal:** Sellers can run promotions and platform supports plugin integrations

**Depends on:** Phase 5

**Requirements:** PROM-01, PROM-02, PROM-03, PROM-04, PLUG-01, PLUG-02, PLUG-03, PLUG-04, PLUG-05

**Success Criteria** (what must be TRUE):
1. Seller can create discount promotions with percentage or fixed amounts
2. Active promotions display on product pages
3. System maintains a plugin registry
4. System emits events for plugin hooks
5. Plugins can react to platform events (e.g., Notifications)

**Plans:** 2 plans
- [ ] 06-01-PLAN.md — Coupon System Implementation
- [ ] 06-02-PLAN.md — Plugin Architecture & Notifications

---

### Phase 7: Verification & Refinement
**Goal:** Ensure the system is production-ready with full E2E verification and polished UI

**Depends on:** Phase 6

**Plans:** 2/2 plans executed
- [x] 07-01-PLAN.md — E2E Verification & Real Notification Plugin
- [x] 07-02-PLAN.md — UI/UX Polishing (Empty states, loading indicators, error boundaries)

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Authentication & User Profiles | 3/3 | Completed | 2026-03-03 |
| 2. Store & Product Management | 5/5 | Completed | 2026-03-03 |
| 3. Discovery & Search | 3/3 | Completed | 2026-03-04 |
| 4. Checkout & Delivery | 4/4 | Completed | 2026-03-04 |
| 5. Payments & Revenue | 4/4 | Completed | 2026-03-04 |
| 6. Promotions & Extensibility | 0/2 | In Progress | - |
| 7. Verification & Refinement | 2/2 | Completed | 2026-03-04 |

---

*Last updated: 2026-03-04*
