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

    // Obtener parámetros de consulta
    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const type = url.searchParams.get("type")
    const limit = Number.parseInt(url.searchParams.get("limit") || "100")

    // Construir filtro
    const filter: Record<string, any> = {}
    if (status) filter.status = status
    if (type) filter.type = type

    // Obtener torneos
    const tournaments = await db
      .collection("tournaments")
      .find(filter)
      .sort({ start: 1 }) // Ordenar por fecha de inicio
      .limit(limit)
      .toArray()

    // Serializar los documentos antes de devolverlos
    return NextResponse.json(tournaments.map((tournament) => serializeDocument<Tournament>(tournament)))
  } catch (error) {
    console.error("Error al obtener torneos:", error)
    return NextResponse.json({ error: "Error al obtener torneos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const tournamentData = await request.json()

    // Validación básica
    if (!tournamentData.title || !tournamentData.location || !tournamentData.start || !tournamentData.end) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios (título, ubicación, fecha inicio, fecha fin)" },
        { status: 400 },
      )
    }

    const { db } = await connectToDatabase()

    // Añadir campos de auditoría
    const now = new Date()
    const newTournament = {
      ...tournamentData,
      registeredPlayers: 0, // Inicializar contador de jugadores
      createdAt: now,
      updatedAt: now,
    }

    const result = await db.collection("tournaments").insertOne(newTournament)

    return NextResponse.json({
      success: true,
      _id: result.insertedId,
    })
  } catch (error) {
    console.error("Error al crear torneo:", error)
    return NextResponse.json({ error: "Error al crear torneo" }, { status: 500 })
  }
}
