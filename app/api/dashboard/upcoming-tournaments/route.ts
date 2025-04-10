import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { serializeDocument } from "@/lib/utils-server"
import type { Tournament } from "@/types/tournament"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Obtener el jugador asociado al usuario
    const player = await db.collection("players").findOne({
      $or: [{ userId: session.user.id }, { email: session.user.email }],
    })

    // Obtener torneos próximos (para todos los usuarios)
    const now = new Date()
    const upcomingTournaments = await db
      .collection("tournaments")
      .find({
        start: { $gte: now },
        status: "Upcoming",
      })
      .sort({ start: 1 })
      .limit(5)
      .toArray()

    // Si el usuario tiene un perfil de jugador, verificar en cuáles está inscrito
    const registeredTournamentIds: string[] = []
    if (player) {
      const registrations = await db.collection("registrations").find({ playerId: player._id }).toArray()
      registrations.forEach((reg: { tournamentId: { toString: () => string } }) => {
        if (reg.tournamentId) {
          registeredTournamentIds.push(reg.tournamentId.toString())
        }
      })
    }

    // Añadir campo isRegistered a cada torneo
    const tournamentsWithRegistrationStatus = upcomingTournaments.map((tournament: { _id: { toString: () => string } }) => {
      // Serializar el documento y asegurarnos de que sea un objeto
      const serialized = serializeDocument<Tournament>(tournament)

      // Crear un nuevo objeto con los campos serializados y el campo isRegistered
      return {
        _id: serialized._id,
        title: serialized.title,
        description: serialized.description,
        location: serialized.location,
        start: serialized.start,
        end: serialized.end,
        type: serialized.type,
        genderRestriction: serialized.genderRestriction,
        maxPlayers: serialized.maxPlayers,
        registeredPlayers: serialized.registeredPlayers,
        registrationDeadline: serialized.registrationDeadline,
        organizerName: serialized.organizerName,
        organizerEmail: serialized.organizerEmail,
        organizerPhone: serialized.organizerPhone,
        fee: serialized.fee,
        currency: serialized.currency,
        teamFee: serialized.teamFee,
        whatsappGroup: serialized.whatsappGroup,
        website: serialized.website,
        notes: serialized.notes,
        adminNotes: serialized.adminNotes,
        status: serialized.status,
        createdAt: serialized.createdAt,
        updatedAt: serialized.updatedAt,
        isRegistered: registeredTournamentIds.includes(tournament._id.toString()),
      }
    })

    return NextResponse.json(tournamentsWithRegistrationStatus)
  } catch (error) {
    console.error("Error al obtener próximos torneos:", error)
    return NextResponse.json({ error: "Error al obtener próximos torneos" }, { status: 500 })
  }
}
