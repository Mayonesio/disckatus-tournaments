import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { PlayerSkillsVerification } from "@/components/players/player-skills-verification"
import { serializePlayer } from "@/lib/utils-server"

export const metadata: Metadata = {
  title: "Verificar Habilidades | Disckatus Ultimate Madrid",
  description: "Verificar habilidades de jugadores",
}

interface VerifySkillsPageProps {
  params: Promise<{ id: string }>
}

export default async function VerifySkillsPage({ params }: VerifySkillsPageProps) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  if (!session) {
    redirect("/api/auth/signin")
  }

  // Solo los administradores pueden verificar habilidades
  if (session.user.role !== "admin") {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Acceso denegado</h2>
          <p className="mt-2">Solo los administradores pueden verificar habilidades</p>
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

    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Verificar Habilidades</h1>
          <PlayerSkillsVerification playerId={id} playerName={player.name} skills={player.skills || []} />
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
