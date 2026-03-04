# E2E Verification Checklist

This checklist defines the steps required to verify the complete marketplace flow, from seller onboarding to order fulfillment and notifications.

## 1. Seller Onboarding & Store Creation
- [ ] **Seller Registration**: Register a new user and select the "Seller" role during the wizard.
- [ ] **Store Setup**: Complete the store creation wizard (Address, Slug, Operating Hours).
- [ ] **Stripe Integration**: Ensure the user has a `stripeAccountId` in the `User` table after completing the onboarding (check DB directly).
- [ ] **Store Verification**: Verify that `storeVerified` is set to `true` if applicable.

## 2. Inventory Management
- [ ] **Product Creation**: Create at least 3 products for the store.
- [ ] **Images**: Upload images and verify they display correctly in the store profile.
- [ ] **Stock**: Set stock levels and verify they decrement after a purchase.

## 3. Buyer Experience & Cart
- [ ] **Multi-vendor Cart**: Add products from different sellers to the cart.
- [ ] **Quantity Management**: Update quantities in the cart and verify total calculation.
- [ ] **Session Persistence**: Ensure cart survives page refreshes.

## 4. Coupons & Promotions
- [ ] **Coupon Creation**: Create a coupon for a specific store.
- [ ] **Coupon Validation**: Apply the coupon in the cart.
    - [ ] Verify discount is applied only to the correct store's items.
    - [ ] Verify minimum order amount constraint works.
    - [ ] Verify expiry date constraint works.

## 5. Checkout & Payment
- [ ] **Shipping Address**: Provide a valid shipping address during checkout.
- [ ] **Stripe Checkout Simulation**: Complete the checkout using Stripe Test Mode.
- [ ] **Payment Split**: Verify (via Stripe Dashboard or logs) that the payment is correctly split between the marketplace and the sellers.
- [ ] **Order Creation**: Verify that an `Order` and corresponding `StoreOrder` records are created in the database.

## 6. Notifications & Plugins
- [ ] **Order Paid Trigger**: Verify that the "order.paid" event is triggered after successful payment.
- [ ] **Seller Notification**: Check the server logs to confirm that `sendSellerNotification` was called with the correct seller email and order details.
- [ ] **Audit Logs**: Verify that the `registerAuditLogPlugin` logged the "order.created" event.

## 7. Post-Purchase
- [ ] **Order History**: View the order in the Buyer's profile.
- [ ] **Seller Dashboard**: View the new order in the Seller's dashboard.
- [ ] **Status Updates**: Update the order status (e.g., to SHIPPED) and verify the change in the UI.
