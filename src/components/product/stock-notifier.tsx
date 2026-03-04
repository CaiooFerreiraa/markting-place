"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface StockNotifierProps {
  productId: string
  productName: string
}

export function StockNotifier({ productId, productName }: StockNotifierProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      const response = await fetch("/api/products/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, productId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Falha ao registrar notificação")
      }

      setSuccess(true)
      toast.success("Notificação ativada!", {
        description: `Enviaremos um e-mail para ${email} assim que ${productName} estiver disponível.`,
      })
    } catch (error) {
      toast.error("Erro ao ativar notificação", {
        description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
        <Bell className="h-4 w-4" />
        <span>Você será avisado quando este produto voltar ao estoque!</span>
      </div>
    )
  }

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Bell className="h-4 w-4 text-primary" />
        <span>Avise-me quando chegar</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Este produto está sem estoque no momento. Deixe seu e-mail e avisaremos quando estiver disponível.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-white"
        />
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Avisar"}
        </Button>
      </form>
    </div>
  )
}
