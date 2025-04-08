import type { ObjectId } from "mongodb"

export interface PlayerSkill {
  name: string
  value: number
  verified?: boolean
  verifiedBy?: string
  verifiedAt?: Date
}

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
  adminNotes?: string
  imageUrl?: string
  userId?: string // Referencia al usuario que puede editar este perfil
  position?: string // Posición que juega (handler, cutter, etc.)
  jerseyNumber?: number // Número de camiseta
  experience?: number // Años de experiencia
  height?: number // Altura en cm
  weight?: number // Peso en kg
  skills?: PlayerSkill[] // Habilidades del jugador
  achievements?: string[] // Logros del jugador
  teams?: string[] // Equipos en los que ha jugado
  createdAt?: Date
  updatedAt?: Date
}

