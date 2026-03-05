import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default async function BuyerOrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: {
      storeOrders: {
        include: {
          store: true,
          orderItems: {
            include: { product: true }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Meus Pedidos</h1>

      {orders.length === 0 ? (
        <Card className="text-center py-20">
          <CardContent>
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground mb-6">Você ainda não realizou nenhum pedido.</p>
            <Link href="/search">
              <span className="text-primary hover:underline font-medium">Começar a comprar</span>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50 border-b flex flex-row items-center justify-between py-4">
                <div className="flex gap-6 text-sm">
                  <div>
                    <p className="text-muted-foreground uppercase text-[10px] font-bold">Pedido em</p>
                    <p className="font-medium">{new Date(order.createdAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground uppercase text-[10px] font-bold">Total</p>
                    <p className="font-medium">{formatCurrency(Number(order.totalAmount))}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground uppercase text-[10px] font-bold">ID do Pedido</p>
                  <p className="font-mono text-xs">#{order.id.slice(-8).toUpperCase()}</p>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {order.storeOrders.map((storeOrder: any) => (
                  <div key={storeOrder.id} className="border-b last:border-0 p-6">
                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                      <div>
                        <Link href={`/stores/${storeOrder.store.slug}`} className="font-bold hover:underline">
                          {storeOrder.store.name}
                        </Link>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] uppercase">{storeOrder.fulfillmentType}</Badge>
                          <Badge className="text-[10px] uppercase">{storeOrder.status}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {storeOrder.orderItems.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                              {item.product.images?.[0] && (
                                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                              )}
                            </div>
                            <span>{item.quantity}x {item.product.name}</span>
                          </div>
                          <span className="font-medium">{formatCurrency(Number(item.priceAtPurchase) * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
