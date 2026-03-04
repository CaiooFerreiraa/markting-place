import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Não autorizado", { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user) {
      return new NextResponse("Usuário não encontrado", { status: 404 })
    }

    if (user.role !== "BUYER") {
      return new NextResponse("Somente Compradores podem fazer upgrade", { status: 400 })
    }

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        role: "SELLER",
        storeName: null, // Store setup will be handled in Phase 2
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("[PROFILE_UPGRADE_POST]", error)
    return new NextResponse("Erro Interno", { status: 500 })
  }
}
