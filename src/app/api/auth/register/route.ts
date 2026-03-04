import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { db } from "@/lib/db"
import { z } from "zod"
import { randomBytes } from "crypto"
import { Resend } from "resend"

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["BUYER", "SELLER"]).optional().default("BUYER"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password, role } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email já está em uso" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user with specific role
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role,
      },
    })

    // Generate verification token
    const token = randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await db.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    // Send verification email via Resend
    const resend = new Resend(process.env.RESEND_API_KEY)

    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/verify?token=${token}`

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: email,
      subject: "Confirme seu email - Marketplace VDC",
      html: `
        <h1>Bem-vindo ao Marketplace VDC!</h1>
        <p>Olá ${name},</p>
        <p>Obrigado por se registrar. Por favor, confirme seu email clicando no link abaixo:</p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 6px;">
          Confirmar Email
        </a>
        <p>Este link expira em 24 horas.</p>
        <p>Se você não criou esta conta, ignore este email.</p>
      `,
    })

    return NextResponse.json(
      { message: "Conta criada com sucesso" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Erro ao criar conta" },
      { status: 500 }
    )
  }
}
