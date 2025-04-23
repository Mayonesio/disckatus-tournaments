import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { serializeDocument } from "@/lib/utils-server"
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
    const category = url.searchParams.get("category")
    const active = url.searchParams.get("active") === "true"

    // Construir filtro
    const filter: Record<string, any> = {}
    if (category) filter.category = category
    if (active !== undefined) filter.isActive = active

    // Obtener equipos
    const teams = await db.collection("teams").find(filter).sort({ name: 1 }).toArray()

    // Serializar los documentos antes de devolverlos
    return NextResponse.json(teams.map((team: any) => serializeDocument(team)))
  } catch (error) {
    console.error("Error al obtener equipos:", error)
    return NextResponse.json({ error: "Error al obtener equipos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar permisos
    if (!hasPermission(session.user.role as any, "manage_teams")) {
      return NextResponse.json({ error: "No tienes permisos para crear equipos" }, { status: 403 })
    }

    const teamData = await request.json()

    // Validación básica
    if (!teamData.name || !teamData.category) {
      return NextResponse.json({ error: "Nombre y categoría son obligatorios" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Verificar si ya existe un equipo con el mismo nombre
    const existingTeam = await db.collection("teams").findOne({ name: teamData.name })
    if (existingTeam) {
      return NextResponse.json({ error: "Ya existe un equipo con este nombre" }, { status: 400 })
    }

    // Crear el equipo
    const now = new Date()
    const newTeam = {
      ...teamData,
      members: teamData.members || [],
      createdBy: session.user.id,
      createdAt: now,
      updatedAt: now,
      isActive: true,
    }

    const result = await db.collection("teams").insertOne(newTeam)

    return NextResponse.json({
      success: true,
      _id: result.insertedId,
    })
  } catch (error) {
    console.error("Error al crear equipo:", error)
    return NextResponse.json({ error: "Error al crear equipo" }, { status: 500 })
  }
}
