import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutDashboard, Package, Plus, ShoppingCart, Store as StoreIcon } from "lucide-react"
import Link from "next/link"
import { StoreList } from "@/components/seller/store-list"
import { ProductList } from "@/components/seller/product-list"
import { Button } from "@/components/ui/button"
import { SubscriptionCard } from "@/components/dashboard/seller/subscription-card"
import { PaymentSetup } from "@/components/dashboard/seller/payment-setup"
import { Prisma } from "@prisma/client"

export default async function SellerDashboardPage({
  searchParams,
}: {
  searchParams: { store?: string }
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== "SELLER") {
    redirect("/")
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      stripeAccountId: true,
      subscriptionStatus: true,
      revenueModel: true,
    }
  })

  const stores = await db.store.findMany({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: { products: true }
      }
    }
  })

  type StoreWithCount = Prisma.StoreGetPayload<{
    include: { _count: { select: { products: true } } }
  }>;

  const selectedStoreId = searchParams.store || stores[0]?.id
  const selectedStore = stores.find((s: StoreWithCount) => s.id === selectedStoreId)

  const products = selectedStoreId
    ? await db.product.findMany({
      where: { storeId: selectedStoreId },
      orderBy: { createdAt: 'desc' }
    })
    : []

  type Product = Prisma.ProductGetPayload<{}>;

  const serializableProducts = products.map((product: Product) => ({
    ...product,
    priceRetail: Number(product.priceRetail),
    priceWholesale: product.priceWholesale ? Number(product.priceWholesale) : null,
  }))

  const totalProducts = stores.reduce((acc: number, store: StoreWithCount) => acc + store._count.products, 0)

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Painel do Vendedor</h2>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/seller/stores/new">
              <StoreIcon className="mr-2 h-4 w-4" />
              Nova Loja
            </Link>
          </Button>
          <Button asChild>
            <Link href={selectedStoreId ? `/seller/products/new?storeId=${selectedStoreId}` : "/seller/products/new"}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lojas</CardTitle>
            <StoreIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stores.length}</div>
            <p className="text-xs text-muted-foreground">Unidades gerenciadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Em todas as lojas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 0,00</div>
            <p className="text-xs text-muted-foreground">Em breve (Fase 2)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Global</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Ativo</div>
            <p className="text-xs text-muted-foreground">Pronto para vender</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8">
        <div className="col-span-3 space-y-4">
          <SubscriptionCard
            subscriptionStatus={user?.subscriptionStatus || null}
            revenueModel={user?.revenueModel || "TRANSACTION_FEE"}
          />
          <PaymentSetup
            stripeAccountId={user?.stripeAccountId || null}
            chargesEnabled={!!user?.stripeAccountId}
          />
          <h3 className="text-xl font-semibold">Minhas Lojas</h3>
          <StoreList stores={stores as any} />
        </div>
        <div className="col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">
              {selectedStore ? `Produtos em ${selectedStore.name}` : "Produtos"}
            </h3>
            {selectedStoreId && (
              <Button asChild size="sm" variant="ghost">
                <Link href={`/seller/products/new?storeId=${selectedStoreId}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Produto
                </Link>
              </Button>
            )}
          </div>
          <ProductList products={serializableProducts as any} storeId={selectedStoreId || ""} />
        </div>
      </div>
    </div>
  )
}

