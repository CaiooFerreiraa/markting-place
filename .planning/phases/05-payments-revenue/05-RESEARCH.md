# Phase 05: Payments & Revenue - Research

**Researched:** 2026-03-04
**Domain:** Stripe Connect Marketplace Integration (Brazil/VDC Context)
**Confidence:** HIGH

## Summary

This phase implements the financial core of the Marketplace VDC, enabling sellers to receive payments and the platform to collect revenue. For the Brazilian market, **Stripe Connect Express** is the recommended path as it balances onboarding ease (crucial for local shops in Vitória da Conquista) with platform control over funds. 

The architecture will support two revenue models:
1. **Transaction Fee (Commission):** Deducted automatically during checkout using Stripe Connect "Application Fees".
2. **Subscription Model:** Monthly recurring billing for sellers to keep their stores active, managed via Stripe Billing.

The integration will use **Stripe Checkout (Embedded/Hosted)** to ensure PCI compliance while maintaining a seamless user experience. Webhooks will be the source of truth for order status transitions (PENDING -> PAID).

**Primary recommendation:** Use Stripe Connect Express with "Destination Charges" for transaction fees, and Stripe Billing for monthly seller subscriptions.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PAYM-01 | Platform supports transaction fee model | Supported via Stripe Connect Application Fees on Destination Charges. |
| PAYM-02 | Platform supports monthly subscription model | Supported via Stripe Billing (Subscriptions) for Seller accounts. |
| PAYM-03 | Seller can choose payment model | Research confirms both models can coexist in the same platform. |
| PAYM-04 | Checkout integrates payment processor | Verified Stripe Checkout support for Next.js 15 and Connect. |
| PAYM-05 | Order payment status is tracked | Webhook handling for `checkout.session.completed` and `invoice.paid`. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `stripe` | ^14.0.0+ | Server-side API communication | Official SDK, typed, robust. |
| `@stripe/stripe-js` | ^3.0.0+ | Client-side loading of Stripe.js | Ensures PCI compliance (no card data hits our server). |
| `@stripe/react-stripe-js` | ^2.0.0+ | React components for Stripe | Optimized for Next.js/React hydration. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| `svix` | (optional) | Webhook verification helper | If manually verifying signatures is too complex. |
| `micro` | (optional) | Body parsing for webhooks | Next.js API routes often need raw body for Stripe signature check. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Stripe Connect Express | Connect Custom | Custom offers 100% white-label but adds massive KYC/UI complexity. |
| Stripe Connect Express | Connect Standard | Standard is easiest but platform has less control over funds and branding. |
| Mercado Pago | - | Mercado Pago is huge in Brazil but Stripe's Marketplace/Connect DX is superior for complex splits. |

**Installation:**
```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── api/
│   │   ├── webhooks/
│   │   │   └── stripe/route.ts  # Source of truth for status updates
│   │   └── checkout/route.ts    # Creates Stripe Sessions
├── lib/
│   └── stripe.ts                # Stripe client singleton
├── components/
│   └── checkout/                # Checkout buttons and UI
```

### Pattern 1: Destination Charges (Transaction Fee)
**What:** Create a charge on the platform and immediately transfer funds to the connected seller, minus a fee.
**When to use:** Every marketplace transaction where the platform takes a cut.
**Example:**
```typescript
// src/app/api/checkout/route.ts
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: [...],
  payment_intent_data: {
    application_fee_amount: 500, // R$ 5,00 in cents
    transfer_data: {
      destination: sellerStripeAccountId,
    },
  },
  success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${origin}/cart`,
});
```

### Pattern 2: Stripe Billing (Seller Subscriptions)
**What:** Create a Subscription object for the Seller's `User` record.
**When to use:** Recurring platform access fees.
**Prerequisite:** Seller must be registered as a Stripe `Customer` (separate from their `Account` ID).

### Anti-Patterns to Avoid
- **Saving Credit Cards in DB:** NEVER store raw card numbers, CVV, or expiry dates. Use Stripe tokens/IDs only.
- **Syncing Status via Redirects:** Don't trust the `success_url` redirect to update your database. Only use Webhooks.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| KYC/Onboarding | Custom forms for CNPJ/CPF | Stripe Connect Onboarding | Handling sensitive IDs and verification is high risk. |
| Subscription Logic | Custom cron jobs for billing | Stripe Billing | Handles renewals, failures, and prorations automatically. |
| Payout Schedules | Manual bank transfers | Stripe Payouts | Regulated financial movement is complex; let Stripe handle it. |

## Common Pitfalls

### Pitfall 1: Webhook Race Conditions
**What goes wrong:** The user is redirected to `success_url` before the webhook processes.
**How to avoid:** Show a "Processing" state on the success page and poll the DB or use WebSockets/Server-Sent Events.

### Pitfall 2: Environment Mismatch
**What goes wrong:** Webhooks from Test Mode hitting Production DB or vice versa.
**How to avoid:** Strict env var validation and using separate Stripe Accounts/Keys for `development` and `production`.

### Pitfall 3: Connect Account Onboarding
**What goes wrong:** Sellers try to sell before completing KYC.
**How to avoid:** Check `charges_enabled` and `details_submitted` flags on the Stripe Account before allowing product listings.

## User Setup Required (Dashboard Config)

1. **Enable Connect:** Go to Stripe Dashboard -> Connect -> Get Started.
2. **Branding:** Set platform name and colors in Settings -> Connect -> Branding.
3. **Webhook Secret:** Create a webhook endpoint for `https://your-domain.com/api/webhooks/stripe` and select events:
   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.deleted`
   - `account.updated`
4. **Environment Variables:**
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## Sources

### Primary (HIGH confidence)
- [Stripe Connect Guide](https://docs.stripe.com/connect) - General marketplace architecture.
- [Stripe Connect Brazil Pricing](https://stripe.com/br/connect/pricing) - Confirmed Express/Custom availability.
- [Stripe Billing Guide](https://docs.stripe.com/billing) - Subscription implementation.

### Secondary (MEDIUM confidence)
- [Next.js 15 Webhook Patterns](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) - Verified raw body handling for signature verification.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Stripe is the industry standard for Next.js.
- Architecture: HIGH - Destination charges are the "blessed" way for marketplaces.
- Pitfalls: HIGH - Common issues with webhooks and KYC are well-documented.

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (Stripe API updates are frequent but fundamental Connect patterns are stable).
