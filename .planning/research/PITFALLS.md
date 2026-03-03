# Domain Pitfalls: Next.js Marketplace for Physical Stores

**Project Type:** Multi-vendor marketplace (similar to Mercado Livre)
**Research Date:** March 2026
**Confidence:** MEDIUM-HIGH (multiple industry sources, production post-mortems)

---

## Critical Pitfalls

Mistakes that cause rewrites, security vulnerabilities, or major business problems.

### Pitfall 1: Inventory Desynchronization

**What goes wrong:**  
Sellers list products on your marketplace AND other platforms (Etsy, Instagram, their own site). By the time a customer clicks "buy" on your platform, the item is already sold elsewhere. You process refunds, apologize, and your trust score plummets.

**Why it happens:**  
Building "real-time" inventory when sellers manage stock across multiple channels is fundamentally impossible. You can't control what happens outside your platform.

**Consequences:**
- Angry customers leaving negative reviews about "fake inventory"
- Refund processing costs
- Platform trust damage
- Seller trust damage (good sellers get blamed for your system failures)

**Prevention:**
1. Accept that inventory will sometimes be wrong — build entire purchase flow around graceful failures
2. Implement optimistic inventory with reservation system (reserve for 10-15 min during checkout)
3. Add buffer stock logic for high-demand items
4. Build automated inventory sync webhooks with sellers
5. Create "notify when available" fallback instead of showing unavailable items as available

**Warning Signs:**
- Sellers with multi-channel presence reporting issues
- Checkout flow doesn't handle "sold during checkout" gracefully
- No reservation/temporary hold mechanism

**Phase to Address:** Core Features (Phase 2-3) — Inventory management must be designed early, not bolted on later.

---

### Pitfall 2: Payment Split Nightmares

**What goes wrong:**  
"We'll just take our 20% commission automatically." Sounds simple until:
- Customer wants partial refund
- Seller ships half the order
- You refund your commission but already paid the seller
- Payment fails after seller shipped
- Chargeback comes in three months later
- Database has negative balances, accounting is broken

**Why it happens:**  
Every edge case creates new states in your payment system that nobody anticipated. Payment logic for marketplaces is significantly more complex than single-seller e-commerce.

**Consequences:**
- Financial reconciliation nightmares
- Negative platform balances
- Seller payouts in dispute
- Legal/regulatory issues with payment handling

