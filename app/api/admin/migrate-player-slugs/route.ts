import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { addSlugsToPlayers } from "@/lib/player-utils"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins can run this migration
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await addSlugsToPlayers()

    return NextResponse.json({
      success: true,
      message: "Slugs added to all players successfully",
    })
  } catch (error) {
    console.error("Error migrating player slugs:", error)
    return NextResponse.json({ error: "Error migrating player slugs" }, { status: 500 })
  }
}
