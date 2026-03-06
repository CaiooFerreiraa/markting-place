"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Store } from "@/types/order";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast-hooks";
import { Loader2 } from "lucide-react";

interface CouponFormProps {
  stores: Store[];
}

export function CouponForm({ stores }: CouponFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    storeId: stores[0]?.id || "",
    discountType: "PERCENT", // "PERCENT" | "FIXED"
    discountValue: "",
    minOrderAmount: "",
    usageLimit: "",
    expiryDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/seller/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao criar cupom");
      }

      toast({
        title: "Cupom criado!",
        description: `O cupom ${formData.code.toUpperCase()} já está disponível.`,
      });

      router.push("/seller/coupons");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Erro ao criar cupom",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Criar Novo Cupom</CardTitle>
        <CardDescription>
          Defina as regras e o código do seu cupom de desconto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="code">Código do Cupom</Label>
              <Input
                id="code"
                placeholder="EX: VDC10"
                className="font-mono uppercase"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
              <p className="text-[10px] text-muted-foreground">O código que o cliente digitará no checkout.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="store">Loja Aplicável</Label>
              <Select
                value={formData.storeId}
                onValueChange={(val) => setFormData({ ...formData, storeId: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a loja" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store: any) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountType">Tipo de Desconto</Label>
              <Select
                value={formData.discountType}
                onValueChange={(val) => setFormData({ ...formData, discountType: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENT">Percentual (%)</SelectItem>
                  <SelectItem value="FIXED">Valor Fixo (R$)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountValue">Valor do Desconto</Label>
              <Input
                id="discountValue"
                type="number"
                placeholder={formData.discountType === "PERCENT" ? "10" : "5.00"}
                required
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minOrderAmount">Pedido Mínimo (Opcional)</Label>
              <Input
                id="minOrderAmount"
                type="number"
                placeholder="0.00"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usageLimit">Limite de Uso (Opcional)</Label>
              <Input
                id="usageLimit"
                type="number"
                placeholder="Ex: 100"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Data de Expiração (Opcional)</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Cupom
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
