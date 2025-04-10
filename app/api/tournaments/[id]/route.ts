import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { ObjectId } from "mongodb"
import { serializeDocument } from "@/lib/utils-server"
import type { Tournament } from "@/types/tournament"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const tournamentDoc = await db.collection("tournaments").findOne({ _id: new ObjectId(id) })

    if (!tournamentDoc) {
      return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 })
    }

    // Serializar el documento antes de devolverlo
    const tournament = serializeDocument<Tournament>(tournamentDoc)
    return NextResponse.json(tournament)
  } catch (error) {
    console.error("Error al obtener torneo:", error)
    return NextResponse.json({ error: "Error al obtener torneo" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Obtener el torneo actual
    const currentTournament = await db.collection("tournaments").findOne({ _id: new ObjectId(id) })

    if (!currentTournament) {
      return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 })
    }

    const tournamentData = await request.json()

    // Validación básica
    if (!tournamentData.title || !tournamentData.location || !tournamentData.start || !tournamentData.end) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios (título, ubicación, fecha inicio, fecha fin)" },
        { status: 400 },
      )
    }

    // Actualizar el torneo
    const result = await db.collection("tournaments").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...tournamentData,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al actualizar torneo:", error)
    return NextResponse.json({ error: "Error al actualizar torneo" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Verificar si hay inscripciones para este torneo
    const registrations = await db.collection("registrations").findOne({
      tournamentId: new ObjectId(id),
    })

    if (registrations) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar el torneo porque tiene inscripciones asociadas. Elimina primero las inscripciones.",
        },
        { status: 400 },
      )
    }

    const result = await db.collection("tournaments").deleteOne({
      _id: new ObjectId(id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar torneo:", error)
    return NextResponse.json({ error: "Error al eliminar torneo" }, { status: 500 })
  }
}
