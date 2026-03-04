import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { BuyerProfileForm } from "@/components/profile/buyer-profile-form"

export default async function BuyerProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  // Ensure role is exactly BUYER for this page, or redirect to home
  if (user.role !== "BUYER") {
    redirect("/")
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Configurações de Perfil</h2>
      </div>
      <div className="max-w-2xl mx-auto py-10">
        <BuyerProfileForm initialData={user} />
      </div>
    </div>
  )
}
