import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const tournaments = await db.collection("tournaments").find({}).toArray()

    return NextResponse.json(tournaments)
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
    if (!tournamentData.name || !tournamentData.date) {
      return NextResponse.json({ error: "Nombre y fecha son obligatorios" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const result = await db.collection("tournaments").insertOne({
      ...tournamentData,
      createdAt: new Date(),
      updatedAt: new Date(),
      registeredPlayers: [],
    })

    return NextResponse.json({ success: true, tournament: result })
  } catch (error) {
    console.error("Error al crear torneo:", error)
    return NextResponse.json({ error: "Error al crear torneo" }, { status: 500 })
  }
}

