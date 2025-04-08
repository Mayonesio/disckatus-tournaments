import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { ObjectId } from "mongodb"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Obtener el jugador
    const player = await db.collection("players").findOne({ _id: new ObjectId(id) })

    if (!player) {
      return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 })
    }

    // Verificar permisos (admin o el propio jugador)
    const isAdmin = session.user.role === "admin"
    const isOwner = player.userId === session.user.id
    const isEmailMatch = player.email === session.user.email

    if (!isAdmin && !isOwner && !isEmailMatch) {
      return NextResponse.json(
        {
          error: "No tienes permisos para realizar esta acción",
          debug: {
            isAdmin,
            isOwner,
            isEmailMatch,
            sessionUserId: session.user.id,
            playerUserId: player.userId,
            userEmail: session.user.email,
            playerEmail: player.email,
          },
        },
        { status: 403 },
      )
    }

    // Procesar la imagen
    const formData = await request.formData()
    const image = formData.get("image") as File

    if (!image) {
      return NextResponse.json({ error: "No se ha proporcionado ninguna imagen" }, { status: 400 })
    }

    console.log("Imagen recibida:", image.name, image.type, image.size)

    // Convertir la imagen a base64 para almacenarla en la base de datos
    // Nota: En producción, es mejor usar un servicio de almacenamiento como Cloudinary, AWS S3, etc.
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = `data:${image.type};base64,${buffer.toString("base64")}`

    console.log("Imagen convertida a base64, longitud:", base64Image.length)

    // Actualizar el jugador con la URL de la imagen
    const updateResult = await db.collection("players").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          imageUrl: base64Image,
          updatedAt: new Date(),
        },
      },
    )

    console.log("Resultado de la actualización:", updateResult)

    return NextResponse.json({ success: true, imageUrl: base64Image })
  } catch (error) {
    console.error("Error al subir la imagen:", error)
    return NextResponse.json(
      {
        error: "Error al procesar la imagen",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Obtener el jugador
    const player = await db.collection("players").findOne({ _id: new ObjectId(id) })

    if (!player) {
      return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 })
    }

    // Verificar permisos (admin o el propio jugador)
    const isAdmin = session.user.role === "admin"
    const isOwner = player.userId === session.user.id
    const isEmailMatch = player.email === session.user.email

    if (!isAdmin && !isOwner && !isEmailMatch) {
      return NextResponse.json({ error: "No tienes permisos para realizar esta acción" }, { status: 403 })
    }

    // Actualizar el jugador para eliminar la URL de la imagen
    await db.collection("players").updateOne(
      { _id: new ObjectId(id) },
      {
        $unset: { imageUrl: "" },
        $set: { updatedAt: new Date() },
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar la imagen:", error)
    return NextResponse.json({ error: "Error al eliminar la imagen" }, { status: 500 })
  }
}
