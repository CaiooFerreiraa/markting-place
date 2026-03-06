import {
  type Order,
  type StoreOrder,
  type OrderItem,
  type Product,
  type Store,
  type ShippingAddress,
  type User,
  type Category,
  type Promotion,
  type Coupon,
  type ProductSubscription,
  OrderStatus,
  PaymentStatus,
  FulfillmentType,
  UserRole,
} from "@prisma/client";

export {
  type Order,
  type StoreOrder,
  type OrderItem,
  type Product,
  type Store,
  type ShippingAddress,
  type User,
  type Category,
  type Promotion,
  type Coupon,
  type ProductSubscription,
  OrderStatus,
  PaymentStatus,
  FulfillmentType,
  UserRole,
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
