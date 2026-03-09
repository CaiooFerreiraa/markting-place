"use client";

import { useQueryState } from 'nuqs';
import { searchParamsParsers } from '@/lib/search-params';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SortDropdown() {
  const [sort, setSort] = useQueryState('sort', searchParamsParsers.sort);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium hidden sm:inline-block">Ordenar por:</span>
      <Select value={sort ?? 'newest'} onValueChange={setSort}>
        <SelectTrigger className="w-[140px] sm:w-[180px] h-9 text-sm">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Mais recentes</SelectItem>
          <SelectItem value="price-asc">Menor preço</SelectItem>
          <SelectItem value="price-desc">Maior preço</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
