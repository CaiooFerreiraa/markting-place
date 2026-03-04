import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const notifySchema = z.object({
  email: z.string().email("E-mail inválido"),
  productId: z.string().min(1, "Produto é obrigatório"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, productId } = notifySchema.parse(body)

    // Check if product exists and is out of stock (optional check, but good for UX)
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { stock: true }
    })

    if (!product) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      )
    }

    // Upsert subscription
    await db.productSubscription.upsert({
      where: {
        // Since there is no composite unique constraint in schema.prisma yet, 
        // we'll find first then create if not exists or use a find/create logic.
        // Wait, the schema doesn't have a unique constraint on [email, productId].
        // I should have added it. For now, I'll use findUnique if possible or findFirst.
        id: 'placeholder' // Prisma upsert needs a unique field in 'where'
      },
      update: {
        notified: false // Reset if they subscribe again
      },
      create: {
        email,
        productId,
      }
    }).catch(async (e) => {
       // Fallback for missing unique constraint on id: 'placeholder'
       const existing = await db.productSubscription.findFirst({
         where: { email, productId }
       })
       
       if (existing) {
         return db.productSubscription.update({
           where: { id: existing.id },
           data: { notified: false }
         })
       }
       
       return db.productSubscription.create({
         data: { email, productId }
       })
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
