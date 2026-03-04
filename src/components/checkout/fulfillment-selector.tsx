"use client";

import { FulfillmentType } from "@prisma/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Store } from "lucide-react";

interface FulfillmentSelectorProps {
  storeName: string;
  value: FulfillmentType;
  onChange: (value: FulfillmentType) => void;
}

export function FulfillmentSelector({
  storeName,
  value,
  onChange,
}: FulfillmentSelectorProps) {
  return (
    <Card className="mb-6 overflow-hidden border-primary/20">
      <div className="bg-primary/5 px-4 py-3 border-b border-primary/10">
        <h3 className="font-semibold text-sm">Opções de entrega: {storeName}</h3>
      </div>
      <CardContent className="p-4">
        <RadioGroup
          value={value}
          onValueChange={(val) => onChange(val as FulfillmentType)}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div>
            <RadioGroupItem
              value={FulfillmentType.DELIVERY}
              id={`${storeName}-delivery`}
              className="peer sr-only"
            />
            <Label
              htmlFor={`${storeName}-delivery`}
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
            >
              <Truck className="mb-3 h-6 w-6" />
              <div className="text-center">
                <p className="font-semibold">Entrega</p>
                <p className="text-xs text-muted-foreground">Receba no seu endereço</p>
              </div>
            </Label>
          </div>

          <div>
            <RadioGroupItem
              value={FulfillmentType.PICKUP}
              id={`${storeName}-pickup`}
              className="peer sr-only"
            />
            <Label
              htmlFor={`${storeName}-pickup`}
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
            >
              <Store className="mb-3 h-6 w-6" />
              <div className="text-center">
                <p className="font-semibold">Retirada</p>
                <p className="text-xs text-muted-foreground">Retire na loja física</p>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
