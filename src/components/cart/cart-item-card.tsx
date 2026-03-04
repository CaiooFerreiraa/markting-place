"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem } from "@/types/cart";
import { useCartStore } from "@/store/use-cart-store";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface CartItemCardProps {
  item: CartItem;
}

export function CartItemCard({ item }: CartItemCardProps) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="flex gap-4 py-4">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
        {item.product.images?.[0] ? (
          <Image
            src={item.product.images[0]}
            alt={item.product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Sem foto
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between gap-2">
          <div>
            <h4 className="text-sm font-medium line-clamp-1">{item.product.name}</h4>
            <p className="text-xs text-muted-foreground">{formatCurrency(item.price)}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-sm w-6 text-center">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-sm font-semibold">{formatCurrency(item.price * item.quantity)}</p>
        </div>
      </div>
    </div>
  );
}
