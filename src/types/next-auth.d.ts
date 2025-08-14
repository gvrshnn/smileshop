import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    isAdmin?: boolean
  }
  
  interface User {
    isAdmin?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isAdmin?: boolean
  }
}
