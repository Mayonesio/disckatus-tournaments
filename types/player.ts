import type { ObjectId } from "mongodb"

export interface Player {
  _id?: ObjectId | string
  name: string
  email: string
  phone?: string
  gender: "Masculino" | "Femenino" | "Otro"
  birthdate: string | Date
  ultimateCentral?: string
  federationStatus: "Inscrito" | "Pendiente" | "No inscrito"
  notes?: string
  imageUrl?: string
  userId?: string // Referencia al usuario que puede editar este perfil
  position?: string // Posición que juega (handler, cutter, etc.)
  jerseyNumber?: number // Número de camiseta
  experience?: number // Años de experiencia
  createdAt?: Date
  updatedAt?: Date
}