import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { ObjectId } from "mongodb"
import { serializeDocument } from "@/lib/utils-server"

// Endpoint para obtener todas las inscripciones de un torneo
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Verificar si el torneo existe
    const tournament = await db.collection("tournaments").findOne({ _id: new ObjectId(id) })

    if (!tournament) {
      return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 })
    }

    // Obtener todas las inscripciones para este torneo
    const registrations = await db
      .collection("registrations")
      .find({ tournamentId: new ObjectId(id) })
      .toArray()

    // Si no hay inscripciones, devolver un array vacío
    if (registrations.length === 0) {
      return NextResponse.json([])
    }

    // Obtener los IDs de los jugadores inscritos
    const playerIds = registrations.map((reg) => new ObjectId(reg.playerId))

    // Obtener la información de los jugadores
    const players = await db
      .collection("players")
      .find({ _id: { $in: playerIds } })
      .toArray()

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

    // Combinar las inscripciones con la información de los jugadores
    const registrationsWithPlayers = registrations.map((registration) => {
      const serialized = serializeDocument(registration) as Record<string, any>
      return {
        ...serialized,
        player: playerMap.get(registration.playerId.toString()),
      }
    })

    return NextResponse.json(registrationsWithPlayers)
  } catch (error) {
    console.error("Error al obtener inscripciones:", error)
    return NextResponse.json({ error: "Error al obtener inscripciones" }, { status: 500 })
  }
}

// Endpoint para actualizar el estado de una inscripción (solo para administradores)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const data = await request.json()
    const { registrationId, status, paymentStatus } = data

    if (!registrationId) {
      return NextResponse.json({ error: "ID de inscripción requerido" }, { status: 400 })
    }

    // Verificar si la inscripción existe
    const registration = await db.collection("registrations").findOne({
      _id: new ObjectId(registrationId),
      tournamentId: new ObjectId(id),
    })

    if (!registration) {
      return NextResponse.json({ error: "Inscripción no encontrada" }, { status: 404 })
    }

    // Preparar los campos a actualizar
    const updateFields: Record<string, any> = {
      updatedAt: new Date(),
    }

    if (status) {
      updateFields.status = status
    }

    if (paymentStatus) {
      updateFields.paymentStatus = paymentStatus
    }

    // Actualizar la inscripción
    await db.collection("registrations").updateOne({ _id: new ObjectId(registrationId) }, { $set: updateFields })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al actualizar inscripción:", error)
    return NextResponse.json({ error: "Error al actualizar inscripción" }, { status: 500 })
  }
}
