import { db } from "@/lib/db";

/**
 * Real Notification Plugin implementation.
 * For now, this mimics an email send by logging to the console,
 * but it pulls real data from the database.
 */

export async function sendSellerNotification(orderId: string) {
  try {
    // 1. Fetch Order and Sub-orders (StoreOrders) with Store and User details
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        storeOrders: {
          include: {
            store: {
              include: {
                user: true, // The seller
              },
            },
            orderItems: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      console.error(`[NotificationPlugin] Order ${orderId} not found.`);
      return;
    }

    // 2. Notify each seller for their respective part of the order
    for (const storeOrder of order.storeOrders) {
      const seller = storeOrder.store.user;
      const sellerEmail = storeOrder.store.email || seller.email;
      const sellerName = storeOrder.store.name || seller.name || "Seller";

      if (!sellerEmail) {
        console.warn(`[NotificationPlugin] No email found for seller of store ${storeOrder.store.id}`);
        continue;
      }

      const itemsList = storeOrder.orderItems
        .map((item) => `- ${item.product.name} (x${item.quantity})`)
        .join("\n");

      // 3. Robust logging mimicking an email send
      console.log("--------------------------------------------------");
      console.log(`[NotificationPlugin] SENDING EMAIL TO: ${sellerEmail}`);
      console.log(`[NotificationPlugin] SUBJECT: New Order Received - #${order.id}`);
      console.log(`[NotificationPlugin] BODY:`);
      console.log(`Hello ${sellerName},`);
      console.log(`You have received a new order for your store "${storeOrder.store.name}".`);
      console.log(`Order ID: ${order.id}`);
      console.log(`Total for your store: $${storeOrder.subTotal.toString()}`);
      console.log(`\nItems:`);
      console.log(itemsList);
      console.log(`\nPlease log in to your dashboard to process the order.`);
      console.log("--------------------------------------------------");

      // Integration Point: In a production environment, we would use Resend here:
      /*
      if (process.env.RESEND_API_KEY) {
        // await resend.emails.send({ ... });
      }
      */
    }
  } catch (error) {
    console.error(`[NotificationPlugin] Error sending seller notification for order ${orderId}:`, error);
  }
}
