import { db } from "@/lib/db";
import { searchParamsCache } from "@/lib/search-params";
import { SearchParams } from "nuqs/server";
import { FilterSidebar } from "@/components/discovery/filter-sidebar";
import { SortDropdown } from "@/components/discovery/sort-dropdown";
import { ProductWithRelations } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Tag, FilterX, SlidersHorizontal, Search } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface SearchPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, category, minPrice, maxPrice, sort } = await searchParamsCache.parse(searchParams);

  const where = {
    AND: [
      q ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' as const } },
          { description: { contains: q, mode: 'insensitive' as const } },
        ],
      } : {},
      category ? { category: { slug: category } } : {},
      {
        priceRetail: {
          gte: minPrice ?? undefined,
          lte: maxPrice ?? undefined,
        },
      },
    ],
  };

  const orderBy =
    sort === 'price-asc' ? { priceRetail: 'asc' as const } :
      sort === 'price-desc' ? { priceRetail: 'desc' as const } :
        { createdAt: 'desc' as const };

  const products = await db.product.findMany({
    where,
    orderBy,
    include: {
      category: true,
      store: true,
    },
  }) as unknown as ProductWithRelations[];

  const categories = await db.category.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="hidden md:block w-64 shrink-0">
          <FilterSidebar categories={categories} />
        </aside>

        <main className="flex-1">
          {/* Mobile-only Search Bar */}
          <div className="md:hidden mb-6">
            <form action="/search" method="GET" className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                name="q"
                defaultValue={q ?? ""}
                placeholder="O que você está procurando?"
                className="pl-10 h-11 w-full bg-muted/60 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </form>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {q ? `Resultados para "${q}"` : 'Todos os produtos'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {products.length} {products.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filtros
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                    <SheetHeader className="mb-6">
                      <SheetTitle>Filtros</SheetTitle>
                    </SheetHeader>
                    <FilterSidebar categories={categories} />
                  </SheetContent>
                </Sheet>
              </div>
              <SortDropdown />
            </div>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-6 border-2 border-dashed rounded-xl bg-muted/30">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FilterX className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Ops! Nada por aqui.</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                Não encontramos produtos que correspondam à sua busca. Tente ajustar os filtros ou pesquisar por outro termo.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {products.map((product: ProductWithRelations) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group block"
                >
                  <Card className="overflow-hidden border-muted hover:border-primary/50 transition-all duration-300 hover:shadow-xl h-full flex flex-col">
                    <div className="aspect-square bg-muted relative overflow-hidden">
                      {product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          Sem imagem
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-background/80 backdrop-blur-md border-none font-medium">
                          {product.category.name}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm sm:text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-1">
                          {product.name}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground mb-4">
                          <Store className="h-3 w-3 mr-1" />
                          <span className="truncate">{product.store.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-2">
                        <span className="text-base sm:text-xl font-extrabold text-primary">
                          {formatCurrency(Number(product.priceRetail))}
                        </span>
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Tag className="h-4 w-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
