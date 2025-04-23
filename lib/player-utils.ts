import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/mongodb"
import type { Player } from "@/types/player"

// Function to generate a slug from a player name
export function generatePlayerSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with a single one
}

// Function to get player by ID or slug
export async function getPlayerByIdOrSlug(idOrSlug: string): Promise<Player | null> {
  const { db } = await connectToDatabase()

  // First try to find by ObjectId
  try {
    if (ObjectId.isValid(idOrSlug)) {
      const player = await db.collection("players").findOne({ _id: new ObjectId(idOrSlug) })
      if (player) return player as Player
    }
  } catch (error) {
    console.error("Error finding player by ID:", error)
  }

  // If not found by ID, try to find by slug
  try {
    // First try exact slug match
    const playerBySlug = await db.collection("players").findOne({ slug: idOrSlug })
    if (playerBySlug) return playerBySlug as Player

    // If not found by exact slug, try to find by name that would generate this slug
    // Create a case-insensitive regex for the slug
    const slugRegex = new RegExp(`^${idOrSlug.replace(/-/g, "[-\\s]")}$`, "i")

    // Find players whose names might match the slug pattern
    const players = await db
      .collection("players")
      .find({
        name: { $regex: slugRegex }, // Try to match by name
      })
      .toArray()

    if (players.length > 0) {
      return players[0] as Player
    }
  } catch (error) {
    console.error("Error finding player by slug:", error)
  }

  return null
}

// Function to add slugs to all players in the database
export async function addSlugsToPlayers(): Promise<void> {
  const { db } = await connectToDatabase()

  const players = await db.collection("players").find({}).toArray()

  for (const player of players) {
    if (!player.slug && player.name) {
      const slug = generatePlayerSlug(player.name)
      await db.collection("players").updateOne({ _id: player._id }, { $set: { slug } })
    }
  }
}

// Function to get a player's name from ID
export async function getPlayerNameById(id: string): Promise<string> {
  if (!id) return "Jugador"

  try {
    const { db } = await connectToDatabase()
    const player = await db.collection("players").findOne({ _id: new ObjectId(id) })
    return player?.name || "Jugador"
  } catch (error) {
    console.error("Error getting player name:", error)
    return "Jugador"
  }
}
