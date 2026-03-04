"use client";

import { useQueryState } from 'nuqs';
import { searchParamsParsers } from '@/lib/search-params';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { useEffect, useState } from 'react';

export function SearchBar() {
  const [q, setQ] = useQueryState('q', searchParamsParsers.q);
  const [localQ, setLocalQ] = useState(q ?? '');
  const debouncedQ = useDebounce(localQ, 500);

  useEffect(() => {
    setQ(debouncedQ === '' ? null : debouncedQ);
  }, [debouncedQ, setQ]);

  return (
    <div className="relative w-full max-w-lg">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Buscar produtos ou lojas..."
        value={localQ}
        onChange={(e) => setLocalQ(e.target.value)}
        className="pl-10 h-10 w-full bg-background/50 focus:bg-background transition-colors"
      />
    </div>
  );
}
