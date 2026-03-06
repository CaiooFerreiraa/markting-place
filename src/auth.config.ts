import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import { UserRole } from "@/types/order"

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as UserRole
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as UserRole
        session.user.id = token.id as string
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isSeller = nextUrl.pathname.startsWith('/seller');
      const isBuyer = nextUrl.pathname.startsWith('/buyer');
      const isAuthPage = nextUrl.pathname === '/login' || nextUrl.pathname === '/register';

      if (isDashboard || isSeller || isBuyer) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      }

      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl));
      }

      return true;
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ], // Add providers here that are Edge-compatible
} satisfies NextAuthConfig;
