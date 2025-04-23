import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { hasPermission } from "@/types/roles"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar permisos
    if (!hasPermission(session.user.role as any, "manage_users")) {
      return NextResponse.json({ error: "No tienes permisos para gestionar usuarios" }, { status: 403 })
    }

    const { db } = await connectToDatabase()

    // Obtener todos los usuarios
    const users = await db
      .collection("users")
      .find({})
      .project({
        name: 1,
        email: 1,
        role: 1,
        image: 1,
      })
      .sort({ name: 1 })
      .toArray()

    // Formatear los usuarios para la respuesta
    const formattedUsers = users.map((user: { _id: { toString: () => any }; name: any; email: any; role: any; image: any }) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role || "player", // Rol por defecto si no tiene
      image: user.image,
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 })
  }
}
