import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid_token", req.url))
  }

  // Find verification token
  const verificationToken = await db.verificationToken.findUnique({
    where: { token },
  })

  if (!verificationToken) {
    return NextResponse.redirect(new URL("/login?error=invalid_token", req.url))
  }

  // Check if token is expired
  if (verificationToken.expires < new Date()) {
    return NextResponse.redirect(new URL("/login?error=token_expired", req.url))
  }

  // Find user by email
  const user = await db.user.findUnique({
    where: { email: verificationToken.identifier },
  })

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=user_not_found", req.url))
  }

  // Update user email as verified
  await db.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() },
  })

  // Delete the verification token
  await db.verificationToken.delete({
    where: { token },
  })

  // Redirect to login with verified success
  return NextResponse.redirect(new URL("/login?verified=true", req.url))
}
