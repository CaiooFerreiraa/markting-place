"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast-hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const sellerProfileSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").max(100),
  storeName: z.string().min(2, "O nome da loja deve ter pelo menos 2 caracteres").max(100),
})

type SellerProfileFormValues = z.infer<typeof sellerProfileSchema>

interface SellerProfileFormProps {
  initialData: {
    name: string | null
    email: string | null
    storeName: string | null
  }
}

export function SellerProfileForm({ initialData }: SellerProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<SellerProfileFormValues>({
    resolver: zodResolver(sellerProfileSchema),
    defaultValues: {
      name: initialData.name || "",
      storeName: initialData.storeName || "",
    },
  })

  async function onSubmit(values: SellerProfileFormValues) {
    setLoading(true)
    try {
      // Reusing the same /api/profile but it should handle storeName for sellers
      const response = await fetch("/api/profile", {
        method: "PATCH",
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Falha ao atualizar perfil")
      }

      toast({
        title: "Sucesso!",
        description: "Seu perfil de vendedor foi atualizado.",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Algo deu errado ao atualizar seu perfil.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Perfil de Vendedor</CardTitle>
          <CardDescription>
            Gerencie suas informações pessoais e dados da loja.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Email</label>
                  <Input disabled value={initialData.email || ""} />
                </div>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Vendedor</FormLabel>
                      <FormControl>
                        <Input disabled={loading} placeholder="Seu nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="storeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Loja</FormLabel>
                      <FormControl>
                        <Input disabled={loading} placeholder="Nome da sua loja" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar configurações da loja
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
