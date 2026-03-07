import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY && !process.env.CI) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_for_build', {
  apiVersion: '2025-01-27.acacia' as any,
  appInfo: {
    name: 'Marketing Place VDC',
    version: '0.1.0',
  },
});
