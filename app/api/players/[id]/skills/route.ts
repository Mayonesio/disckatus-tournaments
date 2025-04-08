import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { ObjectId } from "mongodb"
import { serializeDocument } from "@/lib/utils-server" // Importar desde utils-server

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const player = await db.collection("players").findOne({ _id: new ObjectId(id) }, { projection: { skills: 1 } })

    if (!player) {
      return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 })
    }

    // Serializar las habilidades antes de devolverlas
    const skills = player.skills || []
    return NextResponse.json(skills.map((skill: any) => serializeDocument(skill)))
  } catch (error) {
    console.error("Error al obtener habilidades:", error)
    return NextResponse.json({ error: "Error al obtener habilidades" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Obtener el jugador actual
    const player = await db.collection("players").findOne({ _id: new ObjectId(id) })

    if (!player) {
      return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 })
    }

    // Verificar permisos (admin o el propio jugador)
    const isAdmin = session.user.role === "admin"
    const isOwner = player.userId === session.user.id
    const isEmailMatch = player.email === session.user.email

    if (!isAdmin && !isOwner && !isEmailMatch) {
      return NextResponse.json({ error: "No tienes permisos para editar este jugador" }, { status: 403 })
    }

    const data = await request.json()
    const { skills } = data

    // Validación básica
    if (!Array.isArray(skills)) {
      return NextResponse.json({ error: "Formato de habilidades inválido" }, { status: 400 })
    }

    // Preservar las verificaciones existentes para las habilidades
    const existingSkills = player.skills || []

    const updatedSkills = skills.map((skill) => {
      const existingSkill = existingSkills.find(
        (s: { name: string; verified?: boolean; verifiedBy?: string; verifiedAt?: Date }) => s.name === skill.name,
      )

      // Si la habilidad ya estaba verificada, mantener esa información
      if (existingSkill && existingSkill.verified) {
        return {
          ...skill,
          verified: existingSkill.verified,
          verifiedBy: existingSkill.verifiedBy,
          verifiedAt: existingSkill.verifiedAt,
        }
      }

      return skill
    })

    // Actualizar las habilidades del jugador
    await db.collection("players").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          skills: updatedSkills,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al actualizar habilidades:", error)
    return NextResponse.json({ error: "Error al actualizar habilidades" }, { status: 500 })
  }
}

// Endpoint para verificar una habilidad (solo para admins)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const data = await request.json()
    const { skillName, verified } = data

    if (!skillName) {
      return NextResponse.json({ error: "Nombre de habilidad requerido" }, { status: 400 })
    }

    const player = await db.collection("players").findOne({ _id: new ObjectId(id) })

    if (!player) {
      return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 })
    }

    const skills = player.skills || []
    const skillIndex = skills.findIndex((s: any) => s.name === skillName)

    if (skillIndex === -1) {
      return NextResponse.json({ error: "Habilidad no encontrada" }, { status: 404 })
    }

    // Actualizar el estado de verificación de la habilidad
    skills[skillIndex] = {
      ...skills[skillIndex],
      verified: verified !== false, // Por defecto, verificar si no se especifica
      verifiedBy: session.user.id,
      verifiedAt: new Date(),
    }

    await db.collection("players").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          skills: skills,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al verificar habilidad:", error)
    return NextResponse.json({ error: "Error al verificar habilidad" }, { status: 500 })
  }
}
