import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Use matcher to only run middleware on relevant paths
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
