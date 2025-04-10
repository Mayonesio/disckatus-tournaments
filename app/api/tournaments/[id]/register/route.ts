import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { ObjectId } from "mongodb"
import { serializeDocument } from "@/lib/utils-server"

// Endpoint para inscribirse en un torneo
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    // Obtener el jugador asociado al usuario
    const player = await db.collection("players").findOne({
      $or: [{ userId: session.user.id }, { email: session.user.email }],
    })

    if (!player) {
      return NextResponse.json({ error: "No se encontró un perfil de jugador asociado a tu cuenta" }, { status: 400 })
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
      playerId: new ObjectId(player._id),
      tournamentId: new ObjectId(id),
    })

    if (existingRegistration) {
      return NextResponse.json({ error: "Ya estás registrado en este torneo" }, { status: 400 })
    }

    // Verificar si el torneo está lleno
    // Modificar la verificación de si el torneo está lleno para que siempre trate registeredPlayers como un número
    // Verificar si el torneo está lleno
    if ((tournament.registeredPlayers || 0) >= tournament.maxPlayers) {
      return NextResponse.json({ error: "El torneo está completo" }, { status: 400 })
    }

    // Verificar si el torneo ya pasó
    if (new Date(tournament.end) < new Date()) {
      return NextResponse.json({ error: "El torneo ya ha finalizado" }, { status: 400 })
    }

    // Verificar si el torneo está cancelado
    if (tournament.status === "Cancelled") {
      return NextResponse.json({ error: "El torneo ha sido cancelado" }, { status: 400 })
    }

    // Verificar si el torneo requiere aprobación del capitán
    const needsApproval = tournament.type === "Control" || tournament.type === "CE"

    // Crear registro
    const registration = {
      playerId: new ObjectId(player._id),
      tournamentId: new ObjectId(id),
      status: needsApproval ? "pending" : "approved",
      paymentStatus: "pending",
      notes: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("registrations").insertOne(registration)

    // Actualizar el torneo según la estructura existente
    // Modificar la actualización del torneo para que siempre incremente registeredPlayers como un número
    // Actualizar el contador de jugadores registrados en el torneo
    await db.collection("tournaments").updateOne({ _id: new ObjectId(id) }, { $inc: { registeredPlayers: 1 } })

    return NextResponse.json({
      success: true,
      registration: serializeDocument(registration),
      needsApproval,
    })
  } catch (error) {
    console.error("Error al inscribirse en el torneo:", error)
    return NextResponse.json({ error: "Error al procesar la inscripción" }, { status: 500 })
  }
}

// Endpoint para cancelar la inscripción en un torneo
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    // Obtener el jugador asociado al usuario
    const player = await db.collection("players").findOne({
      $or: [{ userId: session.user.id }, { email: session.user.email }],
    })

    if (!player) {
      return NextResponse.json({ error: "No se encontró un perfil de jugador asociado a tu cuenta" }, { status: 400 })
    }

    // Verificar si el usuario está inscrito
    const registration = await db.collection("registrations").findOne({
      playerId: new ObjectId(player._id),
      tournamentId: new ObjectId(id),
    })

    if (!registration) {
      return NextResponse.json({ error: "No estás inscrito en este torneo" }, { status: 400 })
    }

    // Verificar si el torneo ya pasó
    if (new Date(tournament.end) < new Date()) {
      return NextResponse.json(
        { error: "No puedes cancelar la inscripción de un torneo que ya ha finalizado" },
        { status: 400 },
      )
    }

    // Eliminar la inscripción
    await db.collection("registrations").deleteOne({
      playerId: new ObjectId(player._id),
      tournamentId: new ObjectId(id),
    })

    // Actualizar el torneo según la estructura existente
    // En la función DELETE, modificar la actualización del torneo para que siempre decremente registeredPlayers como un número
    // Decrementar el contador de jugadores registrados en el torneo
    await db.collection("tournaments").updateOne({ _id: new ObjectId(id) }, { $inc: { registeredPlayers: -1 } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al cancelar la inscripción:", error)
    return NextResponse.json({ error: "Error al procesar la cancelación" }, { status: 500 })
  }
}

// Endpoint para verificar si el usuario está inscrito en un torneo
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Obtener el jugador asociado al usuario
    const player = await db.collection("players").findOne({
      $or: [{ userId: session.user.id }, { email: session.user.email }],
    })

    if (!player) {
      return NextResponse.json({ isRegistered: false, registration: null })
    }

    // Verificar si el usuario está inscrito
    const registration = await db.collection("registrations").findOne({
      playerId: new ObjectId(player._id),
      tournamentId: new ObjectId(id),
    })

    return NextResponse.json({
      isRegistered: !!registration,
      registration: registration ? serializeDocument(registration) : null,
    })
  } catch (error) {
    console.error("Error al verificar inscripción:", error)
    return NextResponse.json({ error: "Error al verificar inscripción" }, { status: 500 })
  }
}
