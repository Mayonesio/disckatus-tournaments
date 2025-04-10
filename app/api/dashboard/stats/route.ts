import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Obtener estadísticas generales
    const totalPlayers = await db.collection("players").countDocuments()
    const totalTournaments = await db.collection("tournaments").countDocuments()
    const totalRegistrations = await db.collection("registrations").countDocuments()

    // Obtener estadísticas del usuario actual
    const userPlayer = await db.collection("players").findOne({
      $or: [{ userId: session.user.id }, { email: session.user.email }],
    })

    const userStats = {
      tournamentsRegistered: 0,
      tournamentsCompleted: 0,
      upcomingTournaments: 0,
    }

    if (userPlayer) {
      // Contar torneos en los que está registrado
      userStats.tournamentsRegistered = await db.collection("registrations").countDocuments({
        playerId: userPlayer._id,
      })

      // Contar torneos completados
      const registrations = await db.collection("registrations").find({ playerId: userPlayer._id }).toArray()

      const tournamentIds = registrations.map((reg: { tournamentId: any }) => reg.tournamentId)

      if (tournamentIds.length > 0) {
        userStats.tournamentsCompleted = await db.collection("tournaments").countDocuments({
          _id: { $in: tournamentIds },
          status: "Completed",
        })

        userStats.upcomingTournaments = await db.collection("tournaments").countDocuments({
          _id: { $in: tournamentIds },
          status: "Upcoming",
        })
      }
    }

    return NextResponse.json({
      general: {
        totalPlayers,
        totalTournaments,
        totalRegistrations,
      },
      user: userStats,
    })
  } catch (error) {
    console.error("Error al obtener estadísticas:", error)
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 })
  }
}
