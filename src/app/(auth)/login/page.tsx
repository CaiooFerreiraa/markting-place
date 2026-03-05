import { LoginForm } from "@/components/auth/login-form"
import { Suspense } from "react"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}

