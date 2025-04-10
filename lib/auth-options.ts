import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectToDatabase } from "@/lib/mongodb"
import { compare } from "bcryptjs" // Manteniendo bcryptjs
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/mongodb"

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account", // Esto fuerza a Google a mostrar la pantalla de selección de cuenta
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

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
          role: user.role || "player",
        }
      },
    }),
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
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const { db } = await connectToDatabase()

        // Verificar si el usuario ya existe
        const existingUser = await db.collection("users").findOne({ email: user.email })

        if (!existingUser) {
          // Crear un nuevo usuario si no existe
          const newUser = {
            name: user.name,
            email: user.email,
            role: "player", // Rol por defecto según tu estructura
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          const result = await db.collection("users").insertOne(newUser)

          // Crear un perfil de jugador asociado al usuario
          const playerProfile = {
            name: user.name,
            email: user.email,
            userId: result.insertedId.toString(),
            gender: "Masculino", // Valor por defecto
            birthdate: new Date(),
            federationStatus: "No inscrito",
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          await db.collection("players").insertOne(playerProfile)
        }
      }
      return true
    },
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
