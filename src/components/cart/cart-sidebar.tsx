"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/use-cart-store";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { CartItemCard } from "./cart-item-card";

export function CartSidebar() {
  const [mounted, setMounted] = useState(false);
  const { items, getTotalItems, getTotalPrice, getGroupedItems } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="relative">
        <ShoppingCart className="h-4 w-4" />
      </Button>
    );
  }

  const groupedItems = getGroupedItems();
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-xs">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            Meu Carrinho <Badge variant="secondary">{totalItems}</Badge>
          </SheetTitle>
        </SheetHeader>

        {totalItems === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center space-y-4">
            <ShoppingCart className="h-12 w-12 text-muted-foreground opacity-20" />
            <p className="text-muted-foreground">O carrinho está vazio.</p>
            <SheetTrigger asChild>
              <Button asChild variant="outline">
                <Link href="/search">Explorar produtos</Link>
              </Button>
            </SheetTrigger>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 pr-4 -mr-4">
              <div className="space-y-8">
                {groupedItems.map((group: any) => (
                  <div key={group.storeId}>
                    <div className="flex items-center justify-between mb-2">
                      <Link
                        href={`/stores/${group.storeSlug}`}
                        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                      >
                        Vendido por: {group.storeName}
                      </Link>
                      <Badge variant="outline" className="text-[10px] font-normal">
                        Fulfillment individual
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {group.items.map((item: any) => (
                        <CartItemCard key={item.id} item={item} />
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-2 border-t border-dashed">
                      <span className="text-xs text-muted-foreground">Subtotal da loja</span>
                      <span className="text-sm font-medium">{formatCurrency(group.subtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-4 pt-6">
              <Separator />
              <div className="flex items-center justify-between font-bold text-lg">
                <span>Total Geral</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <SheetFooter className="mt-4 flex-col gap-2 sm:flex-col sm:space-x-0">
                <SheetTrigger asChild>
                  <Button asChild className="w-full" size="lg">
                    <Link href="/checkout">Finalizar Pedido</Link>
                  </Button>
                </SheetTrigger>
                <SheetTrigger asChild>
                  <Button asChild variant="ghost" className="w-full">
                    <Link href="/search">Continuar Comprando</Link>
                  </Button>
                </SheetTrigger>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
