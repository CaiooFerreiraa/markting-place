import { pluginRegistry } from "./registry";

/**
 * Example Plugin: Sends a mock notification to the Seller when a new order is paid.
 */
export function registerSellerNotificationPlugin() {
  pluginRegistry.register("order.paid", async (orderId: string) => {
    console.log(`[NotificationPlugin] Order ${orderId} has been PAID! Sending notification to seller...`);
    // Here we would integrate with Resend or a push notification service.
  });
}

/**
 * Example Plugin: Auto-generates a log for internal auditing.
 */
export function registerAuditLogPlugin() {
  pluginRegistry.register("order.created", async (order: any) => {
    console.log(`[AuditPlugin] New order created: ${order.id} for user ${order.userId}`);
  });
}

/**
 * Initialize all active plugins
 */
export function initPlugins() {
  registerSellerNotificationPlugin();
  registerAuditLogPlugin();
  console.log("[Plugins] All plugins initialized.");
}
