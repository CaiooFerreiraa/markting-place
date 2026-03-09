import Link from "next/link"
import { auth } from "@/auth"
import { LogoutButton } from "@/components/auth/logout-button"
import { CartSidebar } from "@/components/cart/cart-sidebar"
import { LayoutDashboard, User, LogOut, ShoppingBag, Search, LogIn, UserPlus, Menu } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export async function Header() {
  const session = await auth()

  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur-md z-50">
      <div className="container mx-auto flex h-16 items-center gap-2 sm:gap-4 px-4 overflow-hidden">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <ShoppingBag className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-black tracking-tight hidden xs:block">
            VDC<span className="text-primary">.place</span>
          </span>
        </Link>

        {/* Search Bar - Desktop */}
        <div className="flex-1 max-w-md mx-auto hidden md:block px-4">
          <form action="/search" method="GET" className="relative flex items-center group">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              name="q"
              placeholder="O que você está procurando hoje?"
              className="pl-10 h-10 w-full bg-muted/60 border-none rounded-full focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-sm"
            />
          </form>
        </div>

        {/* Actions */}
        <nav className="flex items-center gap-1 sm:gap-2 ml-auto shrink-0 pr-0.5">
          {/* Mobile Search Trigger */}
          <Button variant="ghost" size="icon" className="md:hidden rounded-full h-10 w-10 shrink-0" asChild>
            <Link href="/search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>

          <CartSidebar />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 sm:w-auto sm:px-3 rounded-full hover:bg-muted transition-all shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0 border-2 border-transparent">
                  <User className="h-4 w-4 text-primary" />
                </div>
                {session?.user && (
                  <span className="ml-2 hidden lg:inline-block text-sm font-semibold truncate max-w-[100px]">
                    {session.user.name?.split(" ")[0]}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64 p-2 rounded-xl shadow-xl border-muted/50">
              {session?.user ? (
                <>
                  <DropdownMenuLabel className="px-3 py-2">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-bold">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-2" />

                  {session.user.role === "ADMIN" && (
                    <DropdownMenuItem asChild className="rounded-lg h-10 cursor-pointer">
                      <Link href="/admin">
                        <LayoutDashboard className="mr-3 h-4 w-4 text-muted-foreground" />
                        Painel Administrativo
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {session.user.role === "SELLER" && (
                    <>
                      <DropdownMenuItem asChild className="rounded-lg h-10 cursor-pointer">
                        <Link href="/seller">
                          <LayoutDashboard className="mr-3 h-4 w-4 text-muted-foreground" />
                          Painel do Vendedor
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg h-10 cursor-pointer">
                        <Link href="/seller/orders">
                          <ShoppingBag className="mr-3 h-4 w-4 text-muted-foreground" />
                          Gerenciar Pedidos
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg h-10 cursor-pointer">
                        <Link href="/seller/profile">
                          <User className="mr-3 h-4 w-4 text-muted-foreground" />
                          Dados da Loja
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  {session.user.role === "BUYER" && (
                    <DropdownMenuItem asChild className="rounded-lg h-10 cursor-pointer">
                      <Link href="/buyer/profile">
                        <User className="mr-3 h-4 w-4 text-muted-foreground" />
                        Meu Perfil
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem asChild className="rounded-lg h-10 cursor-pointer">
                    <Link href="/buyer/orders">
                      <ShoppingBag className="mr-3 h-4 w-4 text-muted-foreground" />
                      Meus Pedidos
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-2" />
                  <LogoutButton />
                </>
              ) : (
                <>
                  <DropdownMenuLabel className="px-3 py-2 text-xs font-bold uppercase text-muted-foreground">
                    Bem-vindo!
                  </DropdownMenuLabel>
                  <DropdownMenuItem asChild className="rounded-lg h-10 cursor-pointer group">
                    <Link href="/login" className="flex items-center w-full">
                      <div className="mr-3 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                        <LogIn className="h-4 w-4 text-primary group-hover:text-primary-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">Entrar</span>
                        <span className="text-[10px] text-muted-foreground">Acesse sua conta</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg h-10 cursor-pointer group mt-1">
                    <Link href="/register" className="flex items-center w-full">
                      <div className="mr-3 h-8 w-8 rounded-lg bg-secondary/80 flex items-center justify-center group-hover:bg-secondary transition-colors">
                        <UserPlus className="h-4 w-4 text-secondary-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">Criar conta</span>
                        <span className="text-[10px] text-muted-foreground">Novos usuários</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  )
}
