import NextAuth, { DefaultSession, NextAuthOptions } from "next-auth"
import { JWT } from "next-auth/jwt"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcrypt"
import { connectToDatabase } from "@/lib/mongodb"

// Extender los tipos de NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"]
  }
  
  interface User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    id?: string;
  }
}

// Configuración de NextAuth con tipos
const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const { db } = await connectToDatabase()
          const user = await db.collection("users").findOne({ email: credentials.email })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await compare(credentials.password, user.password)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role || "player"
          }
        } catch (error) {
          console.error("Error en authorize:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Crear el handler de NextAuth
const handler = NextAuth(authOptions)

// Exportar los métodos GET y POST
export { handler as GET, handler as POST }