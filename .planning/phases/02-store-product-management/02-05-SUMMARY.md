---
phase: 02-store-product-management
plan: "05"
subsystem: Product Management
tags: [notifications, back-in-stock, api, nextjs, prisma]
requirements: [PROD-09]
tech-stack: [Next.js, Prisma, Zod, Sonner, Tailwind CSS]
key-files: [src/app/api/products/notify/route.ts, src/components/product/stock-notifier.tsx]
decisions:
  - "Implemented a find/create fallback for product subscriptions to ensure uniqueness without a unique constraint on [email, productId] in the schema"
  - "Integrated notifications directly into the dashboard for out-of-stock items, capturing buyer interest immediately"
  - "Used a separate StockNotifier component for better modularity and potential reuse on product detail pages"
metrics:
  duration: "15m"
  completed_date: "2026-03-04"
---

# Phase 02 Plan 05: Back-in-stock Notifications Summary

## Summary
Implemented the backend and UI components for back-in-stock notifications, allowing buyers to subscribe to alerts for out-of-stock items. This feature enhances future sales by capturing demand when immediate purchases are unavailable.

## Key Changes
- **Back-in-stock API**: Created `POST /api/products/notify` with Zod validation to handle e-mail and product ID registrations.
- **Stock Notifier Component**: Built a user-friendly form that appears on products with `stock: 0`, allowing buyers to register their interest.
- **Integration**: Integrated the `StockNotifier` into the `ProductList` component to ensure that all out-of-stock items have a clear path for future buyer engagement.

## Deviations from Plan
### Auto-fixed Issues
- **Rule 2 - Correctness**: Implemented a find/create fallback in the API to prevent duplicate subscription records for the same e-mail and product, as the schema currently lacks a unique constraint for this combination.

## Self-Check: PASSED
- [x] POST /api/products/notify successfully stores records.
- [x] StockNotifier component handles form submission and loading states correctly.
- [x] Component appears only when stock is 0.
- [x] Commit hash: `9b6058b`
