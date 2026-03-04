import { searchParamsParsers } from '@/lib/search-params';

export type SearchFilters = {
  q: string;
  category: string;
  minPrice: number | null;
  maxPrice: number | null;
  sort: string;
};

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
