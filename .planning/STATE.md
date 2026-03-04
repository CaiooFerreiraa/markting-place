# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-03)

**Core value:** Conectar lojas físicas a clientes locais através de uma plataforma digital que oferece gestão completa de produtos, múltiplas opções de entrega (delivery ou retirada na loja), e integração com mapas para finder de lojas.
**Current focus:** Phase 1: Authentication & User Profiles

## Current Position

Phase: 05 (Payments & Revenue)
Plan: 02
Status: Plan complete
Last activity: 2026-03-04 — Plan 05-02 completed

Progress: [▓▓▓▓▓▓▓░░░] 70%

## Performance Metrics

**Velocity:**
- Total plans completed: 1
- Average duration: 25 min
- Total execution time: 0.4 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 - Auth & Profiles | 1 | 1 | 25 min |
| 2 - Store & Products | 0 | - | - |
| 3 - Discovery & Search | 0 | - | - |
| 4 - Checkout & Delivery | 0 | - | - |
| 5 - Payments & Revenue | 0 | - | - |
| 6 - Promotions & Extensibility | 0 | - | - |

**Recent Trend:**
- Last 5 plans: No plans executed yet
- Trend: N/A

*Updated after each plan completion*
| Phase 01-authentication-user-profiles P03 | 45 min | 5 tasks | 6 files |
| Phase 02-store-product-management P01 | 15m | 2 tasks | 3 files |
| Phase 02-store-product-management P02 | 10m | 2 tasks | 3 files |
| Phase 02-store-product-management P04 | 15m | 1 tasks | 3 files |
| Phase 02-store-product-management P05 | 15m | 1 tasks | 3 files |
| Phase 03-discovery-search P01 | 15m | 2 tasks | 4 files |
| Phase 03-discovery-search P02 | 45m | 2 tasks | 5 files |
| Phase 03-discovery-search P03 | 15m | 2 tasks | 3 files |
| Phase 04-checkout-delivery P01 | 20m | 2 tasks | 3 files |
| Phase 05-payments-revenue P01 | 15m | 2 tasks | 2 files |
| Phase 05-payments-revenue P03 | 20 | 2 tasks | 2 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Phase structure derived from requirements analysis
- Combined Promotions with Phase 6 (alongside Plugin System)
- Checkout and Delivery kept together in Phase 4 for coherent workflow
- [Phase 01-authentication-user-profiles]: Reused same profile update API for both Buyers and Sellers (conditional storeName update)
- [Phase 01-authentication-user-profiles]: Simplified role upgrade by only updating role in DB (full store setup deferred to Phase 2)
- [Phase 02-store-product-management]: Used Decimal(10, 2) for price fields to ensure precision
- [Phase 02-store-product-management]: Used JSON type for operatingHours and exceptions to allow flexible store schedules
- [Phase 02-store-product-management]: Implemented URL-based store selection (searchParams.store) to enable deep linking and easy management
- [Phase 02-store-product-management]: Implemented a find/create fallback for product subscriptions to ensure uniqueness without a unique constraint
- [Phase 03-discovery-search]: Use nuqs for URL-state synchronization to enable shareable search URLs
- [Phase 03-discovery-search]: Enable fullTextSearchPostgres preview feature in Prisma for advanced search capabilities
- [Phase 03-discovery-search]: Used debounced state for URL updates (500ms) to prevent excessive server requests during typing/filtering
- [Phase 03-discovery-search]: Implemented case-insensitive contains search as a fallback/alternative to FTS for broader compatibility
- [Phase 03-discovery-search]: Used nuqs createSearchParamsCache for efficient server-side parameter parsing in Server Components
- [Phase 05-payments-revenue]: Initialize Stripe client with apiVersion 2025-01-27.acacia and User schema fields for Stripe accounts/customers
- [Phase 05-payments-revenue]: Commission rate hardcoded at 10% (PAYM-01) for this phase.

### Pending Todos

[From .planning/todos/pending/ — ideas captured during sessions]

None yet.

### Blockers/Concerns

[Issues that affect future work]

None yet.

## Session Continuity

Last session: 2026-03-04
Stopped at: Completed 04-checkout-delivery-01-PLAN.md
