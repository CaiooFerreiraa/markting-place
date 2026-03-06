import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutDashboard, Package, Plus, ShoppingCart, Store as StoreIcon } from "lucide-react"
import { StoreList } from "@/components/seller/store-list"
import { ProductList } from "@/components/seller/product-list"
import { Button } from "@/components/ui/button"
import { SubscriptionCard } from "@/components/dashboard/seller/subscription-card"
import { PaymentSetup } from "@/components/dashboard/seller/payment-setup"
import { StoreWithProductCount } from "@/types/store"
import { Product } from "@/types/product"
import Link from "next/link"

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
  }) as unknown as StoreWithProductCount[];

  const selectedStoreId = searchParams.store || stores[0]?.id
  const selectedStore = stores.find((s: StoreWithProductCount) => s.id === selectedStoreId)

  const products = selectedStoreId
    ? await db.product.findMany({
      where: { storeId: selectedStoreId },
      orderBy: { createdAt: 'desc' }
    }) as unknown as Product[]
    : []

  const serializableProducts = products.map((product: Product) => ({
    ...product,
    priceRetail: Number(product.priceRetail),
    priceWholesale: product.priceWholesale ? Number(product.priceWholesale) : null,
  }))

  const totalProducts = stores.reduce((acc: number, store: StoreWithProductCount) => acc + store._count.products, 0)

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
            <Link href="/seller/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(0)}</div>
            <p className="text-xs text-muted-foreground">+0% em relação ao mês passado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lojas Ativas</CardTitle>
            <StoreIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stores.length}</div>
            <p className="text-xs text-muted-foreground">Gerencie suas unidades</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Em todas as suas lojas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinatura</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold uppercase">{user?.revenueModel || "FREE"}</div>
            <p className="text-xs text-muted-foreground">
              Status: {user?.subscriptionStatus || "Inativo"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 space-y-4">
          {!user?.stripeAccountId ? (
            <PaymentSetup
              stripeAccountId={user?.stripeAccountId || null}
              chargesEnabled={false}
            />
          ) : (
            <SubscriptionCard
              subscriptionStatus={user.subscriptionStatus || "INACTIVE"}
              revenueModel={user.revenueModel || "TRANSACTION_FEE"}
            />
          )}
          <StoreList stores={stores} />
        </div>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Produtos da Loja: {selectedStore?.name || "Nenhuma selecionada"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductList products={serializableProducts} storeId={selectedStoreId || ""} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
