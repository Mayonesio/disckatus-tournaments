import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { PlayerSkillsForm } from "@/components/players/player-skills-form"
import { serializePlayer } from "@/lib/utils-server" // Importar desde utils-server

export const metadata: Metadata = {
  title: "Editar Habilidades | Disckatus Ultimate Madrid",
  description: "Actualiza tus habilidades de juego",
}

interface PlayerSkillsPageProps {
  params: {
    id: string
  }
}

export default async function PlayerSkillsPage({ params }: PlayerSkillsPageProps) {
  const session = await getServerSession(authOptions)
  const id = params.id

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

    if (!isAdmin && !isOwner && !isEmailMatch) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Acceso denegado</h2>
            <p className="mt-2">No tienes permisos para editar las habilidades de este jugador</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Debug: Tu ID: {session.user.id}, ID del jugador: {player.userId || "No asignado"}
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Editar Habilidades</h1>
          <PlayerSkillsForm playerId={id} initialSkills={player.skills} />
        </div>
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
