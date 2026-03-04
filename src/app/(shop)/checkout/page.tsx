"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FulfillmentType } from "@prisma/client";
import { useCartStore } from "@/store/use-cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toast-hooks";
import { formatCurrency } from "@/lib/utils";
import { FulfillmentSelector } from "@/components/checkout/fulfillment-selector";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { items, getGroupedItems, getTotalPrice, clearCart } = useCartStore();
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState<string | null>(null);

  const [fulfillmentChoices, setFulfillmentChoices] = useState<Record<string, FulfillmentType>>({});
  const [address, setAddress] = useState({
    street: "",
    number: "",
    complement: "",
    city: "",
    state: "",
    zipCode: "",
  });

  useEffect(() => {
    setMounted(true);
    const groups = getGroupedItems();
    const initialChoices: Record<string, FulfillmentType> = {};
    groups.forEach(g => {
      initialChoices[g.storeId] = FulfillmentType.DELIVERY;
    });
    setFulfillmentChoices(initialChoices);
  }, []);

  if (!mounted) return null;

  const groupedItems = getGroupedItems();
  const totalPrice = getTotalPrice();

  const handleFulfillmentChange = (storeId: string, type: FulfillmentType) => {
    setFulfillmentChoices(prev => ({ ...prev, [storeId]: type }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isDeliveryRequired = Object.values(fulfillmentChoices).some(v => v === FulfillmentType.DELIVERY);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (isDeliveryRequired && (!address.street || !address.number || !address.city || !address.state || !address.zipCode)) {
        toast({
          title: "Endereço incompleto",
          description: "Por favor, preencha todos os campos obrigatórios do endereço.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(i => ({ id: i.id, quantity: i.quantity })),
          fulfillmentChoices,
          address: isDeliveryRequired ? address : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar pedido");
      }

      setOrderComplete(data.orderId);
      clearCart();
      toast({
        title: "Pedido realizado!",
        description: "Seu pedido foi processado com sucesso.",
      });

    } catch (error: any) {
      toast({
        title: "Erro no checkout",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="container max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="flex justify-center mb-6 text-green-500">
          <CheckCircle2 className="h-20 w-20" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Obrigado pela compra!</h1>
        <p className="text-muted-foreground text-lg mb-8">
          Seu pedido <strong>#{orderComplete.slice(-6).toUpperCase()}</strong> foi recebido e está em processamento.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/dashboard/buyer/orders">Ver Meus Pedidos</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/search">Continuar Comprando</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container max-w-2xl mx-auto py-20 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h1>
        <Button asChild>
          <Link href="/search">Ir para a loja</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <h1 className="text-3xl font-bold">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* 1. Fulfillment Selection */}
          <section>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm">1</span>
              Como deseja receber seus produtos?
            </h2>
            {groupedItems.map((group) => (
              <FulfillmentSelector
                key={group.storeId}
                storeName={group.storeName}
                value={fulfillmentChoices[group.storeId] || FulfillmentType.DELIVERY}
                onChange={(val) => handleFulfillmentChange(group.storeId, val)}
              />
            ))}
          </section>

          {/* 2. Shipping Address */}
          {isDeliveryRequired && (
            <section>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm">2</span>
                Endereço de Entrega
              </h2>
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-6">
                    <div className="sm:col-span-4">
                      <Label htmlFor="street">Logradouro / Rua *</Label>
                      <Input id="street" name="street" value={address.street} onChange={handleAddressChange} placeholder="Rua das Palmeiras" className="mt-2" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="number">Número *</Label>
                      <Input id="number" name="number" value={address.number} onChange={handleAddressChange} placeholder="123" className="mt-2" />
                    </div>
                    <div className="sm:col-span-3">
                      <Label htmlFor="complement">Complemento</Label>
                      <Input id="complement" name="complement" value={address.complement} onChange={handleAddressChange} placeholder="Apt 45 / Bloco B" className="mt-2" />
                    </div>
                    <div className="sm:col-span-3">
                      <Label htmlFor="zipCode">CEP *</Label>
                      <Input id="zipCode" name="zipCode" value={address.zipCode} onChange={handleAddressChange} placeholder="45000-000" className="mt-2" />
                    </div>
                    <div className="sm:col-span-4">
                      <Label htmlFor="city">Cidade *</Label>
                      <Input id="city" name="city" value={address.city} onChange={handleAddressChange} placeholder="Vitória da Conquista" className="mt-2" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="state">Estado (UF) *</Label>
                      <Input id="state" name="state" value={address.state} onChange={handleAddressChange} placeholder="BA" className="mt-2" maxLength={2} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
        </div>

        {/* 3. Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card className="border-2 border-primary/10 shadow-lg">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
                <CardDescription>Confira seus itens antes de finalizar.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="max-h-[300px] -mx-2 px-2">
                  {groupedItems.map((group) => (
                    <div key={group.storeId} className="mb-6 last:mb-0">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2 tracking-tight">
                        Loja: {group.storeName}
                      </p>
                      <div className="space-y-2">
                        {group.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{item.quantity}x {item.product.name}</span>
                            <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  ))}
                </ScrollArea>

                <div className="space-y-2 pt-4">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Taxa de entrega</span>
                    <span className="text-green-600 font-medium">Grátis</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-bold pt-2">
                    <span>Total</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                </div>

                <Button 
                  className="w-full mt-6 text-lg py-6" 
                  onClick={handleSubmit} 
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processando...</>
                  ) : (
                    "Finalizar Pedido"
                  )}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground mt-4 leading-tight">
                  Ao clicar em finalizar, você concorda com os termos de uso do Marketplace VDC.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
