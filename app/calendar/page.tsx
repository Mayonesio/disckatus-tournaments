import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { connectToDatabase } from "@/lib/mongodb"
import { TournamentCalendar } from "@/components/tournaments/tournament-calendar"
import { serializeDocument } from "@/lib/utils-server"
import type { Tournament } from "@/types/tournament"

export const metadata: Metadata = {
  title: "Calendario | Disckatus Ultimate Madrid",
  description: "Calendario de torneos y eventos de Disckatus Ultimate Madrid",
}

export default async function CalendarPage() {
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
    const tournamentsData = await db
      .collection("tournaments")
      .find({})
      .sort({ start: 1 }) // Ordenar por fecha de inicio
      .toArray()

    // Serializar los documentos de MongoDB a objetos planos
    const tournaments = tournamentsData.map((tournament: any) => serializeDocument<Tournament>(tournament))

    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Calendario</h1>
          <TournamentCalendar initialTournaments={tournaments} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error al cargar torneos para el calendario:", error)
    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Calendario</h1>
          <TournamentCalendar />
        </div>
      </div>
    )
  }
}
