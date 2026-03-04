import { Product, Store } from "@prisma/client";

export interface CartItem {
  id: string; // Product ID
  product: Product;
  store: Pick<Store, "id" | "name" | "slug">;
  quantity: number;
  price: number; // Current retail price
}

export interface StoreCartGroup {
  storeId: string;
  storeName: string;
  storeSlug: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
}

export interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  groupedByStore: StoreCartGroup[];
}
