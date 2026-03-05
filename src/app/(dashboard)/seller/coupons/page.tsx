import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Ticket, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default async function SellerCouponsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SELLER") {
    redirect("/");
  }

  const coupons = await db.coupon.findMany({
    where: {
      store: {
        userId: session.user.id,
      },
    },
    include: {
      store: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Meus Cupons</h2>
        <Button asChild>
          <Link href="/seller/coupons/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Cupom
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {coupons.length === 0 ? (
          <Card className="col-span-full py-10">
            <CardContent className="flex flex-col items-center justify-center space-y-3">
              <Ticket className="h-12 w-12 text-muted-foreground opacity-20" />
              <p className="text-muted-foreground font-medium">Nenhum cupom criado ainda.</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/seller/coupons/new text-xs">Começar a criar</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          coupons.map((coupon: any) => (
            <Card key={coupon.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold font-mono tracking-widest uppercase">
                    {coupon.code}
                  </CardTitle>
                  <CardDescription>Loja: {coupon.store.name}</CardDescription>
                </div>
                <div className={`h-3 w-3 rounded-full ${coupon.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {coupon.discountPercent
                    ? `${coupon.discountPercent}% OFF`
                    : formatCurrency(Number(coupon.discountFixed)) + " OFF"}
                </div>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Uso:</span>
                    <span>{coupon.usageCount} / {coupon.usageLimit || '∞'}</span>
                  </div>
                  {coupon.minOrderAmount && (
                    <div className="flex justify-between">
                      <span>Mínimo:</span>
                      <span>{formatCurrency(Number(coupon.minOrderAmount))}</span>
                    </div>
                  )}
                  {coupon.expiryDate && (
                    <div className="flex justify-between">
                      <span>Expira em:</span>
                      <span>{new Date(coupon.expiryDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" disabled>
                    <Edit className="mr-2 h-4 w-4" /> Editar
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/5" disabled>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
