import { auth } from '@/auth';
import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'SELLER') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    if (!user.stripeCustomerId) {
      return new NextResponse('Stripe customer ID not found', { status: 404 });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active',
    });

    if (subscriptions.data.length > 0) {
      return NextResponse.json({ hasActiveSubscription: true });
    } else {
      return NextResponse.json({ hasActiveSubscription: false });
    }
  } catch (error: any) {
    console.error('[STRIPE_GET_SUBSCRIPTION]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'SELLER') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });

      customerId = customer.id;

      await db.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const priceId = process.env.STRIPE_MONTHLY_PRICE_ID;

    if (!priceId) {
      return new NextResponse('Stripe Price ID not configured', { status: 500 });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/seller?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/seller?canceled=true`,
      metadata: {
        userId: user.id,
        type: 'subscription',
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error('[STRIPE_SUBSCRIBE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
