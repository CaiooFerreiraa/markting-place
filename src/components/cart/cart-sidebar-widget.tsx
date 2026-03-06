"use client";

import { useCartStore } from "@/store/use-cart-store";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export function CartSidebarWidget() {
  const { items } = useCartStore();

  if (items.length === 0) {
    return null;
  }

  return (
    <Card className="border sm:shadow-sm bg-background rounded-xl overflow-hidden mt-6">
      <CardContent className="p-4">
        <h3 className="font-bold text-sm mb-4 text-foreground/80 flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          Seu Carrinho
        </h3>
        <div className="flex flex-col gap-4">
          {items.slice(0, 3).map((item: any) => (
            <div key={item.id} className="group flex items-start gap-3">
              <div className="relative h-14 w-14 bg-muted/30 rounded border flex-shrink-0 p-1">
                {item.product.images?.[0] ? (
                  <Image src={item.product.images[0]} alt={item.product.name} fill className="object-contain mix-blend-multiply" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[8px] text-muted-foreground text-center">Sem foto</div>
                )}
              </div>
              <div className="flex flex-col overflow-hidden justify-center py-0.5">
                <span className="text-[11px] font-semibold text-primary group-hover:underline line-clamp-2 leading-tight">
                  <Link href={`/product/${item.id}`}>{item.product.name}</Link>
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Qtd: {item.quantity}</span>
                <span className="text-xs font-bold text-foreground mt-0.5">{formatCurrency(Number(item.price))}</span>
              </div>
            </div>
          ))}
          {items.length > 3 && (
            <Link href="/checkout" className="text-xs text-primary hover:underline text-center font-medium my-2">
              Ver mais {items.length - 3} itens no carrinho
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
