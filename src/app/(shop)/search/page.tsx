import { db } from "@/lib/db";
import { searchParamsCache } from "@/lib/search-params";
import { SearchParams } from "nuqs/server";
import { FilterSidebar } from "@/components/discovery/filter-sidebar";
import { SortDropdown } from "@/components/discovery/sort-dropdown";
import { Prisma } from "@prisma/client";

interface SearchPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, category, minPrice, maxPrice, sort } = await searchParamsCache.parse(searchParams);

  const where: Prisma.ProductWhereInput = {
    AND: [
      q ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
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

  const orderBy: Prisma.ProductOrderByWithRelationInput = 
    sort === 'price-asc' ? { priceRetail: 'asc' } :
    sort === 'price-desc' ? { priceRetail: 'desc' } :
    { createdAt: 'desc' };

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
            <div className="text-center py-20 border rounded-lg bg-muted/20">
              <p className="text-lg text-muted-foreground">Nenhum produto encontrado com os filtros selecionados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg overflow-hidden group">
                  <div className="aspect-square bg-muted relative">
                    {product.images[0] ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        Sem imagem
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{product.store.name}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-bold">
                        R$ {Number(product.priceRetail).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                        {product.category.name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
