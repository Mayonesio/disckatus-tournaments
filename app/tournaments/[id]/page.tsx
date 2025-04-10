import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { TournamentDetail } from "@/components/tournaments/tournament-detail"
import { serializeDocument } from "@/lib/utils-server"
import type { Tournament } from "@/types/tournament"
import type { Registration } from "@/types/registration"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params

  try {
    const { db } = await connectToDatabase()
    const tournament = await db.collection("tournaments").findOne({ _id: new ObjectId(id) })

    if (!tournament) {
      return {
        title: "Torneo no encontrado | Disckatus Ultimate Madrid",
      }
    }

    return {
      title: `${tournament.title} | Disckatus Ultimate Madrid`,
      description: tournament.description || `Detalles del torneo ${tournament.title}`,
    }
  } catch (error) {
    return {
      title: "Torneo | Disckatus Ultimate Madrid",
    }
  }
}

interface TournamentPageProps {
  params: Promise<{ id: string }>
}

export default async function TournamentPage({ params }: TournamentPageProps) {
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
    const tournamentDoc = await db.collection("tournaments").findOne({ _id: new ObjectId(id) })

    if (!tournamentDoc) {
      notFound()
    }

    // Serializar el documento de MongoDB a un objeto Tournament plano
    const tournament = serializeDocument<Tournament>(tournamentDoc)

    // Obtener las inscripciones para este torneo
    const registrationsData = await db
      .collection("registrations")
      .find({ tournamentId: new ObjectId(id) })
      .toArray()

    // Obtener los IDs de los jugadores inscritos
    const playerIds = registrationsData.map((reg: { playerId: number }) => new ObjectId(reg.playerId))

    // Obtener la información de los jugadores si hay inscripciones
    let players: any[] = []
    if (playerIds.length > 0) {
      players = await db
        .collection("players")
        .find({ _id: { $in: playerIds } })
        .toArray()
    }

    // Crear un mapa de jugadores para acceso rápido
    const playerMap = new Map()
    players.forEach((player) => {
      playerMap.set(player._id.toString(), {
        _id: player._id.toString(),
        name: player.name,
        email: player.email,
        imageUrl: player.imageUrl,
        gender: player.gender,
        position: player.position,
        jerseyNumber: player.jerseyNumber,
      })
    })

    // Serializar manualmente las inscripciones y añadir la información de los jugadores
    const registrations: Registration[] = registrationsData.map((registration: any) => {
      // Convertir explícitamente los ObjectId a strings
      const playerIdStr = registration.playerId.toString()
      const tournamentIdStr = registration.tournamentId.toString()

      return {
        _id: registration._id.toString(),
        playerId: playerIdStr,
        tournamentId: tournamentIdStr,
        status: registration.status || "pending",
        paymentStatus: registration.paymentStatus || "pending",
        createdAt: registration.createdAt ? registration.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: registration.updatedAt ? registration.updatedAt.toISOString() : new Date().toISOString(),
        notes: registration.notes || "",
        player: playerMap.get(playerIdStr),
      } as Registration
    })

    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <TournamentDetail tournament={tournament} registrations={registrations} />
      </div>
    )
  } catch (error) {
    console.error("Error al cargar el torneo:", error)
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Error</h2>
          <p className="mt-2">No se pudo cargar la información del torneo</p>
        </div>
      </div>
    )
  }
}
