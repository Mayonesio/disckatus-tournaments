import { ObjectId } from "mongodb"
import type { Player } from "@/types/player"

// Función para serializar un documento de MongoDB a un objeto plano
export function serializeDocument<T>(doc: any): T {
  if (!doc) return null as unknown as T

  const serialized = { ...doc }

  // Convertir _id de ObjectId a string
  if (serialized._id instanceof ObjectId) {
    serialized._id = serialized._id.toString()
  }

  // Convertir fechas a strings ISO
  for (const [key, value] of Object.entries(serialized)) {
    if (value instanceof Date) {
      serialized[key] = value.toISOString()
    }
  }

  return serialized as T
}

// Función específica para serializar un jugador
export function serializePlayer(player: any): Player {
  return serializeDocument<Player>(player)
}
