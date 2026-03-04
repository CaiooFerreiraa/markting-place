import Link from "next/link"
import { auth } from "@/auth"
import { LogoutButton } from "@/components/auth/logout-button"

export async function Header() {
  const session = await auth()

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          Marketplace VDC
        </Link>

        <nav className="flex items-center gap-4">
          {session?.user ? (
            <>
              <span className="text-sm text-gray-600">
                Olá, {session.user.name || session.user.email}
              </span>
              <LogoutButton />
            </>
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
