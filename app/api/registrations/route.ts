import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { playerId, tournamentId, notes } = await request.json()

    if (!playerId || !tournamentId) {
      return NextResponse.json({ error: "ID de jugador y torneo son obligatorios" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Obtener información del jugador y torneo
    const player = await db.collection("players").findOne({ _id: new ObjectId(playerId) })
    const tournament = await db.collection("tournaments").findOne({ _id: new ObjectId(tournamentId) })

    if (!player) {
      return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 })
    }

    if (!tournament) {
      return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 })
    }

    // Verificar restricciones de género
    if (
      (tournament.genderRestriction === "Femenino" && player.gender === "Masculino") ||
      (tournament.genderRestriction === "Open" && player.gender === "Femenino" && tournament.type !== "Fun")
    ) {
      return NextResponse.json(
        { error: "No cumples con las restricciones de género para este torneo" },
        { status: 400 },
      )
    }

    // Verificar si ya está registrado
    const existingRegistration = await db.collection("registrations").findOne({
      playerId: new ObjectId(playerId),
      tournamentId: new ObjectId(tournamentId),
    })

    if (existingRegistration) {
      return NextResponse.json({ error: "Ya estás registrado en este torneo" }, { status: 400 })
    }

    // Verificar si el torneo requiere aprobación del capitán
    const needsApproval = tournament.type === "Control" || tournament.type === "CE"

    // Crear registro
    const registration = {
      playerId: new ObjectId(playerId),
      tournamentId: new ObjectId(tournamentId),
      status: needsApproval ? "pending" : "approved",
      paymentStatus: "pending",
      notes: notes || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("registrations").insertOne(registration)

    // Actualizar contador de jugadores registrados en el torneo
    await db
      .collection("tournaments")
      .updateOne({ _id: new ObjectId(tournamentId) }, { $push: { registeredPlayers: new ObjectId(playerId) } })

    // Enviar notificación por email (implementación pendiente)

    return NextResponse.json({
      success: true,
      registration: result,
      needsApproval,
    })
  } catch (error) {
    console.error("Error al registrar jugador en torneo:", error)
    return NextResponse.json({ error: "Error al registrar jugador en torneo" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tournamentId = searchParams.get("tournamentId")
    const playerId = searchParams.get("playerId")

    const { db } = await connectToDatabase()

    let query = {}

    if (tournamentId) {
      query = { ...query, tournamentId: new ObjectId(tournamentId) }
    }

    if (playerId) {
      query = { ...query, playerId: new ObjectId(playerId) }
    }

    const registrations = await db.collection("registrations").find(query).toArray()

    // Obtener información de jugadores y torneos
    const populatedRegistrations = await Promise.all(
      registrations.map(async (registration) => {
        const player = await db.collection("players").findOne({ _id: registration.playerId })
        const tournament = await db.collection("tournaments").findOne({ _id: registration.tournamentId })

        return {
          ...registration,
          player,
          tournament,
        }
      }),
    )

    return NextResponse.json(populatedRegistrations)
  } catch (error) {
    console.error("Error al obtener registros:", error)
    return NextResponse.json({ error: "Error al obtener registros" }, { status: 500 })
  }
}

