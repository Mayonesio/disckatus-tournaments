import { NextResponse } from "next/server"
import { getPlayerByIdOrSlug } from "@/lib/player-utils"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const player = await getPlayerByIdOrSlug(id)

    if (!player) {
      return NextResponse.json({ name: "Jugador" }, { status: 404 })
    }

    return NextResponse.json({ name: player.name })
  } catch (error) {
    console.error("Error getting player name:", error)
    return NextResponse.json({ name: "Jugador" }, { status: 500 })
  }
}
