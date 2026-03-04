export type HookName = 
  | "order.created" 
  | "order.paid" 
  | "product.created" 
  | "shipping.calculate";

export type PluginHandler<T = any> = (payload: T) => Promise<void | any>;

export interface Plugin {
  name: string;
  setup: () => void;
}
