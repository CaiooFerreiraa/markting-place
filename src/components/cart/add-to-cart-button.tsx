"use client";

import { ShoppingCart } from "lucide-react";
import type { Product, Store } from "@/types/order";
import { useCartStore } from "@/store/use-cart-store";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-hooks";
import { CartItem } from "@/types/cart";

interface AddToCartButtonProps {
  product: Product;
  store: Pick<Store, "id" | "name" | "slug">;
  variant?: "default" | "outline" | "secondary";
  className?: string;
}

export function AddToCartButton({
  product,
  store,
  variant = "default",
  className,
}: AddToCartButtonProps) {
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const handleAddToCart = () => {
    const item: CartItem = {
      id: product.id,
      product,
      store,
      quantity: 1,
      price: Number(product.priceRetail),
    };

    addItem(item);

    toast({
      title: "Adicionado ao carrinho",
      description: `${product.name} foi adicionado ao seu carrinho.`,
    });
  };

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleAddToCart}
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      Adicionar ao Carrinho
    </Button>
  );
}
