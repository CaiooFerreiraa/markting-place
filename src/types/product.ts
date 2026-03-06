import { Decimal } from "@prisma/client/runtime/library";

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string | null;
  priceRetail: number | Decimal;
  priceWholesale: number | Decimal | null;
  minWholesaleQty: number | null;
  stock: number;
  images: string[];
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductWithRelations extends Product {
  store: {
    id: string;
    name: string;
    slug: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductSubscription {
  id: string;
  email: string;
  productId: string;
  notified: boolean;
  createdAt: Date;
}

export type PriceType = "RETAIL" | "WHOLESALE";

export interface PriceLogic {
  currentPrice: number | Decimal;
  priceType: PriceType;
  quantityNeededForWholesale?: number;
}
