import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { FulfillmentType, OrderStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { items, fulfillmentChoices, address } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // 1. Fetch current product data from DB to ensure prices are up to date
    const productIds = items.map((item: any) => item.id);
    const dbProducts = await db.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        priceRetail: true,
        storeId: true,
        name: true,
      }
    });

    // 2. Map and group items by store
    const storeGroups: Record<string, { items: any[], subtotal: number }> = {};
    let totalOrderAmount = 0;

    for (const item of items) {
      const dbProduct = dbProducts.find(p => p.id === item.id);
      if (!dbProduct) {
        throw new Error(`Product ${item.id} not found`);
      }

      const price = Number(dbProduct.priceRetail);
      const subtotal = price * item.quantity;
      totalOrderAmount += subtotal;

      if (!storeGroups[dbProduct.storeId]) {
        storeGroups[dbProduct.storeId] = { items: [], subtotal: 0 };
      }
      
      storeGroups[dbProduct.storeId].items.push({
        productId: dbProduct.id,
        quantity: item.quantity,
        price,
      });
      storeGroups[dbProduct.storeId].subtotal += subtotal;
    }

    // 3. Start Prisma Transaction
    const order = await db.$transaction(async (tx) => {
      // Create main Order
      const newOrder = await tx.order.create({
        data: {
          buyerId: session.user.id,
          totalAmount: totalOrderAmount,
          status: OrderStatus.PENDING,
          // Optional: Add shipping address if any delivery is selected
          ...(address ? {
            shippingAddress: {
              create: {
                street: address.street,
                city: address.city,
                state: address.state,
                zipCode: address.zipCode,
                number: address.number,
                complement: address.complement,
              }
            }
          } : {})
        }
      });

      // Create StoreOrders and OrderItems
      for (const [storeId, group] of Object.entries(storeGroups)) {
        const fulfillment = fulfillmentChoices?.[storeId] || FulfillmentType.PICKUP;
        
        const storeOrder = await tx.storeOrder.create({
          data: {
            orderId: newOrder.id,
            storeId,
            subtotal: group.subtotal,
            status: OrderStatus.PENDING,
            fulfillmentType: fulfillment,
          }
        });

        await tx.orderItem.createMany({
          data: group.items.map(item => ({
            storeOrderId: storeOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          }))
        });
      }

      return newOrder;
    });

    return NextResponse.json({ orderId: order.id }, { status: 201 });

  } catch (error: any) {
    console.error("[CREATE_ORDER_ERROR]", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
