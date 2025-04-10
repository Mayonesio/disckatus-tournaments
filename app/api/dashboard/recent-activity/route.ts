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

    // Obtener el jugador asociado al usuario
    const player = await db.collection("players").findOne({
      $or: [{ userId: session.user.id }, { email: session.user.email }],
    })

    // Actividad reciente (inscripciones, torneos completados, etc.)
    const recentActivity = []

    // Obtener inscripciones recientes (globales)
    const recentRegistrations = await db.collection("registrations").find({}).sort({ createdAt: -1 }).limit(5).toArray()

    // Obtener información de jugadores y torneos para estas inscripciones
    for (const registration of recentRegistrations) {
      try {
        const regPlayer = await db.collection("players").findOne({ _id: registration.playerId })
        const tournament = await db.collection("tournaments").findOne({ _id: registration.tournamentId })

        if (regPlayer && tournament) {
          recentActivity.push({
            type: "registration",
            date: registration.createdAt ? registration.createdAt : new Date(),
            player: {
              _id: regPlayer._id.toString(),
              name: regPlayer.name,
              imageUrl: regPlayer.imageUrl,
            },
            tournament: {
              _id: tournament._id.toString(),
              title: tournament.title,
            },
            isCurrentUser: player && regPlayer._id.toString() === player._id.toString(),
          })
        }
      } catch (err) {
        console.error("Error procesando registro:", err)
        // Continuar con el siguiente registro
      }
    }

    // Obtener torneos recientemente completados
    const recentCompletedTournaments = await db
      .collection("tournaments")
      .find({ status: "Completed" })
      .sort({ end: -1 })
      .limit(3)
      .toArray()

    for (const tournament of recentCompletedTournaments) {
      try {
        recentActivity.push({
          type: "tournament_completed",
          date: tournament.end ? tournament.end : new Date(),
          tournament: {
            _id: tournament._id.toString(),
            title: tournament.title,
          },
        })
      } catch (err) {
        console.error("Error procesando torneo completado:", err)
        // Continuar con el siguiente torneo
      }
    }

    // Ordenar por fecha más reciente y manejar posibles fechas inválidas
    recentActivity.sort((a, b) => {
      try {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date || Date.now())
        const dateB = b.date instanceof Date ? b.date : new Date(b.date || Date.now())
        return dateB.getTime() - dateA.getTime()
      } catch (err) {
        return 0 // En caso de error, mantener el orden original
      }
    })

    // Serializar correctamente los datos antes de enviarlos
    const serializedActivity = recentActivity.slice(0, 10).map((activity) => {
      try {
        return {
          ...activity,
          date: activity.date instanceof Date ? activity.date.toISOString() : activity.date,
        }
      } catch (err) {
        // Si hay un error al serializar, proporcionar un objeto válido
        return {
          type: activity.type || "unknown",
          date: new Date().toISOString(),
          tournament: activity.tournament || { _id: "", title: "Desconocido" },
        }
      }
    })

    return NextResponse.json(serializedActivity)
  } catch (error) {
    console.error("Error al obtener actividad reciente:", error)
    return NextResponse.json({ error: "Error al obtener actividad reciente" }, { status: 500 })
  }
}
