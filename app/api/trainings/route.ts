import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { serializeDocument } from "@/lib/utils-server"
import { ObjectId } from "mongodb"
import { hasPermission } from "@/types/roles"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Obtener parámetros de consulta
    const url = new URL(request.url)
    const teamId = url.searchParams.get("teamId")
    const status = url.searchParams.get("status")
    const from = url.searchParams.get("from")
    const to = url.searchParams.get("to")

    // Construir filtro
    const filter: Record<string, any> = {}
    if (teamId) filter.teamId = new ObjectId(teamId)
    if (status) filter.status = status

    // Filtrar por rango de fechas
    if (from || to) {
      filter.date = {}
      if (from) filter.date.$gte = new Date(from)
      if (to) filter.date.$lte = new Date(to)
    }

    // Obtener entrenamientos
    const trainings = await db.collection("trainings").find(filter).sort({ date: 1, startTime: 1 }).toArray()

    // Serializar los documentos antes de devolverlos
    return NextResponse.json(trainings.map((training: any) => serializeDocument(training)))
  } catch (error) {
    console.error("Error al obtener entrenamientos:", error)
    return NextResponse.json({ error: "Error al obtener entrenamientos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar permisos
    if (!hasPermission(session.user.role as any, "manage_trainings")) {
      return NextResponse.json({ error: "No tienes permisos para crear entrenamientos" }, { status: 403 })
    }

    const trainingData = await request.json()

    // Validación básica
    if (
      !trainingData.title ||
      !trainingData.location ||
      !trainingData.date ||
      !trainingData.startTime ||
      !trainingData.endTime
    ) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Crear el entrenamiento
    const now = new Date()
    const newTraining = {
      ...trainingData,
      date: new Date(trainingData.date),
      coach: session.user.id,
      attendees: trainingData.attendees || [],
      exercises: trainingData.exercises || [],
      status: "scheduled",
      createdAt: now,
      updatedAt: now,
    }

    // Si se especifica un equipo, convertir el ID a ObjectId
    if (trainingData.teamId) {
      newTraining.teamId = new ObjectId(trainingData.teamId)
    }

    const result = await db.collection("trainings").insertOne(newTraining)

    return NextResponse.json({
      success: true,
      _id: result.insertedId,
    })
  } catch (error) {
    console.error("Error al crear entrenamiento:", error)
    return NextResponse.json({ error: "Error al crear entrenamiento" }, { status: 500 })
  }
}
