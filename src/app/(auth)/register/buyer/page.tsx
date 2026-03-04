import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterBuyerPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <RegisterForm role="BUYER" />
    </div>
  )
}
