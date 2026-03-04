"use client";

import { useQueryState } from 'nuqs';
import { searchParamsParsers } from '@/lib/search-params';
import { Category } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDebounce } from '@/hooks/use-debounce';
import { useEffect, useState } from 'react';

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
        <h3 className="text-sm font-medium">Categorias</h3>
        <ScrollArea className="h-[200px] border rounded-md p-2">
          <div className="space-y-2">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`cat-${c.id}`} 
                  checked={category === c.slug}
                  onCheckedChange={() => toggleCategory(c.slug)}
                />
                <Label 
                  htmlFor={`cat-${c.id}`}
                  className="text-sm font-normal cursor-pointer select-none truncate"
                >
                  {c.name}
                </Label>
              </div>
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
