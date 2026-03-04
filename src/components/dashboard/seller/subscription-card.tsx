"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Loader2, Zap } from "lucide-react";

interface SubscriptionCardProps {
  subscriptionStatus: string | null;
  revenueModel: string;
}

export function SubscriptionCard({ subscriptionStatus, revenueModel }: SubscriptionCardProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stripe/subscribe", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to generate subscription link");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Subscription error:", error);
      alert("Falha ao iniciar assinatura. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const isActive = subscriptionStatus === "ACTIVE";
  const isMonthlyModel = revenueModel === "MONTHLY_SUBSCRIPTION";

  if (!isMonthlyModel) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Modelo de Receita</CardTitle>
          <CardDescription>
            Atualmente você está no modelo de comissão por venda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
            <Zap className="w-6 h-6 text-yellow-500" />
            <div>
              <p className="font-medium">Comissão de 10%</p>
              <p className="text-sm text-muted-foreground">
                Cobrada automaticamente sobre cada venda realizada na plataforma.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assinatura Mensal</CardTitle>
        <CardDescription>
          Gerencie seu acesso à plataforma através do plano mensal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
          <div className="flex items-center gap-3">
            {isActive ? (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            )}
            <div>
              <p className="font-medium">Status da Assinatura</p>
              <p className="text-sm text-muted-foreground">
                {isActive
                  ? "Sua assinatura está ativa. Aproveite todos os recursos."
                  : "Sua assinatura está inativa ou pendente."}
              </p>
            </div>
          </div>
          <Badge variant={isActive ? "default" : "destructive"}>
            {isActive ? "Ativa" : "Inativa"}
          </Badge>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-lg text-sm">
          <p>
            <strong>Plano Profissional:</strong> R$ 99,90/mês para visibilidade total e 
            taxas de transação reduzidas.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        {!isActive ? (
          <Button 
            onClick={handleSubscribe} 
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assinar Agora
          </Button>
        ) : (
          <Button variant="outline" className="w-full sm:w-auto" disabled>
            Assinatura Ativa
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
