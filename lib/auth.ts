import { PrismaAdapter } from "@auth/prisma-adapter"
import type { NextAuthConfig, Session, User } from "next-auth"
import type { AdapterUser } from "next-auth/adapters"
import type { JWT } from "next-auth/jwt"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

type JWTCallbackParams = {
  token: JWT & { role?: string }
  user?: User | AdapterUser
}

type SessionCallbackParams = {
  session: Session & {
    user: Session["user"] & { id?: string; role?: string }
  }
  token: JWT & { role?: string }
}

export const authOptions: NextAuthConfig = {
  // @ts-expect-error Adapter type mismatch between @auth/prisma-adapter and next-auth config
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: JWTCallbackParams) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }: SessionCallbackParams) {
      if (session?.user) {
        session.user.id = token.sub!
        session.user.role = token.role
      }
      return session
    },
  },
}