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
    // But only send email if user exists and email is not verified
    if (user && !user.emailVerified) {
      // Check if there's a recent token (rate limiting - 1 email per minute)
      const recentToken = await db.verificationToken.findFirst({
        where: {
          identifier: email,
          expires: { gt: new Date() },
        },
      })

      if (recentToken) {
        return NextResponse.json(
          { error: "Email já enviado. Aguarde um momento." },
          { status: 429 }
        )
      }

      // Generate new verification token
      const token = randomBytes(32).toString("hex")
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      await db.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      })

      // Send verification email
      const resend = new Resend(process.env.RESEND_API_KEY)

      const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/verify?token=${token}`

      await resend.emails.send({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
        to: email,
        subject: "Confirme seu email - Marketplace VDC",
        html: `
          <h1>Confirme seu email</h1>
          <p>Clique no link abaixo para confirmar seu email:</p>
          <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 6px;">
            Confirmar Email
          </a>
          <p>Este link expira em 24 horas.</p>
        `,
      })
    }

    // Always return success message
    return NextResponse.json({
      message: "Se a conta existir, você receberá um email de verificação",
    })
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      { error: "Erro ao reenviar email" },
      { status: 500 }
    )
  }
}
