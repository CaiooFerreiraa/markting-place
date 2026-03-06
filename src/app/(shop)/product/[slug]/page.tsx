import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ProductJsonLd } from "@/components/seo/json-ld";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { CartSidebarWidget } from "@/components/cart/cart-sidebar-widget";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Star, Leaf, ShieldCheck, Truck, Lock, RefreshCcw, MapPin, Check, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getProduct(slug: string) {
  const product = await db.product.findFirst({
    where: {
      name: {
        // Since we don't have a slug field in Product model yet, 
        // we'll try to find by name for now as a fallback or 
        // assume the slug is the ID or name.
        // Rule 1/2: In a real app we'd need a slug field.
        // For this task, I will use 'id' as the slug or find by name.
        // I'll check if there's any other field.
        equals: slug.replace(/-/g, " "),
        mode: 'insensitive'
      }
    },
    include: {
      store: true,
      category: true,
    }
  });

  if (!product) {
    // Try finding by ID if name fails
    return await db.product.findUnique({
      where: { id: slug },
      include: {
        store: true,
        category: true,
      }
    });
  }

  return product;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Produto não encontrado | Marketplace VDC",
    };
  }

  return {
    title: `${product.name} | Marketplace VDC`,
    description: product.description || `Confira ${product.name} no Marketplace VDC.`,
    openGraph: {
      title: product.name,
      description: product.description || undefined,
      images: product.images,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const similarProducts = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id }
    },
    take: 5,
    include: {
      store: true,
      category: true,
    }
  });

  // Convert Prisma Decimal to number to allow passing to Client Components
  const serializableProduct = {
    ...product,
    priceRetail: Number(product.priceRetail),
    priceWholesale: product.priceWholesale ? Number(product.priceWholesale) : null,
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <ProductJsonLd product={product} />

      <div className="mb-6">
        <Link href="/search" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">

        {/* Left Column - Images */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted border border-border/50">
            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-contain"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Sem foto
              </div>
            )}
          </div>
          {/* Thumbnails mockup if more images were present */}
          <div className="flex gap-2 w-full overflow-x-auto">
            <div className="h-16 w-16 bg-muted rounded border border-border p-1 opacity-100 flex-shrink-0 relative">
              {product.images?.[0] && <Image src={product.images[0]} alt="thumb" fill className="object-cover rounded" />}
            </div>
          </div>
        </div>

        {/* Middle Column - Details / Info */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{product.name}</h1>

          <div className="flex items-center gap-2 text-sm text-primary">
            <Link href={`/stores/${product.store.slug}`} className="hover:underline">
              Marca: {product.store.name}
            </Link>
          </div>

          {/* Reviews Mockup */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">4,6</span>
            <div className="flex items-center text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current opacity-50" />
            </div>
            <span className="text-primary hover:underline cursor-pointer">(64)</span>
            <span className="mx-1">|</span>
            <span className="text-primary hover:underline cursor-pointer">Pesquisar nesta página</span>
          </div>

          <div className="flex items-center gap-1 text-sm text-green-700 font-medium cursor-pointer hover:underline w-max">
            <Leaf className="h-4 w-4" />
            Materiais reciclados + 2 mais
          </div>

          <Separator className="my-2" />

          <div>
            <span className="text-4xl font-extrabold">{formatCurrency(Number(product.priceRetail))}</span>
            <p className="text-sm mt-1">
              Em até <span className="font-bold">8x {formatCurrency(Number(product.priceRetail) / 8)} sem juros</span>
            </p>
            <p className="text-sm text-primary hover:underline cursor-pointer font-medium mt-1">
              Cartão Marketplace VDC: ganhe até 5% de volta em pontos. Saiba mais.
            </p>
          </div>

          <div className="flex gap-8 mt-4 opacity-80 text-sm">
            <div className="flex flex-col items-center text-center max-w-[80px]">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 mb-2">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <span className="text-primary hover:underline cursor-pointer text-xs leading-tight">Pagamentos em Segurança</span>
            </div>
            <div className="flex flex-col items-center text-center max-w-[80px]">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 mb-2">
                <RefreshCcw className="h-5 w-5 text-primary" />
              </div>
              <span className="text-primary hover:underline cursor-pointer text-xs leading-tight">Política de devolução</span>
            </div>
          </div>

          <Separator className="my-2" />

          <div className="text-sm space-y-4 pt-2">
            <div className="grid grid-cols-[140px_1fr] gap-4">
              <span className="font-bold">Marca</span>
              <span>{product.store.name}</span>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-4">
              <span className="font-bold">Categoria</span>
              <span>{product.category.name}</span>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-4">
              <span className="font-bold">Condição</span>
              <span>Novo</span>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-4">
              <span className="font-bold">Dispositivos compatíveis</span>
              <span>Múltiplos formatos / Universal</span>
            </div>
          </div>

          <Separator className="my-2" />

          <div>
            <h3 className="font-bold text-lg mb-4">Sobre este item</h3>
            <ul className="list-disc pl-5 space-y-3 text-sm leading-relaxed text-foreground">
              {product.description?.split('\n').filter((line: string) => line.trim().length > 0).map((line: string, i: number) => (
                <li key={i}>{line}</li>
              )) || <li>Detalhes não informados pela loja.</li>}
            </ul>
          </div>
        </div>

        {/* Right Column - Buy Box & Side Items */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <Card className="border sm:shadow-lg bg-background rounded-xl overflow-hidden">
            <CardContent className="p-5">
              <div className="text-3xl font-extrabold mb-4">{formatCurrency(Number(product.priceRetail))}</div>
              <div className="text-sm space-y-2 mb-6 text-foreground">
                <p>Entrega <span className="font-bold">GRÁTIS</span> na sua região.</p>
                <div className="flex items-start gap-2 text-primary hover:text-primary/80 cursor-pointer pt-1">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span className="text-xs leading-tight">Enviar para {product.store.city || 'Sua Localização'}...</span>
                </div>
              </div>

              <p className="text-green-700 font-bold text-lg mb-4">{product.stock > 0 ? 'Em estoque' : 'Esgotado'}</p>

              {product.stock > 0 && (
                <div className="mb-5 relative">
                  <select className="w-full text-sm border-2 bg-background rounded-lg p-2.5 px-3 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none cursor-pointer appearance-none shadow-sm hover:bg-accent/50 transition-colors">
                    <option value="1">Quantidade: 1</option>
                    <option value="2">Quantidade: 2</option>
                    <option value="3">Quantidade: 3</option>
                    <option value="4">Quantidade: 4</option>
                    <option value="5">Quantidade: 5</option>
                  </select>
                </div>
              )}

              <div className="space-y-3 mb-6">
                <AddToCartButton
                  product={serializableProduct as any}
                  store={{
                    id: product.store.id,
                    name: product.store.name,
                    slug: product.store.slug,
                  }}
                  className="w-full rounded-full bg-yellow-400 hover:bg-yellow-500 text-black border-none shadow-sm font-medium py-6 text-[15px] transition-all"
                />
                <Button className="w-full rounded-full bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-sm border-none py-6 text-[15px] transition-all">
                  Comprar agora
                </Button>
              </div>

              <div className="text-[11px] text-muted-foreground space-y-2">
                <div className="grid grid-cols-[100px_1fr] gap-2">
                  <span className="text-foreground/70">Enviado de</span>
                  <span className="font-medium text-primary hover:underline cursor-pointer truncate">{product.store.name}</span>
                </div>
                <div className="grid grid-cols-[100px_1fr] gap-2">
                  <span className="text-foreground/70">Vendido por</span>
                  <span className="font-medium text-primary hover:underline cursor-pointer truncate">{product.store.name}</span>
                </div>
                <div className="grid grid-cols-[100px_1fr] gap-2 pt-1 border-t">
                  <span className="text-foreground/70">Pagamento</span>
                  <span className="flex items-center text-primary hover:underline cursor-pointer font-medium"><Lock className="mr-1 h-3 w-3" /> Transação segura</span>
                </div>
              </div>

              <Separator className="my-5" />

              <div className="space-y-3">
                <p className="text-[13px] font-bold">Adicionar plano de seguro ou garantia:</p>
                <label className="flex items-start gap-2 cursor-pointer group">
                  <input type="checkbox" className="mt-1 flex-shrink-0 cursor-pointer accent-primary" />
                  <span className="text-xs text-primary group-hover:underline leading-tight">
                    Garantia Estendida contra falhas e defeitos de 12 meses <span className="text-foreground">por <span className="text-destructive font-medium">R$ 12,63</span></span>
                  </span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer group">
                  <input type="checkbox" className="mt-1 flex-shrink-0 cursor-pointer accent-primary" />
                  <span className="text-xs text-primary group-hover:underline leading-tight">
                    Garantia Estendida contra falhas e defeitos de 24 meses <span className="text-foreground">por <span className="text-destructive font-medium">R$ 18,94</span></span>
                  </span>
                </label>
              </div>

            </CardContent>
          </Card>

          <CartSidebarWidget />
        </div>
      </div>

      <Separator className="my-12" />

      {/* Compartison Table Mockup */}
      {similarProducts.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Comparar com itens semelhantes</h2>
          <div className="overflow-x-auto pb-4">
            <table className="w-full text-sm text-left border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="font-normal w-48 border-b p-4 align-bottom"></th>
                  <th className="font-normal w-48 border-b p-4 align-bottom">
                    <div className="flex flex-col items-center text-center">
                      <div className="h-24 w-24 relative mb-2">
                        {product.images?.[0] ? <Image src={product.images[0]} alt={product.name} fill className="object-contain" /> : <div className="h-full w-full bg-muted flex items-center justify-center text-xs">Sem Imagem</div>}
                      </div>
                      <span className="font-semibold text-primary line-clamp-2">{product.name}</span>
                    </div>
                  </th>
                  {similarProducts.slice(0, 4).map((sim: any) => (
                    <th key={sim.id} className="font-normal w-48 border-b p-4 border-l border-border/50 align-bottom">
                      <Link href={`/product/${sim.id}`} className="flex flex-col items-center text-center group">
                        <div className="h-24 w-24 relative mb-2">
                          {sim.images?.[0] ? <Image src={sim.images[0]} alt={sim.name} fill className="object-contain" /> : <div className="h-full w-full bg-muted flex items-center justify-center text-xs">Sem Imagem</div>}
                        </div>
                        <span className="text-primary group-hover:underline line-clamp-2">{sim.name}</span>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                <tr>
                  <td className="font-bold p-4 bg-muted/20">Preço</td>
                  <td className="p-4 text-center font-bold">{formatCurrency(Number(product.priceRetail))}</td>
                  {similarProducts.slice(0, 4).map((sim: any) => (
                    <td key={`price-${sim.id}`} className="p-4 border-l border-border/50 text-center">{formatCurrency(Number(sim.priceRetail))}</td>
                  ))}
                </tr>
                <tr>
                  <td className="font-bold p-4 bg-muted/20">Vendido por</td>
                  <td className="p-4 text-center text-primary">{product.store.name}</td>
                  {similarProducts.slice(0, 4).map((sim: any) => (
                    <td key={`store-${sim.id}`} className="p-4 border-l border-border/50 text-center text-primary">{sim.store.name}</td>
                  ))}
                </tr>
                <tr>
                  <td className="font-bold p-4 bg-muted/20">Categoria</td>
                  <td className="p-4 text-center">{product.category.name}</td>
                  {similarProducts.slice(0, 4).map((sim: any) => (
                    <td key={`cat-${sim.id}`} className="p-4 border-l border-border/50 text-center">{sim.category.name}</td>
                  ))}
                </tr>
                <tr>
                  <td className="font-bold p-4 bg-muted/20">Condição</td>
                  <td className="p-4 text-center">Novo</td>
                  {similarProducts.slice(0, 4).map((sim: any) => (
                    <td key={`cond-${sim.id}`} className="p-4 border-l border-border/50 text-center">Novo</td>
                  ))}
                </tr>
                <tr>
                  <td className="font-bold p-4 bg-muted/20">Avaliações</td>
                  <td className="p-4 text-center flex justify-center text-yellow-500">
                    <Star className="h-4 w-4 fill-current" /> <Star className="h-4 w-4 fill-current" /> <Star className="h-4 w-4 fill-current" /> <Star className="h-4 w-4 fill-current" /> <Star className="h-4 w-4 fill-current opacity-30" />
                  </td>
                  {similarProducts.slice(0, 4).map((sim: any) => (
                    <td key={`rate-${sim.id}`} className="p-4 border-l border-border/50 text-center">
                      <div className="flex justify-center text-yellow-500">
                        <Star className="h-4 w-4 fill-current" /> <Star className="h-4 w-4 fill-current" /> <Star className="h-4 w-4 fill-current" /> <Star className="h-4 w-4 fill-current opacity-50" /> <Star className="h-4 w-4 fill-current opacity-20" />
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {similarProducts.length > 0 && <Separator className="my-12" />}

      {/* Recommendations / Semelhantes Grid */}
      {similarProducts.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Semelhantes que você pode gostar</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {similarProducts.map((sim: any) => (
              <Card key={`rec-grid-${sim.id}`} className="group overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 bg-background flex flex-col h-full">
                <Link href={`/product/${sim.id}`} className="flex-1 flex flex-col">
                  <div className="relative aspect-square overflow-hidden bg-muted/30 p-2">
                    {sim.images?.[0] ? (
                      <Image src={sim.images[0]} alt={sim.name} fill className="object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground text-xs">Sem foto</div>
                    )}
                  </div>
                  <CardContent className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm line-clamp-2 group-hover:text-primary transition-colors text-primary font-medium">
                        {sim.name}
                      </h3>
                      <div className="flex items-center text-yellow-500 mt-1 mb-2">
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current opacity-50" />
                        <span className="text-muted-foreground text-xs ml-1">10</span>
                      </div>
                    </div>
                    <p className="text-lg font-bold">{formatCurrency(Number(sim.priceRetail))}</p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      )}

      <Separator className="my-12" />



      {/* Reviews Mockup */}
      <section className="mb-12 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-4 lg:col-span-3">
          <h2 className="text-2xl font-bold mb-4">Avaliações de clientes</h2>
          <div className="flex items-center mb-2">
            <div className="flex items-center text-yellow-500 mr-2">
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current opacity-50" />
            </div>
            <span className="text-lg font-medium">4,6 de 5</span>
          </div>
          <p className="text-sm text-muted-foreground mb-6">64 classificações globais</p>

          <div className="space-y-3 text-sm flex flex-col mb-8">
            <div className="flex items-center gap-3">
              <span className="w-12 text-primary hover:underline cursor-pointer">5 estrela</span>
              <div className="flex-1 h-4 border border-border bg-muted/50 rounded overflow-hidden shadow-inner"><div className="h-full bg-yellow-400 w-[78%]"></div></div>
              <span className="w-8 text-right text-primary">78%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-12 text-primary hover:underline cursor-pointer">4 estrela</span>
              <div className="flex-1 h-4 border border-border bg-muted/50 rounded overflow-hidden shadow-inner"><div className="h-full bg-yellow-400 w-[12%]"></div></div>
              <span className="w-8 text-right text-primary">12%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-12 text-primary hover:underline cursor-pointer">3 estrela</span>
              <div className="flex-1 h-4 border border-border bg-muted/50 rounded overflow-hidden shadow-inner"><div className="h-full bg-yellow-400 w-[5%]"></div></div>
              <span className="w-8 text-right text-primary">5%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-12 text-primary hover:underline cursor-pointer">2 estrela</span>
              <div className="flex-1 h-4 border border-border bg-muted/50 rounded overflow-hidden shadow-inner"><div className="h-full bg-yellow-400 w-[2%]"></div></div>
              <span className="w-8 text-right text-primary">2%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-12 text-primary hover:underline cursor-pointer">1 estrela</span>
              <div className="flex-1 h-4 border border-border bg-muted/50 rounded overflow-hidden shadow-inner"><div className="h-full bg-yellow-400 w-[3%]"></div></div>
              <span className="w-8 text-right text-primary">3%</span>
            </div>
          </div>

          <Separator className="my-6" />

          <h3 className="font-bold text-lg mb-2">Avalie este produto</h3>
          <p className="text-sm text-muted-foreground mb-4">Compartilhe seus pensamentos com outros clientes</p>
          <Button variant="outline" className="w-full rounded-full">Escrever uma avaliação</Button>
        </div>

        <div className="md:col-span-8 lg:col-span-9 space-y-8">
          <h3 className="font-bold text-lg">Principais avaliações do Brasil</h3>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center font-bold text-muted-foreground">M</div>
                <span className="font-medium">Mônica Souza</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center text-yellow-500">
                  <Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" />
                </div>
                <span className="font-bold text-sm">Excelente produto, surpreendeu!</span>
              </div>
              <p className="text-xs text-muted-foreground">Avaliado no Brasil em 10 de fevereiro de 2026</p>
              <p className="text-xs text-primary font-medium">Compra Verificada</p>
              <p className="text-sm text-foreground leading-relaxed">
                Superou minhas expectativas. A entrega foi rápida e o produto veio muito bem embalado. Qualidade acima da média para a categoria. Aconselho bastante. Compra super tranquila pela página com muita segurança. Voltarei a comprar.
              </p>
              <p className="text-xs text-muted-foreground mt-2">12 pessoas acharam isso útil</p>
              <div className="flex gap-4 mt-2">
                <Button variant="outline" size="sm" className="h-8 rounded-full text-xs">Útil</Button>
                <span className="text-xs text-muted-foreground self-center cursor-pointer hover:underline">Informar erro</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center font-bold text-muted-foreground">J</div>
                <span className="font-medium">João Paulo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center text-yellow-500">
                  <Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current opacity-30" />
                </div>
                <span className="font-bold text-sm">Bom custo-benefício</span>
              </div>
              <p className="text-xs text-muted-foreground">Avaliado no Brasil em 3 de março de 2026</p>
              <p className="text-xs text-primary font-medium">Compra Verificada</p>
              <p className="text-sm text-foreground leading-relaxed">
                Produto muito bom considerando o preço. Cumpre o que promete. Tem detalhes pequenos de acabamento mas nada que atrapalhe o uso. Loja parceira foi super ágil também.
              </p>
              <p className="text-xs text-muted-foreground mt-2">5 pessoas acharam isso útil</p>
              <div className="flex gap-4 mt-2">
                <Button variant="outline" size="sm" className="h-8 rounded-full text-xs">Útil</Button>
                <span className="text-xs text-muted-foreground self-center cursor-pointer hover:underline">Informar erro</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
