export type HookName = 
  | "order.created" 
  | "order.paid" 
  | "product.created" 
  | "shipping.calculate";

export type PluginHandler<T = any> = (payload: T) => Promise<void | any>;

class PluginRegistry {
  private hooks: Map<HookName, PluginHandler[]> = new Map();

  /**
   * Register a handler for a specific hook
   */
  register(hook: HookName, handler: PluginHandler) {
    if (!this.hooks.has(hook)) {
      this.hooks.set(hook, []);
    }
    this.hooks.get(hook)?.push(handler);
    console.log(`[PluginRegistry] Registered handler for ${hook}`);
  }

  /**
   * Execute all handlers for a specific hook sequentially
   */
  async emit<T>(hook: HookName, payload: T): Promise<any[]> {
    const handlers = this.hooks.get(hook) || [];
    const results = [];

    for (const handler of handlers) {
      try {
        const result = await handler(payload);
        results.push(result);
      } catch (error) {
        console.error(`[PluginRegistry] Error in handler for ${hook}:`, error);
      }
    }

    return results;
  }
}

// Global instance for the application
export const pluginRegistry = new PluginRegistry();
