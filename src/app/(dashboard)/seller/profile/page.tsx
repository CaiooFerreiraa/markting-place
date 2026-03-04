import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { SellerProfileForm } from "@/components/profile/seller-profile-form"

export default async function SellerProfilePage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "SELLER") {
    redirect("/")
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      storeName: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Perfil do Vendedor</h2>
      </div>
      <div className="max-w-2xl mx-auto py-10">
        <SellerProfileForm initialData={user} />
      </div>
    </div>
  )
}
