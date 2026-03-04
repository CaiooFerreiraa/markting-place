"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Plus, Trash } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { StockNotifier } from "@/components/product/stock-notifier"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Product {
  id: string
  name: string
  priceRetail: number
  stock: number
  images: string[]
  storeId: string
}

interface ProductListProps {
  products: Product[]
  storeId: string
}

export function ProductList({ products, storeId }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="text-center p-8 border-2 border-dashed rounded-lg bg-card">
        <h3 className="text-sm font-semibold text-foreground">Nenhum produto cadastrado nesta loja</h3>
        <p className="mt-1 text-sm text-muted-foreground">Comece adicionando seu primeiro produto para começar a vender.</p>
        <div className="mt-6">
          <Button asChild>
            <Link href={`/seller/products/new?storeId=${storeId}`}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Produto
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => {
        const outOfStock = product.stock <= 0
        const mainImage = product.images?.[0] || "/placeholder-product.png"

        return (
          <Card key={product.id} className="overflow-hidden relative">
            <div className="aspect-square relative bg-muted">
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {outOfStock && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Badge variant="destructive" className="px-3 py-1">Esgotado</Badge>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm line-clamp-1">{product.name}</h4>
                  <p className="text-primary font-bold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.priceRetail)}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/seller/products/${product.id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Estoque: <span className={outOfStock ? "text-destructive font-bold" : ""}>{product.stock}</span></span>
                <Link href={`/seller/products/${product.id}/edit`} className="text-primary hover:underline">
                  Ver detalhes
                </Link>
              </div>
              {outOfStock && (
                <div className="mt-4 pt-4 border-t">
                  <StockNotifier productId={product.id} productName={product.name} />
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
