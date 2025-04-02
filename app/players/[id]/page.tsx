import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { PlayerProfile } from "@/components/players/player-profile"

export const metadata: Metadata = {
  title: "Perfil de Jugador | Disckatus Ultimate Madrid",
  description: "Detalles del perfil de jugador",
}

interface PlayerPageProps {
  params: {
    id: string
  }
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const session = await getServerSession(authOptions)

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
    const player = await db.collection("players").findOne({ _id: new ObjectId(params.id) })

    if (!player) {
      notFound()
    }

    // Determinar si el usuario actual puede editar este perfil
    const canEdit = session.user.role === "admin" || (player.userId && player.userId === session.user.id)

    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <PlayerProfile player={JSON.parse(JSON.stringify(player))} canEdit={canEdit} />
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

