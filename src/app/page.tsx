import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag, ArrowRight, Store as StoreIcon, Star, Car, Smartphone, Wrench, Shirt, Dumbbell, Sofa, Laptop, Home as HomeIcon, Headphones, LayoutGrid, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

async function getFeaturedProducts() {
  return await db.product.findMany({
    take: 8,
    include: {
      store: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

async function getRecentStores() {
  return await db.store.findMany({
    take: 4,
    orderBy: {
      createdAt: 'desc'
    }
  });
}

async function getCategories() {
  return await db.category.findMany({
    take: 12,
    orderBy: {
      name: 'asc'
    }
  });
}

export default async function Home() {
  const [products, stores, categories] = await Promise.all([
    getFeaturedProducts(),
    getRecentStores(),
    getCategories()
  ]);

  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('carro') || n.includes('moto') || n.includes('veículo')) return <Car className="h-8 w-8 text-primary" />;
    if (n.includes('celular') || n.includes('smartphone') || n.includes('telefone')) return <Smartphone className="h-8 w-8 text-primary" />;
    if (n.includes('ferramenta')) return <Wrench className="h-8 w-8 text-primary" />;
    if (n.includes('roupa') || n.includes('moda') || n.includes('bolsa') || n.includes('calçado')) return <Shirt className="h-8 w-8 text-primary" />;
    if (n.includes('esporte') || n.includes('fitness')) return <Dumbbell className="h-8 w-8 text-primary" />;
    if (n.includes('casa') || n.includes('móvel') || n.includes('decoração') || n.includes('eletrodoméstico')) return <Sofa className="h-8 w-8 text-primary" />;
    if (n.includes('informática') || n.includes('computador')) return <Laptop className="h-8 w-8 text-primary" />;
    if (n.includes('imóvel') || n.includes('imóveis')) return <HomeIcon className="h-8 w-8 text-primary" />;
    if (n.includes('áudio') || n.includes('eletrônico') || n.includes('fone')) return <Headphones className="h-8 w-8 text-primary" />;
    return <LayoutGrid className="h-8 w-8 text-primary" />;
  };

  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-muted/30 py-20 px-4 overflow-hidden border-b">
        <div className="container mx-auto relative z-10">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-4 px-3 py-1 text-sm font-medium">
              Vitória da Conquista & Região 📍
            </Badge>
            <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl mb-6">
              O Marketplace da sua <span className="text-primary">cidade.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Encontre produtos das melhores lojas físicas de Conquista, com a conveniência de comprar online e retirar na hora ou receber em casa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="px-8 py-7 text-lg rounded-full">
                <Link href="/search">Começar a Comprar</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-7 text-lg rounded-full">
                <Link href="/register/seller">Vender no Marketplace</Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Background Decorative Element */}
        <div className="absolute right-0 top-0 w-1/3 h-full bg-primary/5 -skew-x-12 transform translate-x-1/2 hidden lg:block" />
      </section>

      {/* Categories */}
      <section className="py-12 px-4 container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Categorias</h2>
          <Link href="/search" className="text-sm font-medium text-primary hover:underline">
            Mostrar todas as categorias
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.length === 0 ? (
            <p className="text-muted-foreground col-span-full">Nenhuma categoria encontrada.</p>
          ) : (
            categories.map((category: any) => (
              <Link key={category.id} href={`/search?category=${category.slug}`}>
                <Card className="flex items-center hover:border-primary/50 transition-colors shadow-sm cursor-pointer h-24 overflow-hidden group">
                  <div className="w-1/3 h-full bg-muted/20 flex flex-col items-center justify-center border-r group-hover:bg-primary/5 transition-colors">
                    {getCategoryIcon(category.name)}
                  </div>
                  <div className="w-2/3 px-4 py-2">
                    <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {category.name}
                    </h3>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 px-4 container mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Novidades Fresquinhas</h2>
            <p className="text-muted-foreground mt-2">Os últimos produtos adicionados pelas lojas locais.</p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/search" className="flex items-center gap-2">
              Ver tudo <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {products.length === 0 ? (
          <div className="bg-muted/20 rounded-xl py-20 text-center border-2 border-dashed">
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground">Ainda não temos produtos cadastrados. <Link href="/register/seller" className="text-primary hover:underline">Seja o primeiro vendedor!</Link></p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {products.map((product: any) => (
              <Card key={product.id} className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-background">
                <Link href={`/product/${product.id}`}>
                  <CardHeader className="p-0">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground text-xs">Sem foto</div>
                      )}
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-white/90 text-black hover:bg-white border-none shadow-sm">Novo</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      {product.store.name}
                    </p>
                    <CardTitle className="text-sm sm:text-base line-clamp-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </CardTitle>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-base sm:text-lg font-bold">{formatCurrency(Number(product.priceRetail))}</p>
                      <div className="flex items-center text-xs text-yellow-500 font-bold">
                        <Star className="h-3 w-3 fill-current mr-1" /> 5.0
                      </div>
                    </div>
                  </CardContent>
                </Link>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full rounded-full" variant="secondary" size="sm" asChild>
                    <Link href={`/product/${product.id}`}>Ver Detalhes</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Featured Stores */}
      <section className="py-20 px-4 bg-muted/10">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Lojas em Destaque</h2>
              <p className="text-muted-foreground mt-2">Apoie o comércio local de Vitória da Conquista.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stores.length === 0 ? (
              <p className="text-muted-foreground col-span-full text-center py-10">Nenhuma loja cadastrada ainda.</p>
            ) : (
              stores.map((store: any) => (
                <Link key={store.id} href={`/stores/${store.slug}`} className="group">
                  <Card className="hover:border-primary/50 transition-colors bg-background border-none shadow-sm group-hover:shadow-md">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <StoreIcon className="h-8 w-8" />
                      </div>
                      <h3 className="font-bold text-lg">{store.name}</h3>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {store.city}, {store.state}
                      </p>
                      <Badge variant="outline" className="mt-4 rounded-full font-normal">
                        Ver Vitrine
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Trust Badges / Info */}
      <section className="py-20 px-4 container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-xl">Compre Online</h3>
            <p className="text-muted-foreground">Adicione produtos de várias lojas no seu carrinho e pague tudo de uma vez.</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <StoreIcon className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-xl">Retire na Loja</h3>
            <p className="text-muted-foreground">Economize no frete e retire seu produto pessoalmente em minutos após a aprovação.</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <Star className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-xl">Fortaleça o Local</h3>
            <p className="text-muted-foreground">Ao comprar no Marketplace VDC, você está investindo diretamente na economia da nossa região.</p>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="mt-auto py-12 border-t bg-background">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xl font-bold mb-4">Marketplace VDC</p>
          <p className="text-sm text-muted-foreground">© 2026 Marketplace VDC - Todos os direitos reservados.</p>
        </div>
      </footer>
    </main>
  );
}
