# ROADMAP: Marketplace VDC

**Created:** 2026-03-03
**Core Value:** Conectar lojas físicas a clientes locais através de uma plataforma digital que oferece gestão completa de produtos, múltiplas opções de entrega (delivery ou retirada na loja), e integração com mapas para finder de lojas.

## Phases

- [x] **Phase 1: Authentication & User Profiles** - User registration, login, role management
- [ ] **Phase 2: Store & Product Management** - Store creation, product catalog, inventory
- [ ] **Phase 3: Discovery & Search** - Categories, filters, search, SEO
- [ ] **Phase 4: Checkout & Delivery** - Cart, delivery/pickup options, store locator, routing
- [ ] **Phase 5: Payments & Revenue** - Payment processing, subscription/transaction models
- [ ] **Phase 6: Promotions & Extensibility** - Discounts, plugin system

## Phase Details

### Phase 1: Authentication & User Profiles
**Goal:** Users can register, authenticate, and manage their roles as Buyer, Seller, or Admin

**Depends on:** Nothing (first phase)

**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, PROF-01, PROF-02, PROF-03, PROF-04, PROF-05

**Success Criteria** (what must be TRUE):
1. New user can sign up with email and password and receives verification email
2. User can log in and session persists across browser refresh
3. User can log out from any page
4. User can reset password via email link
5. User can register as Buyer or Seller with appropriate profile fields
6. Seller can access seller dashboard after registration
7. Admin can access admin dashboard after registration
8. Seller can update own store profile information

**Plans:** 2/3 plans executed

**Plan list:**
- [x] 01-01-PLAN.md — Project Foundation (Next.js, Prisma, NextAuth)
- [ ] 01-02-PLAN.md — Authentication Core (Register, Login, Logout, Email, Password Reset)
- [ ] 01-03-PLAN.md — User Profiles & Role Dashboards

---

### Phase 2: Store & Product Management
**Goal:** Sellers can create and manage stores with complete product catalogs

**Depends on:** Phase 1

**Requirements:** STOR-01, STOR-02, STOR-03, STOR-04, STOR-05, PROD-01, PROD-02, PROD-03, PROD-04, PROD-05, PROD-06, PROD-07, PROD-08, PROD-09

**Success Criteria** (what must be TRUE):
1. Seller can create a store with name, description, and address
2. Store address is geocoded and displays on map
3. Store can be found via map-based store locator
4. Seller can add store contact information (phone, email)
5. Seller can set store operating hours
6. Seller can create products with name, description, and price
7. Seller can upload multiple product images
8. Seller can assign products to categories
9. Seller can set product stock quantity
10. Product can display both wholesale and retail pricing
11. Products display correctly on store page
12. Seller can edit and delete own products

**Plans:** 5 plans

**Plan list:**
- [ ] 02-01-PLAN.md — Phase 2 Data Foundation (Models & Types)
- [ ] 02-02-PLAN.md — Store Creation Wizard (Multi-step + Leaflet)
- [ ] 02-03-PLAN.md — Product Management (Wizard + Image Processing)
- [ ] 02-04-PLAN.md — Seller Dashboard Assembly (Store & Product Lists)
- [ ] 02-05-PLAN.md — Back-in-stock Notifications (API & UI)

---

### Phase 3: Discovery & Search
**Goal:** Users can find products through search, categories, and filters

**Depends on:** Phase 2

**Requirements:** FILT-01, FILT-02, FILT-03, FILT-04, FILT-05, FILT-06, SEAR-01, SEAR-02, SEAR-03, SEAR-04, SEAR-05

**Success Criteria** (what must be TRUE):
1. Products can be filtered by category on store pages
2. Products can be filtered by price range
3. Products can be filtered by product type/attributes
4. Products can be sorted by price (low to high, high to low)
5. Products can be sorted by popularity
6. Home page displays trending/popular items
7. Users can search products by name and see results
8. Product pages have SEO-friendly URLs
9. Each product page has unique meta tags (title, description)
10. Sitemap is auto-generated for search engines
11. Product pages include structured data (JSON-LD)

**Plans:** TBD

---

### Phase 4: Checkout & Delivery
**Goal:** Buyers can complete purchases with delivery or in-store pickup options

**Depends on:** Phase 3

**Requirements:** CHEC-01, CHEC-02, CHEC-03, CHEC-04, CHEC-05, CHEC-06, CHEC-07, CHEC-08

**Success Criteria** (what must be TRUE):
1. Buyer can add products to shopping cart
2. Buyer can view cart with all added items
3. Buyer can select delivery or pickup at store at checkout
4. If pickup selected, store map with location is displayed
5. Buyer can generate route to store via Waze or Google Maps
6. Buyer can initiate navigation to store with one click
7. Buyer can enter delivery address for shipping
8. Order is created with correct delivery or pickup status

**Plans:** TBD

---

### Phase 5: Payments & Revenue
**Goal:** Platform processes payments with flexible business models

**Depends on:** Phase 4

**Requirements:** PAYM-01, PAYM-02, PAYM-03, PAYM-04, PAYM-05

**Success Criteria** (what must be TRUE):
1. Platform supports transaction fee model (per sale)
2. Platform supports monthly subscription model
3. Seller can choose preferred payment model
4. Checkout integrates with payment processor
5. Order payment status is tracked and visible

**Plans:** TBD

---

### Phase 6: Promotions & Extensibility
**Goal:** Sellers can run promotions and platform supports plugin integrations

**Depends on:** Phase 5

**Requirements:** PROM-01, PROM-02, PROM-03, PROM-04, PLUG-01, PLUG-02, PLUG-03, PLUG-04, PLUG-05

**Success Criteria** (what must be TRUE):
1. Seller can create discount promotions with percentage or fixed amounts
2. Promotions have configurable start and end dates
3. Active promotions display on product pages
4. Promotions tab shows all active deals
5. System maintains a plugin registry
6. Plugins can be dynamically loaded into the system
7. Payment gateway integrations are pluggable
8. Shipping carrier integrations are pluggable
9. System emits events for plugin hooks

**Plans:** TBD

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Authentication & User Profiles | 2/3 | In Progress|  |
| 2. Store & Product Management | 0/1 | Not started | - |
| 3. Discovery & Search | 0/1 | Not started | - |
| 4. Checkout & Delivery | 0/1 | Not started | - |
| 5. Payments & Revenue | 0/1 | Not started | - |
| 6. Promotions & Extensibility | 0/1 | Not started | - |

---

*Last updated: 2026-03-03*
