import type {
  Order,
  StoreOrder,
  OrderItem,
  Product,
  Store,
  ShippingAddress,
  User,
} from "@prisma/client";

import {
  OrderStatus,
  PaymentStatus,
  FulfillmentType,
} from "@prisma/client";

import { Decimal } from "@prisma/client/runtime/library";

export {
  type Order,
  type StoreOrder,
  type OrderItem,
  type Product,
  type Store,
  type ShippingAddress,
  OrderStatus,
  PaymentStatus,
  FulfillmentType,
};

export type OrderItemWithProduct = OrderItem & {
  product: Product;
};

export type StoreOrderWithDetails = StoreOrder & {
  store: Store;
  orderItems: OrderItemWithProduct[];
  order: Order & { user: User };
};

export type OrderWithDetails = Order & {
  shippingAddress: ShippingAddress | null;
  storeOrders: StoreOrderWithDetails[];
};

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
