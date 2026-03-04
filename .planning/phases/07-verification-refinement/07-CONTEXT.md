# CONTEXT: Phase 07 - Verification & Refinement

## Goal
Verify the end-to-end flow of the marketplace, implement a real notification plugin for sellers, and refine the UI/UX for a production-ready state.

## Decisions
- **E2E Flow**: We must verify: Seller Registration -> Store Creation (Auto Stripe) -> Product Creation -> Buyer Cart -> Coupon Apply -> Checkout -> Payment Split -> Seller Notification.
- **Notifications**: Implement real email notifications using a plugin pattern. Use `resend` as the provider (user decision from context, or OpenCode's discretion if not specified - I'll use a generic interface first).
- **UI Audit**: Focus on error states, empty states, and mobile responsiveness in critical paths (Checkout, Seller Wizard, Dashboard).

## Success Criteria
1. Full checkout flow successfully completes with coupon and split payment.
2. Seller receives an email/notification when an order is paid.
3. No critical UI glitches in the store wizard or checkout page on mobile/desktop.
4. Stripe account creation is verified in the database after store creation.
