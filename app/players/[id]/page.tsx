import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { PlayerProfile } from "@/components/players/player-profile"
import { serializePlayer } from "@/lib/utils-server"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params

  try {
    const { db } = await connectToDatabase()
    const player = await db.collection("players").findOne({ _id: new ObjectId(id) })

    if (!player) {
      return {
        title: "Jugador no encontrado | Disckatus Ultimate Madrid",
      }
    }

    return {
      title: `${player.name} | Disckatus Ultimate Madrid`,
      description: `Perfil de ${player.name}, jugador de Disckatus Ultimate Madrid`,
    }
  } catch (error) {
    return {
      title: "Perfil de Jugador | Disckatus Ultimate Madrid",
    }
  }
}

interface PlayerPageProps {
  params: Promise<{ id: string }>
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Acceso restringido</h2>
          <p className="mt-2">Debes iniciar sesión para acceder a esta página</p>
        </div>
      </div>
    )
  }

  try {
    const { db } = await connectToDatabase()
    const playerDoc = await db.collection("players").findOne({ _id: new ObjectId(id) })

    if (!playerDoc) {
      notFound()
    }

    // Serializar el documento de MongoDB a un objeto Player plano
    const player = serializePlayer(playerDoc)

    // Verificar permisos (admin o el propio jugador)
    const isAdmin = session.user.role === "admin"
    const isOwner = player.userId === session.user.id
    const isEmailMatch = player.email === session.user.email
    const canEdit = isAdmin || isOwner || isEmailMatch

    // Si el usuario es propietario por email pero no tiene userId asignado, actualizarlo
    if (isEmailMatch && !player.userId) {
      await db.collection("players").updateOne({ _id: new ObjectId(id) }, { $set: { userId: session.user.id } })
      // Actualizar el objeto player para reflejar el cambio
      player.userId = session.user.id
    }

    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <PlayerProfile player={player} canEdit={canEdit} />
      </div>
    )
  } catch (error) {
    console.error("Error al cargar el jugador:", error)
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Error</h2>
          <p className="mt-2">No se pudo cargar la información del jugador</p>
        </div>
      </div>
    )
  }
}
