"use client";

import { useQueryState } from 'nuqs';
import { searchParamsParsers } from '@/lib/search-params';
import type { Category } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDebounce } from '@/hooks/use-debounce';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  categories: Category[];
}

export function FilterSidebar({ categories }: FilterSidebarProps) {
  const [category, setCategory] = useQueryState('category', searchParamsParsers.category);
  const [minPrice, setMinPrice] = useQueryState('minPrice', searchParamsParsers.minPrice);
  const [maxPrice, setMaxPrice] = useQueryState('maxPrice', searchParamsParsers.maxPrice);

  const [localMin, setLocalMin] = useState(minPrice?.toString() ?? '');
  const [localMax, setLocalMax] = useState(maxPrice?.toString() ?? '');

  const debouncedMin = useDebounce(localMin, 500);
  const debouncedMax = useDebounce(localMax, 500);

  useEffect(() => {
    const val = debouncedMin === '' ? null : parseInt(debouncedMin);
    if (!isNaN(val as any)) setMinPrice(val);
  }, [debouncedMin, setMinPrice]);

  useEffect(() => {
    const val = debouncedMax === '' ? null : parseInt(debouncedMax);
    if (!isNaN(val as any)) setMaxPrice(val);
  }, [debouncedMax, setMaxPrice]);

  const toggleCategory = (slug: string) => {
    if (category === slug) {
      setCategory(null);
    } else {
      setCategory(slug);
    }
  };

  const clearFilters = () => {
    setCategory(null);
    setMinPrice(null);
    setMaxPrice(null);
    setLocalMin('');
    setLocalMax('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold uppercase tracking-tight">Filtros</h2>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-0 text-xs underline decoration-primary">
          Limpar tudo
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          Categorias
          {category && (
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          )}
        </h3>
        <ScrollArea className="h-[250px] pr-4">
          <div className="space-y-1">
            {categories.map((c: any) => (
              <button
                key={c.id}
                onClick={() => toggleCategory(c.slug)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 group flex items-center justify-between",
                  category === c.slug
                    ? "bg-primary text-primary-foreground font-medium shadow-sm"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="truncate">{c.name}</span>
                {category === c.slug && (
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Preço</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="min-price" className="text-xs">Mínimo</Label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
              <Input
                id="min-price"
                type="number"
                placeholder="0"
                value={localMin}
                onChange={(e) => setLocalMin(e.target.value)}
                className="pl-7 h-8 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="max-price" className="text-xs">Máximo</Label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
              <Input
                id="max-price"
                type="number"
                placeholder="∞"
                value={localMax}
                onChange={(e) => setLocalMax(e.target.value)}
                className="pl-7 h-8 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
