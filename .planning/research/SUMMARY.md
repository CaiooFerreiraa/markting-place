# Research Summary: Marketplace VDC

**Project:** Physical Store Marketplace (Physical Store + Delivery/Pickup)
**Synthesized:** March 2026

---

## Executive Summary

This is a multi-vendor marketplace for physical stores with delivery and in-store pickup capabilities—similar to Mercado Livre but focused on physical retail. The research recommends a modern Next.js 15 stack with Clean Architecture, leveraging Server Actions for mutations and React Server Components for SEO-critical pages.

**Key recommendations:**
- Use **Next.js 15 + TypeScript + Tailwind** as the foundation
- Implement **Clean Architecture** with clear layer separation (Presentation → Application → Feature → Bootstrap)
- Start with **PostgreSQL + Prisma** for data, upgrade to **Algolia** for search at scale
- Use **Stripe Connect** for payment splitting from day one—do not build custom
- Prioritize **inventory reservation** and **geocoding accuracy** as critical infrastructure

The biggest risks are inventory desynchronization across channels, payment edge cases, and search degradation at scale. All can be mitigated with proper architecture from the start.

---

## Key Findings

### Stack (STACK.md)

| Technology | Purpose | Rationale |
|------------|---------|-----------|
| **Next.js 15** | Full-stack framework | SSR for SEO, Server Actions, native NextAuth |
| **TypeScript 5.x** | Type safety | Required, excellent DX with shadcn/ui |
| **NextAuth.js v5** | Authentication | Per project requirements, better TS support |
| **PostgreSQL 16.x + Prisma 6.x** | Database & ORM | Relational marketplace data, migration DX |
| **shadcn/ui + Tailwind** | UI components | Industry standard, fully customizable |
| **Zustand + TanStack Query** | State management | Lightweight, covers 95% of use cases |
| **React Leaflet** | Maps | Free, no API key, upgrade to Mapbox if needed |
| **Stripe Connect** | Payments | Marketplace-specific, handles split payments |
| **Resend + React Email** | Email | Modern API, React-based templates |

**Database hosting:** Neon (serverless PostgreSQL) or Supabase for full-stack
**Deployment:** Vercel (native Next.js support)

### Features (FEATURES.md)

**Table Stakes (MVP - Must Have):**
- Product listing with images, variants, pricing
- Category navigation + search with autocomplete
- Faceted filters (price, brand, category)
- Buyer registration + seller onboarding
- Shopping cart + checkout flow
- In-store pickup selection
- Basic SEO (URLs, meta tags, sitemaps)
- Admin dashboard

**Differentiators (Phase 2+):**
- Real-time store stock visibility (omnichannel)
- Reserve online, pay in-store ("Clique e Retire")
- Store locator with interactive map
- Tiered pricing / wholesale (B2B)
- Promotions, coupons, flash sales
- Seller analytics dashboard
- Plugin system for payments/shipping

**Anti-Features (Avoid):**
- Universal marketplace (all categories) — scope creep
- Complex auction model — operational overhead
- International shipping by default — customs complexity
- Real-time chat support in Phase 1 — staff overhead
- Native mobile app first — PWA first
- Custom payment splitting — use Stripe Connect

### Architecture (ARCHITECTURE.md)

**Layer Structure:**
1. **Presentation Layer** — Next.js App Router, Server/Client Components
2. **Application Layer** — MVVM (Controllers, ViewModels, Views)
3. **Feature Layer** — Clean Architecture (Domain Entities, UseCases, Repository Interfaces)
4. **Bootstrap Layer** — DI Container, Config, External Adapters

**Key Patterns:**
- Server Actions for mutations (not REST endpoints)
- Repository pattern with interfaces (dependency inversion)
- Plugin registry with lifecycle hooks
- JSON-LD structured data for SEO

**Data Flow:**
- **Read:** Route → Controller → UseCase → Repository → Entity
- **Write:** Server Action → Zod validation → UseCase → Repository → Revalidate

### Pitfalls (PITFALLS.md)

