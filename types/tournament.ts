import type { ObjectId } from "mongodb"

export type TournamentType = "Fun" | "Control" | "CE" | "Entrenamiento" | "Reunión"
export type GenderRestriction = "Mixto" | "Open" | "Femenino"

export interface Tournament {
  _id?: ObjectId | string
  title: string
  description?: string
  location: string
  start: Date | string
  end: Date | string
  type: TournamentType
  genderRestriction: GenderRestriction
  maxPlayers: number
  registeredPlayers?: number
  registrationDeadline?: Date | string
  organizerName?: string
  organizerEmail?: string
  organizerPhone?: string
  fee?: number
  currency?: string
  teamFee?: number
  whatsappGroup?: string
  imageUrl?: string
  website?: string
  notes?: string
  adminNotes?: string
  status: "Upcoming" | "Ongoing" | "Completed" | "Cancelled"
  createdAt?: Date
  updatedAt?: Date
}

export interface TournamentRegistration {
  _id?: ObjectId | string
  tournamentId: ObjectId | string
  playerId: ObjectId | string
  status: "Pending" | "Confirmed" | "Cancelled"
  paymentStatus?: "Pending" | "Completed" | "Refunded"
  registrationDate: Date
  notes?: string
}
