import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CouponForm } from "@/components/seller/coupons/coupon-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function NewCouponPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SELLER") {
    redirect("/");
  }

  const stores = await db.store.findMany({
    where: {
      userId: session.user.id,
    },
  });

  if (stores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <p className="text-muted-foreground">Você precisa criar uma loja antes de criar cupons.</p>
        <Button asChild>
          <Link href="/seller/stores/new">Criar Loja</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight mb-8">Novo Cupom</h2>
      <CouponForm stores={stores} />
    </div>
  );
}
