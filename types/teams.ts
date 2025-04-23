import type { ObjectId } from "mongodb"

export interface TeamMember {
  playerId: ObjectId | string
  role: "captain" | "co-captain" | "player" | "coach"
  joinedAt: Date | string
  position?: string
  jerseyNumber?: number
}

export interface Team {
  _id?: ObjectId | string
  name: string
  description?: string
  category: "Open" | "Women" | "Mixed" | "Junior" | "Master"
  division?: string
  logoUrl?: string
  coverImageUrl?: string
  members: TeamMember[]
  createdBy: ObjectId | string
  createdAt: Date | string
  updatedAt: Date | string
  isActive: boolean
  socialMedia?: {
    website?: string
    instagram?: string
    twitter?: string
    facebook?: string
  }
  achievements?: {
    title: string
    date: Date | string
    description?: string
  }[]
}