**Critical (Address in Phase 1-2):**
1. **Inventory desync** — Multi-channel sellers cause overselling. Prevention: reservation system (10-15 min hold), graceful failure flow
2. **Payment split nightmares** — Edge cases create accounting nightmares. Prevention: Stripe Connect from day one, escrow holds
3. **Search degradation at scale** — SQL full-text doesn't scale to 100K products. Prevention: Design search API contract early, plan Algolia migration
4. **IDOR vulnerabilities** — Missing ownership checks expose all vendor data. Prevention: authorization middleware for ALL resource routes
5. **Payment webhook security** — Fake payments via unverified webhooks. Prevention: signature verification before any processing

**Moderate:**
- CORS with dynamic subdomains (multi-tenant)
- Frontend/backend schema mismatch (use Zod)
- Review system gaming (verified purchase only)
- Delivery/pickup zone complexity (location-based inventory)
- Geocoding accuracy (validate coordinates)

**Minor (Phase 4+):**
- Plugin system over-engineering (don't build until 2+ real use cases)
- Hardcoded API response values
- Deployment caching issues

---

## Implications for Roadmap

### Suggested Phase Structure

**Phase 1: Foundation (Weeks 1-4)**
- Bootstrap: DI container, Prisma, config validation
- User authentication (NextAuth.js)
- Basic store CRUD
- Authorization middleware (IDOR prevention)
- CORS + subdomain handling

**Phase 2: Core Marketplace (Weeks 5-8)**
- Product catalog with variants
- Category navigation + basic search
- Seller onboarding flow
- Basic SEO infrastructure (URLs, meta, sitemaps)
- Design search API for future Algolia migration

**Phase 3: Fulfillment & Payments (Weeks 9-14)**
- In-store pickup with store locator
- Shipping options configuration
- Checkout flow with Stripe Connect
- Payment webhook security (signature verification first!)
- Inventory reservation system (critical)
- Geocoding/address validation

**Phase 4: Trust & Scale (Weeks 15-20)**
- Seller analytics dashboard
- Promotions/coupons system
- Review system (with fraud detection)
- Dispute resolution flow
- Advanced search (Algolia integration)
- PWA capabilities

**Phase 5: Plugin System (Weeks 21-24)**
- Plugin registry architecture
- Payment gateway plugins
- Shipping carrier plugins
- Marketplace API for third-party sellers

### Research Flags

| Phase | Needs Deeper Research |
|-------|----------------------|
| Phase 1 | Auth provider selection (NextAuth vs Better-Auth) |
| Phase 3 | Stripe Connect specifics for Brazil/LATAM |
| Phase 3 | Local carrier integrations (Correios, etc.) |
| Phase 4 | Review fraud detection algorithms |
| Phase 5 | Plugin sandboxing security patterns |

### Standard Patterns (Skip Research)

- Next.js App Router patterns (well-documented)
- Prisma + PostgreSQL patterns (mature ecosystem)
- shadcn/ui component patterns (excellent docs)
- Clean Architecture use cases (standard patterns)

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Stack** | HIGH | Standard 2026 stack, all technologies well-established |
| **Features** | HIGH | Table stakes clear, differentiation well-researched |
| **Architecture** | HIGH | Clean Architecture patterns validated across sources |
| **Pitfalls** | MEDIUM-HIGH | Production post-mortems, but marketplace specifics vary |

**Gaps to Address:**
- Brazil/LATAM payment specifics (Mercado Pago integration)
- Local shipping carriers (Correios, regional providers)
- Multi-language infrastructure (if expanding beyond Brazil)
- SEO strategy for Portuguese/Brazilian market

---

## Sources

- STACK.md: Next.js 15 Docs, shadcn/ui, Prisma 6, Zustand + TanStack Query patterns
- FEATURES.md: Marketplace feature comparisons, Mercado Livre reference, omnichannel research
- ARCHITECTURE.md: Clean Architecture in Next.js (DEV Community), Google Maps API docs
- PITFALLS.md: Production post-mortems (Medium), Marketplace pitfalls (McFadyen Digital), Next.js mistakes (2025/2026)
