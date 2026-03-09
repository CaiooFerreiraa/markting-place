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
            <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-xs bg-primary text-primary-foreground">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md border-l-0 sm:border-l shadow-2xl p-0 gap-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="flex items-center justify-between">
            <span className="text-2xl font-black tracking-tight">Meu Carrinho</span>
            <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary border-none px-3 font-bold">
              {totalItems}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        {totalItems === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center space-y-4 p-6">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-2">
              <ShoppingCart className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <p className="text-muted-foreground font-medium text-center">Seu carrinho está vazio.</p>
            <SheetTrigger asChild>
              <Button asChild variant="outline" className="rounded-full px-8">
                <Link href="/search">Explorar produtos</Link>
              </Button>
            </SheetTrigger>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-8 pb-4">
                {groupedItems.map((group: any) => (
                  <div key={group.storeId} className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150 fill-mode-both">
                    <div className="flex items-center justify-between mb-4">
                      <Link
                        href={`/stores/${group.storeSlug}`}
                        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        {group.storeName}
                      </Link>
                      <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tighter opacity-50 border-muted">
                        Fulfillment individual
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {group.items.map((item: any) => (
                        <CartItemCard key={item.id} item={item} />
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-dashed border-muted/50">
                      <span className="text-xs font-medium text-muted-foreground">Subtotal da loja</span>
                      <span className="text-sm font-bold">{formatCurrency(group.subtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-6 bg-muted/30 border-t space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Resumo do pedido</span>
                <span className="text-xs text-muted-foreground">{totalItems} itens</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">Total Geral</span>
                <span className="text-2xl font-black text-primary tracking-tighter">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
              <div className="grid gap-2 pt-2">
                <SheetTrigger asChild>
                  <Button asChild className="w-full h-12 rounded-xl text-md font-bold shadow-xl shadow-primary/20" size="lg">
                    <Link href="/checkout">Finalizar Compra</Link>
                  </Button>
                </SheetTrigger>
                <SheetTrigger asChild>
                  <Button asChild variant="ghost" className="w-full h-10 rounded-xl text-muted-foreground font-semibold hover:bg-transparent hover:text-primary">
                    <Link href="/search">Continuar Comprando</Link>
                  </Button>
                </SheetTrigger>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
