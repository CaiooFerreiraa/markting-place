"use client";

import { formatCurrency } from "@/lib/utils";
import { Order, StoreOrder, OrderItem, Product, Store, ShippingAddress, OrderStatus, FulfillmentType } from "@/types/order";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Package, Truck, Store as StoreIcon, MapPin, Calendar, Clock, Map as MapIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { NavLinks } from "./nav-links";

// Dynamically import Leaflet to avoid SSR issues
const OrderMap = dynamic(() => import("./order-map"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-lg" />
});

interface OrderDetailsProps {
  order: Order & {
    shippingAddress: ShippingAddress | null;
    storeOrders: (StoreOrder & {
      store: Store;
      orderItems: (OrderItem & {
        product: Product;
      })[];
    })[];
  };
}

const statusMap: Record<OrderStatus, { label: string, color: string }> = {
  PENDING: { label: "Pendente", color: "bg-yellow-500" },
  PAID: { label: "Pago", color: "bg-green-500" },
  SHIPPED: { label: "Enviado", color: "bg-blue-500" },
  DELIVERED: { label: "Entregue", color: "bg-emerald-500" },
  PICKED_UP: { label: "Retirado", color: "bg-emerald-500" },
  CANCELED: { label: "Cancelado", color: "bg-red-500" },
};

export function OrderDetails({ order }: OrderDetailsProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Pedido #{order.id.slice(-6).toUpperCase()}</h1>
          <p className="text-muted-foreground">
            Realizado em {new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Badge className={`${statusMap[order.status].color} text-white text-sm px-4 py-1`}>
          {statusMap[order.status].label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {order.storeOrders.map((storeOrder: any) => (
            <Card key={storeOrder.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50 border-b">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <StoreIcon className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{storeOrder.store.name}</CardTitle>
                      <CardDescription>
                        {storeOrder.fulfillmentType === FulfillmentType.PICKUP ? "Retirada em Loja" : "Entrega em Domicílio"}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className={statusMap[storeOrder.status as OrderStatus].color.replace('bg-', 'text-')}>
                    {statusMap[storeOrder.status as OrderStatus].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {storeOrder.orderItems.map((item: any) => (
                    <div key={item.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {item.product.images[0] && (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-md border"
                          />
                        )}
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">{item.quantity}x {formatCurrency(Number(item.priceAtPurchase))}</p>
                        </div>
                      </div>
                      <p className="font-semibold">{formatCurrency(Number(item.priceAtPurchase) * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-muted/20 border-t space-y-4">
                  {storeOrder.fulfillmentType === FulfillmentType.PICKUP ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Local de Retirada:</p>
                            <p className="text-muted-foreground">
                              {storeOrder.store.street}, {storeOrder.store.number}
                              {storeOrder.store.complement && ` - ${storeOrder.store.complement}`}
                              <br />
                              {storeOrder.store.district}, {storeOrder.store.city} - {storeOrder.store.state}
                            </p>
                          </div>
                        </div>

                        {storeOrder.store.lat && storeOrder.store.lng && (
                          <div className="flex items-start gap-2 text-sm">
                            <MapIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div className="w-full">
                              <p className="font-medium">Navegação:</p>
                              <NavLinks
                                lat={Number(storeOrder.store.lat)}
                                lng={Number(storeOrder.store.lng)}
                                label={storeOrder.store.name}
                              />
                            </div>
                          </div>
                        )}

                        {storeOrder.store.operatingHours && (
                          <div className="flex items-start gap-2 text-sm">
                            <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Horário de Funcionamento:</p>
                              <p className="text-muted-foreground">Consulte o horário da loja para retirada.</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {storeOrder.store.lat && storeOrder.store.lng && (
                        <OrderMap stores={[storeOrder.store]} />
                      )}
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-sm">
                      <Truck className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Forma de Entrega:</p>
                        <p className="text-muted-foreground">Entrega padrão via Marketplace VDC.</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Resumo do Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(Number(order.totalAmount))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxas de Entrega</span>
                  <span className="text-green-600 font-medium">Grátis</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(Number(order.totalAmount))}</span>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Pagamento via Cartão de Crédito</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Endereço de Entrega</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="text-muted-foreground">
                  {order.shippingAddress.street}, {order.shippingAddress.number}
                  {order.shippingAddress.complement && ` - ${order.shippingAddress.complement}`}
                </p>
                <p className="text-muted-foreground">
                  {order.shippingAddress.district}, {order.shippingAddress.city} - {order.shippingAddress.state}
                </p>
                <p className="text-muted-foreground">{order.shippingAddress.zip}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}