import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { randomBytes } from "crypto"
import { Resend } from "resend"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      )
    }

    // Find user
    const user = await db.user.findUnique({
      where: { email },
    })

    // Always return success to not reveal if user exists
    // But only send email if user exists
    if (user) {
      // Generate reset token
      const token = randomBytes(32).toString("hex")
      const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await db.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      })

      // Send reset email
      const resend = new Resend(process.env.RESEND_API_KEY)

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`

      await resend.emails.send({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
        to: email,
        subject: "Redefinir sua senha - Marketplace VDC",
        html: `
          <h1>Redefinir senha</h1>
          <p>Clique no link abaixo para redefinir sua senha:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 6px;">
            Redefinir Senha
          </a>
          <p>Este link expira em 1 hora.</p>
          <p>Se você não solicitou isso, ignore este email.</p>
        `,
      })
    }

    // Always return success message
    return NextResponse.json({
      message: "Se a conta existir, você receberá um email com instruções",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Erro ao processar solicitação" },
      { status: 500 }
    )
  }
}
