import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      username: string
      isVerified: boolean
    }
  }

  interface User {
    id: string
    email: string
    username: string
    isVerified: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username: string
    isVerified: boolean
  }
}
