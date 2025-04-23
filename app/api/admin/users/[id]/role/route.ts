import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { ObjectId } from "mongodb"
import { ROLE_PERMISSIONS, type UserRole } from "@/types/roles"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar que el usuario está autenticado y es administrador
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = params
    const { role } = await request.json()

    // Validar que el rol es válido
    if (!role || !Object.keys(ROLE_PERMISSIONS).includes(role)) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Verificar que el usuario existe
    const user = await db.collection("users").findOne({ _id: new ObjectId(id) })
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // No permitir cambiar el rol del propio administrador
    if (user._id.toString() === session.user.id && user.role === "admin" && role !== "admin") {
      return NextResponse.json({ error: "No puedes degradar tu propio rol de administrador" }, { status: 403 })
    }

    // Actualizar el rol del usuario
    const typedRole = role as UserRole // Aseguramos que el tipo sea correcto
    await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          role: typedRole,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al actualizar rol de usuario:", error)
    return NextResponse.json({ error: "Error al actualizar rol de usuario" }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar que el usuario está autenticado y es administrador
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = params
    const { db } = await connectToDatabase()

    // Obtener el usuario
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) }, { projection: { role: 1, name: 1, email: 1 } })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Obtener información del rol
    const userRole = (user.role as UserRole) || "guest"
    const roleInfo = ROLE_PERMISSIONS[userRole]

    return NextResponse.json({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: userRole,
      permissions: roleInfo.permissions,
      description: roleInfo.description,
    })
  } catch (error) {
    console.error("Error al obtener información de rol:", error)
    return NextResponse.json({ error: "Error al obtener información de rol" }, { status: 500 })
  }
}
