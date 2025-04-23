import { notFound } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { PlayerProfile } from "@/components/players/player-profile"
import { serializePlayer } from "@/lib/utils-server"
import { getPlayerByIdOrSlug, generatePlayerSlug } from "@/lib/player-utils"

interface PlayerPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const player = await getPlayerByIdOrSlug(id)
    if (player) {
      return {
        title: `${player.name} | Disckatus Ultimate Madrid`,
        description: `Perfil de jugador de ${player.name}`,
      }
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
  }

  return {
    title: "Jugador | Disckatus Ultimate Madrid",
    description: "Perfil de jugador",
  }
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
    // Use the new utility function to get player by ID or slug
    const playerDoc = await getPlayerByIdOrSlug(id)

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
    if (isEmailMatch && !player.userId && session.user.id) {
      const { db } = await connectToDatabase()
      await db
        .collection("players")
        .updateOne({ _id: new ObjectId(player._id as string) }, { $set: { userId: session.user.id } })
      // Actualizar el objeto player para reflejar el cambio
      player.userId = session.user.id
    }

    // Generate slug if not exists
    if (!player.slug && player.name) {
      const slug = generatePlayerSlug(player.name)
      const { db } = await connectToDatabase()
      await db.collection("players").updateOne({ _id: new ObjectId(player._id as string) }, { $set: { slug } })
      player.slug = slug
    }

    // Asegurarse de que _id sea string para evitar problemas de tipado
    const playerForProfile = {
      ...player,
      _id: player._id?.toString(),
    }

    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <PlayerProfile player={playerForProfile} canEdit={canEdit} />
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
