import { searchParamsParsers } from '@/lib/search-params';
import { InferSerializerFullType } from 'nuqs/server';

export type SearchFilters = InferSerializerFullType<typeof searchParamsParsers>;

export interface SearchResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DiscoveryProduct {
  id: string;
  name: string;
  description: string | null;
  priceRetail: number;
  images: string[];
  storeName: string;
  categoryName: string;
  createdAt: Date;
}
