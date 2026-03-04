import Link from "next/link"
import { auth } from "@/auth"
import { LogoutButton } from "@/components/auth/logout-button"
import { CartSidebar } from "@/components/cart/cart-sidebar"
import { LayoutDashboard, User, LogOut, ShoppingBag } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export async function Header() {
  const session = await auth()

  return (
    <header className="border-b sticky top-0 bg-background z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          Marketplace VDC
        </Link>

        <nav className="flex items-center gap-4">
          <CartSidebar />
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="hidden sm:inline-block text-sm font-medium">
                    {session.user.name?.split(" ")[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Links baseados no Role */}
                {session.user.role === "ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/admin" className="cursor-pointer flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Painel Admin
                    </Link>
                  </DropdownMenuItem>
                )}

                {session.user.role === "SELLER" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/seller" className="cursor-pointer flex items-center">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Painel do Vendedor
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/seller/orders" className="cursor-pointer flex items-center">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Gerenciar Pedidos
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuItem asChild>
                  <Link href="/dashboard/buyer/orders" className="cursor-pointer flex items-center">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Meus Pedidos
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/dashboard/buyer/profile" className="cursor-pointer flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <LogoutButton />
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
