import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"
import { hasPermission } from "@/types/roles"
import { UserManagement } from "@/components/admin/user-management"
import { connectToDatabase } from "@/lib/mongodb"
import { serializeDocument } from "@/lib/utils-server"

export const metadata: Metadata = {
  title: "Gestión de Usuarios | Disckatus Ultimate Madrid",
  description: "Administración de usuarios y roles",
}

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/admin/users")
  }

  // Verificar permisos
  if (!hasPermission(session.user.role as any, "manage_users")) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Acceso restringido</h2>
          <p className="mt-2">No tienes permisos para acceder a esta página</p>
        </div>
      </div>
    )
  }

  // Obtener la lista de usuarios
  const { db } = await connectToDatabase()
  const users = await db
    .collection("users")
    .find({})
    .sort({ name: 1 })
    .project({ name: 1, email: 1, role: 1, image: 1, createdAt: 1 })
    .toArray()

  // Serializar los usuarios para enviarlos al cliente
  const serializedUsers = users.map((user: any) => serializeDocument(user))

  return (
    <div className="flex-1 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
      </div>

      <div className="space-y-6">
        <UserManagement initialUsers={serializedUsers} />
      </div>
    </div>
  )
}
