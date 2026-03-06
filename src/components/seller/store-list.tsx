"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Store as StoreIcon, MapPin, Clock, Package } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface OperatingHours {
  [key: string]: { open: string; close: string; closed?: boolean }
}

interface StoreWithCounts {
  id: string
  name: string
  slug: string
  city: string
  state: string
  operatingHours: any
  _count: {
    products: number
  }
}

interface StoreListProps {
  stores: StoreWithCounts[]
}

export function StoreList({ stores }: StoreListProps) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const isOpen = (operatingHours: any) => {
    if (!operatingHours) return false

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayName = days[now.getDay()]
    const hours = operatingHours as OperatingHours
    const today = hours[dayName]

    if (!today || today.closed) return false

    const [openH, openM] = today.open.split(':').map(Number)
    const [closeH, closeM] = today.close.split(':').map(Number)

    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const openMinutes = openH * 60 + openM
    const closeMinutes = closeH * 60 + closeM

    return currentMinutes >= openMinutes && currentMinutes < closeMinutes
  }

  if (stores.length === 0) {
    return (
      <div className="text-center p-8 border-2 border-dashed rounded-lg">
        <StoreIcon className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-semibold text-foreground">Nenhuma loja encontrada</h3>
        <p className="mt-1 text-sm text-muted-foreground">Comece criando sua primeira loja.</p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/seller/stores/new">Criar Loja</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {stores.map((store: any) => {
        const open = isOpen(store.operatingHours)
        return (
          <Card key={store.id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold">{store.name}</CardTitle>
              <Badge variant={open ? "default" : "destructive"}>
                {open ? "Aberta" : "Fechada"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  {store.city}, {store.state}
                </div>
                <div className="flex items-center">
                  <Package className="mr-2 h-4 w-4" />
                  {store._count.products} produtos
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Horário de hoje: {
                    (() => {
                      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
                      const hours = (store.operatingHours as OperatingHours)?.[days[now.getDay()]]
                      return hours && !hours.closed ? `${hours.open} - ${hours.close}` : "Fechado"
                    })()
                  }
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href={`/seller/dashboard?store=${store.id}`}>
                    Gerenciar Produtos
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/seller/stores/${store.slug}/edit`}>
                    Editar Loja
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
