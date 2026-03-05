import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Store, ShoppingCart } from "lucide-react";

export default async function SellerOrdersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SELLER") redirect("/login");

  // Fetch the seller's store first
  const store = await db.store.findFirst({
    where: { userId: session.user.id }
  });

  if (!store) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <Store className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Você ainda não possui uma loja</h1>
        <Button asChild>
          <Link href="/seller/stores/new">Criar minha loja</Link>
        </Button>
      </div>
    );
  }

  const storeOrders = await db.storeOrder.findMany({
    where: { storeId: store.id },
    include: {
      orderItems: {
        include: { product: true }
      },
      order: {
        include: { user: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Gestão de Pedidos: {store.name}</h1>

      {storeOrders.length === 0 ? (
        <Card className="text-center py-20">
          <CardContent>
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground">Sua loja ainda não recebeu pedidos.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {storeOrders.map((storeOrder: any) => (
            <Card key={storeOrder.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30 border-b py-4 flex flex-row items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold">Pedido #{storeOrder.order.id.slice(-6).toUpperCase()}</p>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold">{storeOrder.fulfillmentType}</Badge>
                    <Badge className="text-[10px] uppercase font-bold">{storeOrder.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Cliente: {storeOrder.order.user.name || storeOrder.order.user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatCurrency(Number(storeOrder.subTotal))}</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase mt-1">
                    {new Date(storeOrder.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {storeOrder.orderItems.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                          {item.product.images?.[0] && (
                            <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <span className="font-medium text-gray-700">{item.quantity}x {item.product.name}</span>
                      </div>
                      <span className="font-semibold">{formatCurrency(Number(item.priceAtPurchase) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
