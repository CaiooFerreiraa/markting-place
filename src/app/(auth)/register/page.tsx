import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, Store } from "lucide-react"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Como deseja se cadastrar?</CardTitle>
          <CardDescription>
            Escolha o tipo de conta ideal para você
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button asChild variant="outline" className="h-24 flex flex-col gap-2">
            <Link href="/register/buyer">
              <ShoppingBag className="h-6 w-6" />
              <div className="flex flex-col items-center">
                <span>Quero Comprar</span>
                <span className="text-[10px] font-normal text-muted-foreground">Encontre produtos locais</span>
              </div>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-24 flex flex-col gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5">
            <Link href="/register/seller">
              <Store className="h-6 w-6" />
              <div className="flex flex-col items-center">
                <span>Quero Vender</span>
                <span className="text-[10px] font-normal text-muted-foreground">Crie sua loja e gerencie produtos</span>
              </div>
            </Link>
          </Button>

          <div className="mt-4 text-center text-sm">
            Já tem uma conta?{" "}
            <Link href="/login" className="underline">
              Entrar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
