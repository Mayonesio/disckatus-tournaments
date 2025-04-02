import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { ObjectId } from "mongodb"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const player = await db.collection("players").findOne({ _id: new ObjectId(params.id) })

    if (!player) {
      return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 })
    }

    return NextResponse.json(player)
  } catch (error) {
    console.error("Error al obtener jugador:", error)
    return NextResponse.json({ error: "Error al obtener jugador" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Obtener el jugador actual
    const currentPlayer = await db.collection("players").findOne({ _id: new ObjectId(params.id) })

    if (!currentPlayer) {
      return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 })
    }

    // Verificar permisos (admin o el propio jugador)
    const isAdmin = session.user.role === "admin"
    const isOwner = currentPlayer.userId === session.user.id

    console.log("Verificación de permisos:", {
      isAdmin,
      isOwner,
      userId: session.user.id,
      playerUserId: currentPlayer.userId,
    })

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        {
          error: "No tienes permisos para editar este jugador",
          debug: {
            isAdmin,
            isOwner,
            userId: session.user.id,
            playerUserId: currentPlayer.userId,
          },
        },
        { status: 403 },
      )
    }

    const playerData = await request.json()

    // Validación básica
    if (!playerData.name || !playerData.email) {
      return NextResponse.json({ error: "Nombre y email son obligatorios" }, { status: 400 })
    }

    // Verificar si el email ya existe en otro jugador
    const existingPlayer = await db.collection("players").findOne({
      email: playerData.email,
      _id: { $ne: new ObjectId(params.id) },
    })

    if (existingPlayer) {
      return NextResponse.json({ error: "Ya existe otro jugador con este email" }, { status: 400 })
    }

    // Si el usuario es un jugador normal (no admin), limitar los campos que puede editar
    let updateData = playerData

    if (!isAdmin) {
      // Los jugadores normales solo pueden editar ciertos campos
      updateData = {
        phone: playerData.phone,
        ultimateCentral: playerData.ultimateCentral,
        position: playerData.position,
        jerseyNumber: playerData.jerseyNumber,
        experience: playerData.experience,
        notes: playerData.notes,
      }
    }

    const result = await db.collection("players").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al actualizar jugador:", error)
    return NextResponse.json({ error: "Error al actualizar jugador" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Verificar si el jugador está registrado en algún torneo
    const registrations = await db.collection("registrations").findOne({
      playerId: new ObjectId(params.id),
    })

    if (registrations) {
      return NextResponse.json(
        {
          error: "No se puede eliminar el jugador porque está registrado en torneos",
        },
        { status: 400 },
      )
    }

    const result = await db.collection("players").deleteOne({
      _id: new ObjectId(params.id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar jugador:", error)
    return NextResponse.json({ error: "Error al eliminar jugador" }, { status: 500 })
  }
}

