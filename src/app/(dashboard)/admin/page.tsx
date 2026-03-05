import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Users, Store, ShoppingBag, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  // Summary Metrics
  const [userCount, storeCount, orderCount, totalRevenue] = await Promise.all([
    db.user.count(),
    db.store.count(),
    db.order.count(),
    db.order.aggregate({ _sum: { totalAmount: true } }),
  ]);

  const recentOrders = await db.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true }
  });

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Visão geral do Marketplace VDC</p>
        </div>
        <div className="flex gap-4">
          <Badge variant="secondary" className="px-3 py-1 text-sm font-bold">
            ADMIN: {session.user.name || session.user.email}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Usuários</CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{userCount}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-wider">Crescimento constante</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lojas Registradas</CardTitle>
            <Store className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{storeCount}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-wider">Lojistas locais</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pedidos Realizados</CardTitle>
            <ShoppingBag className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{orderCount}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-wider">Sucesso de vendas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground font-bold text-green-700">Volume Transacionado</CardTitle>
            <DollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{formatCurrency(Number(totalRevenue._sum.totalAmount || 0))}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-wider">GMV da plataforma</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Pedidos Recentes
            </CardTitle>
            <CardDescription>As últimas transações do marketplace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
                  <div>
                    <p className="text-sm font-bold">Pedido #{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground mt-1">Cliente: {order.user.name || order.user.email}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium mt-1">
                      {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{formatCurrency(Number(order.totalAmount))}</p>
                    <Badge className="text-[10px] mt-2 uppercase">{order.status}</Badge>
                  </div>
                </div>
              ))}
              {recentOrders.length === 0 && (
                <p className="text-center text-muted-foreground py-10">Nenhum pedido realizado ainda.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Gestão da Plataforma
            </CardTitle>
            <CardDescription>Ferramentas administrativas rápidas</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button asChild variant="outline" className="justify-start h-16">
              <Link href="/dashboard/admin/stores" className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-orange-100 text-orange-600">
                  <Store className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">Gerenciar Lojas</p>
                  <p className="text-xs text-muted-foreground font-normal">Verificar endereços e aprovar lojistas</p>
                </div>
              </Link>
            </Button>

            <Button asChild variant="outline" className="justify-start h-16">
              <Link href="/dashboard/admin/users" className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <Users className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">Base de Usuários</p>
                  <p className="text-xs text-muted-foreground font-normal">Lista de compradores e vendedores</p>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
