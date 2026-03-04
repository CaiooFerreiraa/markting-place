"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface PaymentSetupProps {
  stripeAccountId: string | null;
  chargesEnabled: boolean;
}

export function PaymentSetup({ stripeAccountId, chargesEnabled }: PaymentSetupProps) {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stripe/onboard", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to generate onboarding link");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Onboarding error:", error);
      alert("Failed to start onboarding. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isVerified = stripeAccountId && chargesEnabled;
  const isPending = stripeAccountId && !chargesEnabled;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagamentos e Repasses</CardTitle>
        <CardDescription>
          Configure sua conta Stripe para receber pagamentos pelas suas vendas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
          <div className="flex items-center gap-3">
            {isVerified ? (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            ) : isPending ? (
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            ) : (
              <AlertCircle className="w-6 h-6 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">Status da Conta</p>
              <p className="text-sm text-muted-foreground">
                {isVerified
                  ? "Sua conta está ativa e pronta para receber pagamentos."
                  : isPending
                  ? "Sua conta está em processo de verificação."
                  : "Conecte sua conta Stripe para começar."}
              </p>
            </div>
          </div>
          <Badge variant={isVerified ? "default" : isPending ? "secondary" : "outline"}>
            {isVerified ? "Verificada" : isPending ? "Pendente" : "Não Conectada"}
          </Badge>
        </div>

        {!isVerified && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-lg text-sm">
            <p>
              <strong>Por que o Stripe?</strong> Utilizamos o Stripe para garantir pagamentos seguros e 
              repasses automáticos diretamente para sua conta bancária.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {!isVerified ? (
          <Button 
            onClick={handleConnect} 
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Concluir Verificação" : "Conectar com Stripe"}
          </Button>
        ) : (
          <Button variant="outline" className="w-full sm:w-auto" disabled>
            Conta Conectada
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
