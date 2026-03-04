import { 
  Order, 
  StoreOrder, 
  OrderItem, 
  Product, 
  Store, 
  ShippingAddress,
  OrderStatus,
  PaymentStatus,
  FulfillmentType
} from "@prisma/client";

// Define aliases for convenience
export { OrderStatus, PaymentStatus, FulfillmentType };

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
