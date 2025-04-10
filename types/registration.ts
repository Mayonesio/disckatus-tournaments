export interface Registration {
  _id: string
  playerId: string
  tournamentId: string
  status: "pending" | "approved" | "rejected"
  paymentStatus: "pending" | "completed" | "refunded"
  createdAt: string
  updatedAt: string
  notes?: string
  player?: {
    _id: string
    name: string
    email: string
    imageUrl?: string
    gender?: string
    position?: string
    jerseyNumber?: number
  }
}
