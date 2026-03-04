---
phase: 05-payments-revenue
plan: "02"
subsystem: payments
tags: [stripe, onboarding, connect, express]
requires: ["05-01"]
provides: ["onboarding-flow"]
affects: ["user-model", "dashboard"]
tech-stack: [stripe-connect, nextjs, prisma]
key-files: [src/app/api/stripe/onboard/route.ts, src/components/dashboard/seller/payment-setup.tsx]
decisions:
  - "Used Stripe Express for seller onboarding in Brazil (BR)"
  - "Implemented manual payout schedule for flexibility"
metrics:
  duration: 45 min
  completed_date: 2026-03-04
---

# Phase 05 Plan 02: Seller Onboarding Summary

Implemented the seller onboarding flow using Stripe Connect Express, allowing sellers to register their payment details and receive payouts for sales on the platform.

## Key Changes

### 1. Stripe Onboarding API Route
- Created `src/app/api/stripe/onboard/route.ts` to handle the onboarding logic.
- The route checks if a seller already has a `stripeAccountId`. If not, it creates a new **Stripe Express** account for the user.
- Generates a Stripe `account_link` (type: `account_onboarding`) and returns the URL for redirection.
- Restricted access to users with `SELLER` or `ADMIN` roles.

### 2. Payment Setup Dashboard Component
- Built `src/components/dashboard/seller/payment-setup.tsx` to provide a clear UI for sellers to connect their accounts.
- The component displays the current connection status (Not Connected, Pending, or Verified).
- Features a "Connect with Stripe" button that triggers the onboarding process and redirects the user to Stripe's hosted onboarding flow.
- Uses Lucide icons and Shadcn UI components for a consistent design.

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- [x] API route created and functional (logic-wise).
- [x] UI component implemented with status indicators.
- [x] User model updated with Stripe account IDs (handled in Phase 05-01 schema update).
- [x] Commits made for each task.
