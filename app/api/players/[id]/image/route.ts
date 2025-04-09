import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { ObjectId } from "mongodb"
import sharp from "sharp"

// Tamaño máximo permitido para imágenes (3MB)
const MAX_IMAGE_SIZE = 3 * 1024 * 1024
const MAX_IMAGE_DIMENSIONS = 2000 // píxeles (ancho o alto)

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  console.log("API: Iniciando procesamiento de imagen")
  try {
    const { id } = await params
    console.log("API: ID recibido:", id)

    const session = await getServerSession(authOptions)
    console.log("API: Sesión:", session ? "Activa" : "No activa", "Rol:", session?.user?.role)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    console.log("API: Conexión a base de datos establecida")

    // Obtener el jugador
    const player = await db.collection("players").findOne({ _id: new ObjectId(id) })
    console.log("API: Jugador encontrado:", player ? "Sí" : "No")

    if (!player) {
      return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 })
    }

    // Verificar permisos (admin o el propio jugador)
    const isAdmin = session.user.role === "admin"
    const isOwner = player.userId === session.user.id
    const isEmailMatch = player.email === session.user.email

    console.log("API: Verificación de permisos:", {
      isAdmin,
      isOwner,
      isEmailMatch,
      sessionUserId: session.user.id,
      playerUserId: player.userId,
      userEmail: session.user.email,
      playerEmail: player.email,
    })

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
    console.log("API: Procesando FormData")
    const formData = await request.formData()
    console.log("API: FormData recibido, claves:", [...formData.keys()])

    const image = formData.get("image") as File | null
    console.log("API: Imagen extraída:", image ? "Sí" : "No")

    if (!image) {
      return NextResponse.json({ error: "No se ha proporcionado ninguna imagen" }, { status: 400 })
    }

    console.log("API: Imagen recibida:", image.name, image.type, image.size)

    // Verificar el tamaño de la imagen
    if (image.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        {
          error: `La imagen es demasiado grande. El tamaño máximo permitido es 3MB. Tu archivo tiene ${(image.size / (1024 * 1024)).toFixed(2)}MB`,
        },
        { status: 400 },
      )
    }

    // Convertir la imagen a un buffer
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Verificar las dimensiones de la imagen
    let imageMetadata
    try {
      imageMetadata = await sharp(buffer).metadata()

      if (
        (imageMetadata.width && imageMetadata.width > MAX_IMAGE_DIMENSIONS) ||
        (imageMetadata.height && imageMetadata.height > MAX_IMAGE_DIMENSIONS)
      ) {
        return NextResponse.json(
          {
            error: `La imagen es demasiado grande. Las dimensiones máximas permitidas son ${MAX_IMAGE_DIMENSIONS}x${MAX_IMAGE_DIMENSIONS} píxeles`,
          },
          { status: 400 },
        )
      }
    } catch (metadataError) {
      console.error("API: Error al obtener metadatos de la imagen:", metadataError)
      return NextResponse.json({ error: "No se pudo procesar la imagen. Formato no compatible." }, { status: 400 })
    }

    // Usar sharp para optimizar la imagen
    console.log("API: Optimizando imagen con sharp")
    let optimizedImageBuffer
    try {
      optimizedImageBuffer = await sharp(buffer)
        .resize(400, 400, {
          // Redimensionar a un tamaño razonable
          fit: "cover",
          position: "center",
        })
        .jpeg({ quality: 85 }) // Convertir a JPEG con calidad 85%
        .toBuffer()

      console.log("API: Imagen optimizada, tamaño:", optimizedImageBuffer.length)
    } catch (sharpError) {
      console.error("API: Error al procesar la imagen con sharp:", sharpError)
      return NextResponse.json(
        {
          error: "Error al procesar la imagen. Por favor, intenta con otra imagen o en un formato diferente.",
        },
        { status: 500 },
      )
    }

    // Convertir a base64
    const base64Image = `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`
    console.log("API: Imagen convertida a base64, longitud:", base64Image.length)

    // Actualizar el jugador con la URL de la imagen
    console.log("API: Actualizando jugador en la base de datos")
    try {
      const updateResult = await db.collection("players").updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            imageUrl: base64Image,
            updatedAt: new Date(),
          },
        },
      )
      console.log("API: Resultado de la actualización:", updateResult)
    } catch (dbError) {
      console.error("API: Error al actualizar la base de datos:", dbError)
      return NextResponse.json({ error: "Error al guardar la imagen en la base de datos." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API: Error al subir la imagen:", error)
    return NextResponse.json(
      {
        error: "Error al procesar la imagen",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  console.log("API: Iniciando eliminación de imagen")
  try {
    const { id } = await params
    console.log("API: ID recibido para eliminación:", id)

    const session = await getServerSession(authOptions)
    console.log("API: Sesión para eliminación:", session ? "Activa" : "No activa")

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Obtener el jugador
    const player = await db.collection("players").findOne({ _id: new ObjectId(id) })
    console.log("API: Jugador encontrado para eliminación:", player ? "Sí" : "No")

    if (!player) {
      return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 })
    }

    // Verificar permisos (admin o el propio jugador)
    const isAdmin = session.user.role === "admin"
    const isOwner = player.userId === session.user.id
    const isEmailMatch = player.email === session.user.email

    console.log("API: Verificación de permisos para eliminación:", { isAdmin, isOwner, isEmailMatch })

    if (!isAdmin && !isOwner && !isEmailMatch) {
      return NextResponse.json({ error: "No tienes permisos para realizar esta acción" }, { status: 403 })
    }

    // Actualizar el jugador para eliminar la URL de la imagen
    console.log("API: Eliminando imagen del jugador")
    const updateResult = await db.collection("players").updateOne(
      { _id: new ObjectId(id) },
      {
        $unset: { imageUrl: "" },
        $set: { updatedAt: new Date() },
      },
    )

    console.log("API: Resultado de la eliminación:", updateResult)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API: Error al eliminar la imagen:", error)
    return NextResponse.json({ error: "Error al eliminar la imagen" }, { status: 500 })
  }
}
