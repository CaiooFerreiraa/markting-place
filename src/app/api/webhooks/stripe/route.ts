import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import Stripe from 'stripe';
import { pluginRegistry } from '@/lib/plugins/registry';
import { initPlugins } from '@/lib/plugins';

initPlugins();

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return new NextResponse('Webhook secret not configured', { status: 400 });
    }

    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === 'checkout.session.completed') {
    const userId = session.metadata?.userId;
    const type = session.metadata?.type;

    if (type === 'subscription' && userId) {
      try {
        await db.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: 'ACTIVE',
          },
        });
        return new NextResponse(null, { status: 200 });
      } catch (error: any) {
        console.error('[WEBHOOK_SUBSCRIPTION_UPDATE_ERROR]', error);
        return new NextResponse('Error updating user subscription', { status: 500 });
      }
    }

    const orderId = session.metadata?.orderId;

    if (!orderId) {
      return new NextResponse('Order ID missing in metadata', { status: 400 });
    }

    try {
      await db.$transaction([
        db.order.update({
          where: { id: orderId },
          data: {
            status: 'PAID',
            paymentStatus: 'PAID',
          },
        }),
        db.storeOrder.updateMany({
          where: { orderId: orderId },
          data: {
            status: 'PAID',
          },
        }),
      ]);

      // Emit event for plugins
      await pluginRegistry.emit("order.paid", orderId);
    } catch (error: any) {
      console.error('[WEBHOOK_UPDATE_ERROR]', error);
      return new NextResponse('Error updating order', { status: 500 });
    }
  }

  return new NextResponse(null, { status: 200 });
}