**Prevention:**
1. Use payment platforms designed for marketplaces (Stripe Connect, Pagarme for Brazil/LATAM)
2. Design for graceful failure from day one
3. Implement escrow-style holds (don't release seller funds until delivery confirmed)
4. Build comprehensive refund state machine before launch
5. Plan for chargeback scenarios with clear policies
6. Separate platform commission from seller payouts in database

**Warning Signs:**
- Custom payment implementation without marketplace-specific provider
- No chargeback handling plan
- Single database balance instead of segmented escrow

**Phase to Address:** Payments (Phase 3) — Use Stripe Connect or similar from the start. Do not build custom split payment logic.

---

### Pitfall 3: Search That Degrades With Scale

**What goes wrong:**  
Week 1: "Our search is so fast!"  
Month 6: "Why does search take 8 seconds?"

Your beautiful search worked with 100 products. Now you have 100,000, each with dozens of attributes, seller-specific pricing, location-based availability, and custom shipping rules. That simple SQL query is now a 15-table join.

**Why it happens:**  
SQL full-text search doesn't scale. Filters built into URL structure. SEO depends on search pages. You can't just "add Elasticsearch" — your entire frontend assumes instant results.

**Consequences:**
- User experience degrades significantly at scale
- SEO suffers (slow search = bad signals)
- Retrofitting search infrastructure = rebuilding half platform
- Competitors with better search win

**Prevention:**
1. Plan for search infrastructure from day one (even if using SQL initially)
2. Design search as a separate service with clear API contract
3. Consider Meilisearch or Algolia early (easier than Elasticsearch)
4. Implement search result caching at edge
5. Build incremental migration path (sync SQL → dedicated search)
6. Design filters to work with both approaches

**Warning Signs:**
- Search queries hitting 5+ table joins
- No search result pagination strategy
- Location-based filtering not designed for scale

**Phase to Address:** Core Infrastructure (Phase 1-2) — Design search architecture for scale, even if implemented with SQL initially.

---

### Pitfall 4: Missing Authorization (IDOR Vulnerabilities)

**What goes wrong:**  
Any logged-in vendor can update another vendor's inventory. The route verifies authentication but doesn't verify ownership of the product. Classic Insecure Direct Object Reference (IDOR).

**Why it happens:**  
Moving fast, "we'll add ownership checks later." Every resource route needs ownership checks in multi-tenant systems.

**Consequences:**
- Security breach exposing all vendor data
- Regulatory penalties
- Complete loss of seller trust
- Legal liability

**Prevention:**
1. Add ownership verification middleware for ALL resource routes
2. Implement tenant isolation at database query level
3. Build authorization checks into framework (middleware for all routes)
4. Security audit all API endpoints before launch
5. Use parameterized queries for all database access

**Code Pattern:**
```typescript
// Every update/delete route needs this:
router.patch(
  '/products/:id/stock',
  protect,
  authorize('vendor'),
  attachVendor,  // Attaches vendor to request
  validateMongoId('id'),
  verifyProductOwnership,  // Checks product.vendorId === req.vendor.id
  updateStock
);
```

**Warning Signs:**
- No middleware for tenant isolation
- Direct ID usage in queries without ownership check
- Single-tenant auth patterns used in multi-tenant system

**Phase to Address:** Security Layer (Phase 1) — Authorization is not "later work." It's foundational.

---

### Pitfall 5: Payment Webhook Security

**What goes wrong:**  
Webhook endpoint accepts POST requests without verifying they came from Stripe. Anyone can fake a successful payment.

**Why it happens:**  
"We'll add verification later." Webhook endpoints are critical infrastructure that are easy to overlook.

**Consequences:**
- Fake payments processed
- Financial loss
- Complete platform trust destruction

**Prevention:**
1. Implement webhook signature verification BEFORE testing payments
2. Verify webhook signatures at edge (before any processing)
3. Log all webhook events for audit trail
4. Implement idempotency (webhooks can fire multiple times)
5. Use webhook secret rotation

**Code Pattern:**
```typescript
// Always verify webhook signatures
const sig = req.headers['stripe-signature'];
event = stripe.webhooks.constructEvent(
  req.body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

**Warning Signs:**
- Webhook endpoint with no signature verification
- Webhook processing before signature check
- No idempotency key handling

**Phase to Address:** Payments (Phase 3) — Webhook security is NOT optional. Implement with initial payment integration.

---

## Moderate Pitfalls

### Pitfall 6: CORS with Dynamic Subdomains

**What goes wrong:**  
Once vendors start creating products via their subdomains (vendorname.yoursite.com), requests are blocked by CORS policy. Only main domain was configured.

**Why it happens:**  
Multi-tenant systems with subdomains are common but CORS configuration is often overlooked during local development (which uses single domain).

**Prevention:**
1. Configure CORS with wildcard subdomains during initial setup
2. Allow both main domain AND `*.yourdomain.com`
3. Ensure `credentials: true` is enabled
4. Test with actual subdomains, not just main domain

**Warning Signs:**
- API works from main domain but fails from subdomains
- Credentials not passing between domains
- Subdomain-based vendor portals failing silently

**Phase to Address:** Multi-tenancy Setup (Phase 1)

---

### Pitfall 7: Frontend/Backend Schema Mismatch

**What goes wrong:**  
Product creation fails with MongoDB `CastError`. Backend schema expects `images: [String]` but frontend sends objects like `{ url: null, publicId: undefined, isPrimary: true }`.

**Why it happens:**  
Frontend UI state needs extra metadata (for preview, upload progress). Backend needs minimal data. No explicit mapping between them.

**Prevention:**
1. Define clear API contracts upfront
2. Normalize data at API boundary, not in business logic
3. Use Zod or similar for runtime type validation
4. Separate UI state from persistence state explicitly

**Warning Signs:**
- Backend receiving unexpected data shapes
- Frontend storing UI-only data in API payloads
- No data transformation layer

**Phase to Address:** API Design (Phase 1-2)

---

### Pitfall 8: Review System Gaming

**What goes wrong:**
- Sellers create fake accounts to review themselves
- Competitors leave fake negative reviews
- Buyers threaten bad reviews to extort refunds
- Good sellers get one bad review and their sales die
- Bad sellers know how to game the system perfectly

**Why it happens:**  
Trust systems are inherently gameable. Every marketplace faces this.

**Consequences:**
- Trust score becomes meaningless
- Good sellers leave platform
- Bad sellers dominate
- Support time explodes

**Prevention:**
1. Implement "verified purchase" requirements
2. Build review anomaly detection
3. Create seller response capability
4. Design review weighting (recent reviews > old reviews)
5. Build manual review escalation workflow
6. Plan for more fraud detection than you think needed

**Warning Signs:**
- No verification system for reviews
- Single review can significantly impact seller rating
- No seller response/rebuttal capability

**Phase to Address:** Trust Systems (Phase 3-4)

---

### Pitfall 9: Dispute Resolution Black Hole

**What goes wrong:**
- Every dispute becomes a three-way email thread
- Support tickets reference other tickets in endless chain
- Storing gigabytes of photos of damaged items
- Sellers and buyers both bombard your Twitter
- You're running a small claims court

**Why it happens:**  
Nobody plans for disputes properly. You assume sellers and buyers will work it out. They won't.

**Prevention:**
1. Design dispute flow before launch (not after first dispute)
2. Build three-party conversation system (buyer/seller/platform)
3. Implement evidence storage (photos, messages, tracking)
4. Create clear resolution policies and automations
5. Build escalation workflows
6. Plan for dispute volume (it will be higher than expected)

**Warning Signs:**
- No dispute management system in initial design
- Support tool wasn't built for three-party conversations
- Database wasn't designed to store evidence files

**Phase to Address:** Trust & Safety (Phase 3-4)

---

### Pitfall 10: Delivery/Pickup Zone Complexity

**What goes wrong:**
- Wrong ZIP code breaks delivery options
- Inventory tied to wrong location
- Store pickup shows option but store has no stock
- Delivery zones not synced with store coverage
- Customer picks pickup, store says "we never had that"

**Why it happens:**  
Physical store + delivery + pickup = three different inventory/logistics systems that must stay in sync.

**Prevention:**
1. Build location-based inventory checking per fulfillment method
2. Implement store-level inventory, not just product-level
3. Create delivery zone validation at checkout
4. Build "pickup available" verification (store has stock AT PICKUP TIME)
5. Handle cross-store inventory transfers
6. Plan for store closures, holidays, special hours

**Warning Signs:**
- Inventory tracked only at product level
- No store-specific stock checking
- Delivery zones hardcoded without validation
- Pickup shows available but store has no stock

**Phase to Address:** Fulfillment (Phase 3)

---

### Pitfall 11: Geocoding/Location Accuracy

**What goes wrong:**  
A single bad coordinate means missed delivery, false fraud flags, broken customer experience. Geocoding turns "111 5th Avenue" into coordinates. Bad geocoding breaks maps, delivery routing, store proximity, and pickup.

**Why it happens:**  
Geocoding APIs return different results. Addresses get entered wrong. Coordinate systems differ.

**Prevention:**
1. Use multiple geocoding providers for validation
2. Implement address autocomplete (Google Places, etc.)
3. Validate coordinates are within expected bounds
4. Build coordinate correction for common errors
5. Allow manual address correction by users

**Warning Signs:**
- Maps showing wrong locations
- Delivery routing to wrong address
- Store proximity calculations off
- No address validation at input

**Phase to Address:** Maps Integration (Phase 2-3)

---

## Minor Pitfalls

### Pitfall 12: Plugin System Over-Engineering

**What goes wrong:**  
You build an incredibly flexible plugin system that nobody uses. Or the opposite: plugins break core functionality, security, or upgrade paths.

**Why it happens:**  
Extensibility is valuable but building it too early wastes time. Building it wrong creates maintenance nightmares.

**Prevention:**
1. Don't build plugin system until you have 2+ real use cases
2. Start with simple hook system, not full plugin architecture
3. Use TypeScript + Zod for type-safe plugin contracts
4. Sandbox plugins (no direct database access)
5. Plan for plugin versioning and migration

**Warning Signs:**
- Building plugin system in Phase 1
- No real use cases driving the design
- Plugins can modify core functionality directly

**Phase to Address:** Plugin System (Phase 4+) — Only after core platform is stable and real extension needs exist.

---

### Pitfall 13: Hardcoded API Response Values

**What goes wrong:**  
Vendor stores are live in database, but API returns hardcoded `{ "canReceiveOrders": false, "isPublic": false }`. Leftovers from early development.

**Why it happens:**  
API responses return assumptions/defaults instead of actual database state.

**Prevention:**
1. API responses should always reflect real database state
2. Remove hardcoded values in production code
3. Test API responses against actual database
4. Build API response validation tests

**Warning Signs:**
- API returns different values than database contains
- Feature flags hardcoded in responses
- No API integration tests

**Phase to Address:** API Design (Phase 2)

---

### Pitfall 14: Deployment Caching Issues

**What goes wrong:**  
After pushing fixes, production still behaves like old code. Platform caches aggressively. Local tests pass. Commits pushed. Live app unchanged.

**Prevention:**
1. Know your deployment platform's caching behavior
2. Have "force rebuild" in deployment checklist
3. Implement deployment verification tests
4. Use deployment hooks to clear caches

**Phase to Address:** DevOps (All phases)

---

## Phase-Specific Warnings

| Phase | Likely Pitfall | Mitigation |
|-------|---------------|------------|
| Phase 1: Core Setup | IDOR vulnerabilities, CORS with subdomains, hardcoded API values | Security-first middleware, test with subdomains, API contract validation |
| Phase 2: Products/Search | Search scaling, inventory sync, geocoding errors | Plan search architecture, design for graceful inventory failure, validate geocoding |
| Phase 3: Payments/Fulfillment | Payment webhook security, payment split complexity, pickup zone bugs | Webhook verification first, use marketplace payment provider, location-based inventory |
| Phase 4: Trust Systems | Review gaming, dispute resolution | Build fraud detection early, design three-party dispute flow |
| Phase 5: Plugin System | Over-engineering, security leaks | Don't build until needed, sandbox plugins |

---

## Summary: What to Prioritize

**Most Critical (Address in Phase 1-2):**
1. Authorization/IDOR prevention — security is foundational
2. Payment webhook security — non-negotiable
3. Search architecture design — harder to fix later
4. Inventory failure handling — business critical

**Important (Address in Phase 2-3):**
5. Payment provider selection (Stripe Connect) — don't build custom
6. Geocoding/address validation
7. Delivery/pickup zone logic
8. CORS with subdomains

**Can Defer (Phase 4+):**
9. Plugin system
10. Advanced review fraud detection
11. Dispute resolution complexity

---

## Sources

- [The hidden pitfalls of building online marketplaces - DEV Community](https://dev.to/egledigital/the-hidden-pitfalls-of-building-online-marketplaces-c2) — HIGH (production post-mortems)
- [Shipping a Multi-Vendor Marketplace: What Production Actually Taught Me - Medium](https://medium.com/@houseofarby/shipping-a-multi-vendor-marketplace-what-production-actually-taught-me-81d21ae068a8) — HIGH (real production issues)
- [Marketplace Monsters: McFadyen Digital](https://mcfadyen.com/2022/10/28/marketplace-monsters-how-to-avoid-multi-vendor-commerce-pitfalls/) — MEDIUM (industry analysis)
- [How to design a Scalable Marketplace search Architecture - Medium](https://medium.com/@nivedhapalani08/how-to-design-a-scalable-marketplace-search-architecture-using-meilisearch-and-postgresql-8ed6e11ea180) — MEDIUM (technical architecture)
- [Common Next.js Mistakes - various 2025/2026 sources](https://medium.com/@sureshdotariya/35-next-js-mistakes-that-are-quietly-killing-your-app-and-how-to-fix-them-89549146cccb) — MEDIUM (framework-specific issues)
