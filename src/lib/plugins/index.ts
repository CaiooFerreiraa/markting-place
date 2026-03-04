import { pluginRegistry } from "./registry";
import { sendSellerNotification } from "./notifications";
import { Plugin } from "./types";

/**
 * Real Notification Plugin: Sends an email log to the Seller when a new order is paid.
 */
export const notificationPlugin: Plugin = {
  name: "Seller Notifications",
  setup: () => {
    pluginRegistry.register("order.paid", async (orderId: string) => {
      console.log(`[NotificationPlugin] Order ${orderId} has been PAID! Notifying sellers...`);
      await sendSellerNotification(orderId);
    });
  }
};

/**
 * Example Plugin: Auto-generates a log for internal auditing.
 */
export const auditLogPlugin: Plugin = {
  name: "Audit Log",
  setup: () => {
    pluginRegistry.register("order.created", async (order: any) => {
      console.log(`[AuditPlugin] New order created: ${order.id} for user ${order.userId}`);
    });
  }
};

/**
 * Initialize all active plugins
 */
export function initPlugins() {
  notificationPlugin.setup();
  auditLogPlugin.setup();
  console.log("[Plugins] All plugins initialized.");
}
