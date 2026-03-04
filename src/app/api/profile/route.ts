import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const profileUpdateSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").max(100),
  storeName: z.string().max(100).optional().nullable(),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Não autorizado", { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        storeName: true,
        emailVerified: true,
      },
    })

    if (!user) {
      return new NextResponse("Usuário não encontrado", { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("[PROFILE_GET]", error)
    return new NextResponse("Erro Interno", { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Não autorizado", { status: 401 })
    }

    const body = await req.json()
    const { name, storeName } = profileUpdateSchema.parse(body)

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: { 
        name,
        // Only allow updating storeName if user is SELLER
        ...(session.user.role === "SELLER" ? { storeName } : {})
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        storeName: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.errors[0].message, { status: 400 })
    }
    console.error("[PROFILE_PATCH]", error)
    return new NextResponse("Erro Interno", { status: 500 })
  }
}
