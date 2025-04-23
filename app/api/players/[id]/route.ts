import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { ObjectId } from "mongodb"
import { serializePlayer } from "@/lib/utils-server"
import { generatePlayerSlug } from "@/lib/player-utils"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const playerDoc = await db.collection("players").findOne({ _id: new ObjectId(id) })

    if (!playerDoc) {
      return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 })
    }

    // Serializar el documento antes de devolverlo
    const player = serializePlayer(playerDoc)
    return NextResponse.json(player)
  } catch (error) {
    console.error("Error al obtener jugador:", error)
    return NextResponse.json({ error: "Error al obtener jugador" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Obtener el jugador actual
    const currentPlayer = await db.collection("players").findOne({ _id: new ObjectId(id) })

    if (!currentPlayer) {
      return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 })
    }

    // Verificar permisos (admin o el propio jugador)
    const isAdmin = session.user.role === "admin"
    const isOwner = currentPlayer.userId === session.user.id
    const isEmailMatch = currentPlayer.email === session.user.email

    if (!isAdmin && !isOwner && !isEmailMatch) {
      return NextResponse.json(
        {
          error: "No tienes permisos para editar este jugador",
          debug: {
            isAdmin,
            isOwner,
            isEmailMatch,
            userId: session.user.id,
            playerUserId: currentPlayer.userId,
            userEmail: session.user.email,
            playerEmail: currentPlayer.email,
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
    if (playerData.email !== currentPlayer.email) {
      const existingPlayer = await db.collection("players").findOne({
        email: playerData.email,
        _id: { $ne: new ObjectId(id) },
      })

      if (existingPlayer) {
        return NextResponse.json({ error: "Ya existe otro jugador con este email" }, { status: 400 })
      }
    }

    // Determinar qué campos puede editar cada tipo de usuario
    let updateData: Record<string, any> = {}

    // Si el usuario es propietario por email pero no tiene userId asignado, asignarlo
    if (isEmailMatch) {
      // Siempre asignar el userId si hay coincidencia de email, incluso si ya existe uno
      // Esto garantiza que el userId esté actualizado
      updateData.userId = session.user.id
    }

    if (isOwner || isEmailMatch) {
      // El propietario puede editar todos los campos de su perfil excepto el estado de federación
      updateData = {
        ...updateData,
        name: playerData.name,
        email: playerData.email,
        phone: playerData.phone,
        gender: playerData.gender,
        birthdate: playerData.birthdate,
        ultimateCentral: playerData.ultimateCentral,
        position: playerData.position,
        jerseyNumber: playerData.jerseyNumber,
        experience: playerData.experience,
        height: playerData.height,
        weight: playerData.weight,
        notes: playerData.notes,
        // No puede cambiar su propio estado de federación
      }
    }

    if (isAdmin) {
      if (isOwner || isEmailMatch) {
        // Si el admin es también el propietario, puede editar todo
        updateData = {
          ...updateData,
          ...playerData,
          // Asegurarse de que el userId se mantenga
          userId: updateData.userId || currentPlayer.userId,
        }
      } else {
        // El admin puede cambiar el estado de federación y añadir notas administrativas
        updateData = {
          ...updateData, // Mantener los cambios del propietario si los hay
          federationStatus: playerData.federationStatus,
          adminNotes: playerData.adminNotes,
        }
      }
    }

    // Asegurarse de que el userId siempre se mantenga si ya existe
    if (currentPlayer.userId && !updateData.userId) {
      updateData.userId = currentPlayer.userId
    }

    // Generar o actualizar el slug si el nombre ha cambiado
    if (updateData.name && updateData.name !== currentPlayer.name) {
      updateData.slug = generatePlayerSlug(updateData.name)
    }

    console.log("Datos de actualización:", updateData)

    const result = await db.collection("players").updateOne(
      { _id: new ObjectId(id) },
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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Verificar si el jugador está registrado en algún torneo
    const registrations = await db.collection("registrations").findOne({
      playerId: new ObjectId(id),
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
      _id: new ObjectId(id),
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
