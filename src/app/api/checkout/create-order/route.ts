import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { FulfillmentType, OrderStatus } from "@/types/order";
import { pluginRegistry } from "@/lib/plugins/registry";
import { initPlugins } from "@/lib/plugins";

// Initialize plugins once
initPlugins();

interface CartItem {
  id: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { items, fulfillmentChoices, address, appliedCoupons } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // 1. Fetch current product data from DB to ensure prices are up to date
    const productIds = items.map((item: CartItem) => item.id);
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
    interface StoreItem {
      productId: string;
      quantity: number;
      price: number;
    }
    const storeGroups: Record<string, { items: StoreItem[], subtotal: number }> = {};
    let totalOrderAmount = 0;

    for (const item of items) {
      const dbProduct = dbProducts.find((p: any) => p.id === item.id);
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
    const order = await db.$transaction(async (tx: any) => {
      // Create main Order
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          totalAmount: totalOrderAmount,
          status: OrderStatus.PENDING,
          // Optional: Add shipping address if any delivery is selected
          ...(address ? {
            shippingAddress: {
              create: {
                street: address.street,
                city: address.city,
                state: address.state,
                zip: address.zipCode,
                number: address.number,
                complement: address.complement,
                district: address.district || "Centro", // Added missing field
              }
            }
          } : {})
        }
      });

      // Create StoreOrders and OrderItems
      interface CouponInput {
        storeId: string;
        couponId: string;
      }
      for (const [storeId, group] of Object.entries(storeGroups)) {
        const fulfillment = fulfillmentChoices?.[storeId] || FulfillmentType.PICKUP;

        let storeDiscount = 0;
        const storeCoupon = appliedCoupons?.find((c: CouponInput) => c.storeId === storeId);

        if (storeCoupon) {
          const coupon = await tx.coupon.findUnique({
            where: { id: storeCoupon.couponId, isActive: true }
          });

          if (coupon) {
            if (coupon.discountPercent) {
              storeDiscount = (group.subtotal * coupon.discountPercent) / 100;
            } else if (coupon.discountFixed) {
              storeDiscount = Math.min(Number(coupon.discountFixed), group.subtotal);
            }

            // Update usage count
            await tx.coupon.update({
              where: { id: coupon.id },
              data: { usageCount: { increment: 1 } }
            });
          }
        }

        const storeOrder = await tx.storeOrder.create({
          data: {
            orderId: newOrder.id,
            storeId,
            subTotal: group.subtotal - storeDiscount,
            status: OrderStatus.PENDING,
            fulfillmentType: fulfillment,
          }
        });

        await tx.orderItem.createMany({
          data: group.items.map(item => ({
            storeOrderId: storeOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.price,
          }))
        });
      }

      return newOrder;
    });

    // Emit event for plugins
    await pluginRegistry.emit("order.created", order);

    return NextResponse.json({ orderId: order.id }, { status: 201 });

  } catch (error) {
    console.error("[CREATE_ORDER_ERROR]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Something went wrong" }, { status: 500 });
  }
}
