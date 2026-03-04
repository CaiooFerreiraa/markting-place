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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast-hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const profileSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").max(100),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface BuyerProfileFormProps {
  initialData: {
    name: string | null
    email: string | null
    role: string
  }
}

export function BuyerProfileForm({ initialData }: BuyerProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [upgrading, setUpgrading] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData.name || "",
    },
  })

  async function onSubmit(values: ProfileFormValues) {
    setLoading(true)
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Falha ao atualizar perfil")
      }

      toast({
        title: "Sucesso!",
        description: "Seu perfil foi atualizado.",
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

  async function onUpgradeToSeller() {
    setUpgrading(true)
    try {
      const response = await fetch("/api/profile/upgrade-to-seller", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Falha ao atualizar para vendedor")
      }

      toast({
        title: "Parabéns!",
        description: "Você agora é um vendedor! Redirecionando...",
      })
      router.push("/seller/dashboard")
      router.refresh()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível realizar o upgrade.",
        variant: "destructive",
      })
    } finally {
      setUpgrading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Perfil de Comprador</CardTitle>
          <CardDescription>
            Gerencie suas informações pessoais e conta.
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
                <div className="space-y-1">
                  <label className="text-sm font-medium">Cargo</label>
                  <Input disabled value={initialData.role} />
                </div>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input disabled={loading} placeholder="Seu nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar alterações
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>Torne-se um Vendedor</CardTitle>
          <CardDescription>
            Deseja vender seus produtos no marketplace? Migre sua conta agora.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary hover:text-white"
            onClick={onUpgradeToSeller}
            disabled={upgrading}
          >
            {upgrading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Fazer upgrade para Vendedor
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
