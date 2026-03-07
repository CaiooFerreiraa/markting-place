import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import type { StoreOrder, OrderItem, Product, Store, User } from '@/types/order';

export const dynamic = 'force-dynamic';

type StoreOrderWithDetails = StoreOrder & {
  store: Store & {
    user: User;
  };
  orderItems: (OrderItem & {
    product: Product;
  })[];
};

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return new NextResponse('Order ID is required', { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        storeOrders: {
          include: {
            store: {
              include: {
                user: true,
              },
            },
            orderItems: {
              include: {
                product: true,
              },
            },
          },
        },
        user: true,
      },
    });

    if (!order) {
      return new NextResponse('Order not found', { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (order.paymentStatus === 'PAID') {
      return new NextResponse('Order already paid', { status: 400 });
    }

    const storeOrder = order.storeOrders[0] as StoreOrderWithDetails | undefined;
    if (!storeOrder) {
      return new NextResponse('No store orders found', { status: 400 });
    }

    const sellerStripeAccountId = storeOrder.store.user.stripeAccountId;

    if (!sellerStripeAccountId) {
      return new NextResponse('Seller Stripe account not configured', { status: 400 });
    }

    const lineItems = order.storeOrders.flatMap((so: StoreOrderWithDetails) =>
      so.orderItems.map((item: any) => ({
        price_data: {
          currency: 'brl',
          product_data: {
            name: item.product.name,
            images: item.product.images.length > 0 ? [item.product.images[0]] : [],
          },
          unit_amount: Math.round(Number(item.priceAtPurchase) * 100),
        },
        quantity: item.quantity,
      }))
    );

    // Add shipping fee if any
    const totalShippingFee = order.storeOrders.reduce((acc: number, so: any) => acc + Number(so.shippingFee), 0);
    if (totalShippingFee > 0) {
      lineItems.push({
        price_data: {
          currency: 'brl',
          product_data: {
            name: 'Taxa de Entrega',
          },
          unit_amount: Math.round(totalShippingFee * 100),
        },
        quantity: 1,
      } as any);
    }

    // Calculate commission (application_fee_amount)
    // PAYM-01: 10% commission as an example
    const commissionRate = 0.1; // 10%
    const totalAmountCents = Math.round(Number(order.totalAmount) * 100);
    const applicationFeeAmount = Math.round(totalAmountCents * commissionRate);

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/checkout/success?orderId=${order.id}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/checkout/cancel?orderId=${order.id}`,
      customer_email: session.user.email!,
      client_reference_id: order.id,
      metadata: {
        orderId: order.id,
      },
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: sellerStripeAccountId,
        },
        metadata: {
          orderId: order.id,
        },
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error('[STRIPE_SESSION_CREATE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
