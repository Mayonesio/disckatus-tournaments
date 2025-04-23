import type { ObjectId } from "mongodb"

export interface TrainingAttendance {
  playerId: ObjectId | string
  status: "confirmed" | "declined" | "pending"
  checkedIn: boolean
  checkedInAt?: Date | string
  notes?: string
}

export interface TrainingExercise {
  name: string
  description: string
  duration: number // en minutos
  type: "warm-up" | "drill" | "scrimmage" | "cool-down" | "conditioning"
  notes?: string
}

export interface Training {
  _id?: ObjectId | string
  title: string
  description?: string
  location: string
  date: Date | string
  startTime: string // formato "HH:MM"
  endTime: string // formato "HH:MM"
  teamId?: ObjectId | string // opcional, si es para un equipo específico
  type: "regular" | "special" | "tournament-prep" | "skills"
  coach: ObjectId | string // ID del entrenador
  maxAttendees?: number
  attendees: TrainingAttendance[]
  exercises: TrainingExercise[]
  notes?: string
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
  weather?: {
    condition: string
    temperature?: number
    windSpeed?: number
  }
  createdAt: Date | string
  updatedAt: Date | string
}
