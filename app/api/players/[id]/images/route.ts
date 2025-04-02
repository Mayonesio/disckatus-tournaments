import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { ObjectId } from "mongodb"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Obtener el jugador
    const player = await db.collection("players").findOne({ _id: new ObjectId(params.id) })

    if (!player) {
      return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 })
    }

    // Verificar permisos (admin o el propio jugador)
    const isAdmin = session.user.role === "admin"
    const isOwner = player.userId === session.user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "No tienes permisos para realizar esta acción" }, { status: 403 })
    }

    // Procesar la imagen
    const formData = await request.formData()
    const image = formData.get("image") as File

    if (!image) {
      return NextResponse.json({ error: "No se ha proporcionado ninguna imagen" }, { status: 400 })
    }

    // Aquí normalmente subirías la imagen a un servicio de almacenamiento como Cloudinary, AWS S3, etc.
    // Para este ejemplo, simularemos que la imagen se ha subido correctamente

    // En un caso real, obtendrías la URL de la imagen del servicio de almacenamiento
    const imageUrl = `/placeholder-user.jpg` // URL de ejemplo

    // Actualizar el jugador con la URL de la imagen
    await db.collection("players").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          imageUrl: imageUrl,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ success: true, imageUrl })
  } catch (error) {
    console.error("Error al subir la imagen:", error)
    return NextResponse.json({ error: "Error al procesar la imagen" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Obtener el jugador
    const player = await db.collection("players").findOne({ _id: new ObjectId(params.id) })

    if (!player) {
      return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 })
    }

    // Verificar permisos (admin o el propio jugador)
    const isAdmin = session.user.role === "admin"
    const isOwner = player.userId === session.user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "No tienes permisos para realizar esta acción" }, { status: 403 })
    }

    // Aquí normalmente eliminarías la imagen del servicio de almacenamiento

    // Actualizar el jugador para eliminar la URL de la imagen
    await db.collection("players").updateOne(
      { _id: new ObjectId(params.id) },
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

