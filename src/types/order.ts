import type {
  Order,
  StoreOrder,
  OrderItem,
  Product,
  Store,
  ShippingAddress,
} from "@prisma/client";

export enum FulfillmentType {
  PICKUP = "PICKUP",
  DELIVERY = "DELIVERY",
}

export enum OrderStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  PICKED_UP = "PICKED_UP",
  CANCELED = "CANCELED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export type {
  Order,
  StoreOrder,
  OrderItem,
  Product,
  Store,
  ShippingAddress,
};


export interface OrderItemWithProduct extends OrderItem {
  product: Product;
}

export interface StoreOrderWithDetails extends StoreOrder {
  store: Store;
  orderItems: OrderItemWithProduct[];
}

export interface OrderWithDetails extends Order {
  shippingAddress: ShippingAddress | null;
  storeOrders: StoreOrderWithDetails[];
}

// Business logic types
export type FulfillmentStatus = OrderStatus;

export const ORDER_STATUS_MAP: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Pendente",
  [OrderStatus.PAID]: "Pago",
  [OrderStatus.SHIPPED]: "Enviado",
  [OrderStatus.DELIVERED]: "Entregue",
  [OrderStatus.PICKED_UP]: "Retirado",
  [OrderStatus.CANCELED]: "Cancelado",
};
