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

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query") || ""

    const { db } = await connectToDatabase()
    
    // Crear un filtro de búsqueda si se proporciona una consulta
    const filter = query
      ? {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
          ],
        }
      : {}

    const players = await db
      .collection("players")
      .find(filter)
      .sort({ name: 1 })
      .toArray()

    return NextResponse.json(players)
  } catch (error) {
    console.error("Error al obtener jugadores:", error)
    return NextResponse.json({ error: "Error al obtener jugadores" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const playerData = await request.json()

    // Validación básica
    if (!playerData.name || !playerData.email) {
      return NextResponse.json({ error: "Nombre y email son obligatorios" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Verificar si el email ya existe
    const existingPlayer = await db.collection("players").findOne({ email: playerData.email })
    if (existingPlayer) {
      return NextResponse.json({ error: "Ya existe un jugador con este email" }, { status: 400 })
    }

    const newPlayer = {
      ...playerData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("players").insertOne(newPlayer)

    return NextResponse.json({ 
      success: true, 
      player: { 
        _id: result.insertedId,
        ...newPlayer
      } 
    })
  } catch (error) {
    console.error("Error al crear jugador:", error)
    return NextResponse.json({ error: "Error al crear jugador" }, { status: 500 })
  }
}