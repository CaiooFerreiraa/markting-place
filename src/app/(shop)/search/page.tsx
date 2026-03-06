import { db } from "@/lib/db";
import { searchParamsCache } from "@/lib/search-params";
import { SearchParams } from "nuqs/server";
import { FilterSidebar } from "@/components/discovery/filter-sidebar";
import { SortDropdown } from "@/components/discovery/sort-dropdown";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Tag, FilterX } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

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
  });

  const categories = await db.category.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <FilterSidebar categories={categories} />
        </aside>

        <main className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">
              {q ? `Resultados para "${q}"` : 'Todos os produtos'}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({products.length} {products.length === 1 ? 'produto' : 'produtos'})
              </span>
            </h1>
            <SortDropdown />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
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
                        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-1">
                          {product.name}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground mb-4">
                          <Store className="h-3 w-3 mr-1" />
                          <span className="truncate">{product.store.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-2">
                        <span className="text-xl font-extrabold text-primary">
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
