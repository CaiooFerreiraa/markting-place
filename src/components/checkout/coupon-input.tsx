"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Ticket, X } from "lucide-react";
import { useToast } from "@/components/ui/toast-hooks";

interface CouponInputProps {
  storeId: string;
  storeName: string;
  subtotal: number;
  onApply: (coupon: any) => void;
  onRemove: () => void;
  appliedCoupon: any | null;
}

export function CouponInput({ 
  storeId, 
  storeName, 
  subtotal, 
  onApply, 
  onRemove, 
  appliedCoupon 
}: CouponInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleApply = async () => {
    if (!code) return;

    try {
      setLoading(true);
      const response = await fetch("/api/checkout/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, storeId, subtotal }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao validar cupom");
      }

      onApply(data);
      setCode("");
      toast({
        title: "Cupom aplicado!",
        description: `Desconto de ${data.discountPercent ? `${data.discountPercent}%` : `R$ ${Number(data.discountFixed).toFixed(2)}`} aplicado.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro no cupom",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-2 mt-2 bg-green-50 border border-green-200 rounded-md">
        <div className="flex items-center gap-2 text-green-700">
          <Ticket className="h-4 w-4" />
          <span className="text-xs font-bold uppercase">{appliedCoupon.code}</span>
          <span className="text-[10px]">
            ({appliedCoupon.discountPercent ? `${appliedCoupon.discountPercent}%` : `R$ ${Number(appliedCoupon.discountFixed).toFixed(2)}`})
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-green-700 hover:bg-green-100"
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-1.5">
      <Label htmlFor={`coupon-${storeId}`} className="text-[10px] uppercase text-muted-foreground font-bold">
        Cupom para {storeName}
      </Label>
      <div className="flex gap-2">
        <Input 
          id={`coupon-${storeId}`}
          placeholder="Código" 
          className="h-8 text-xs font-mono uppercase"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
        />
        <Button 
          size="sm" 
          className="h-8 px-3 text-xs"
          onClick={handleApply}
          disabled={loading || !code}
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Aplicar"}
        </Button>
      </div>
    </div>
  );
}
